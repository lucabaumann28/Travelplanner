import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { z } from "zod";

/** Eingaben aus dem Onboarding / UI */
const schema = z.object({
  destination: z.string().min(2),
  days: z.number().int().min(1).max(30),

  month: z.string().optional(),
  travelStart: z.string().optional(), // YYYY-MM-DD
  travelEnd: z.string().optional(),

  // an UI angepasst (10..5000)
  budgetAmount: z.number().min(10).max(5000).optional(),
  budgetLevel: z.enum(["low", "medium", "high"]).optional(),

  interests: z.array(z.string()).optional(),
  surprise: z.boolean().optional(),

  notes: z.string().optional(),
  language: z.string().optional(),

  includePrompt: z.boolean().optional(),
});

/** deterministischer Demo-Plan */
function buildDemoPlan(destination: string, days: number) {
  const actPool = [
    { title: "Altstadt-Spaziergang", category: "sight" as const },
    { title: "Beliebtes Café", category: "food" as const },
    { title: "Aussichtspunkt", category: "sight" as const },
    { title: "Lokales Restaurant", category: "food" as const },
    { title: "Parks & Gärten", category: "activity" as const },
    { title: "ÖPNV-Transfer", category: "transport" as const },
  ];
  const out: any = { title: `Demo-Plan für ${destination}`, days: [] as any[] };
  for (let i = 1; i <= days; i++) {
    const activities = [
      { ...actPool[(i + 0) % actPool.length], start: "09:00", end: "11:00", cost_estimate: 0, lat: null, lon: null, notes: null },
      { ...actPool[(i + 1) % actPool.length], start: "12:00", end: "13:30", cost_estimate: 15, lat: null, lon: null, notes: null },
      { ...actPool[(i + 2) % actPool.length], start: "15:00", end: "17:00", cost_estimate: 0, lat: null, lon: null, notes: null },
    ];
    out.days.push({ day_index: i, note: `Tag ${i} – Demo-Inhalte`, activities });
  }
  return out;
}

/** City-Center via Mapbox holen (robust) */
async function geocodeCityCenter(query: string) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || process.env.MAPBOX_TOKEN;
  if (!token) return { lat: null, lon: null, raw: null };
  try {
    const url =
      `https://api.mapbox.com/geocoding/v5/mapbox.places/` +
      `${encodeURIComponent(query)}.json` +
      `?access_token=${token}` +
      `&limit=1&language=de,en` +
      `&types=place,locality,region`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return { lat: null, lon: null, raw: null };
    const data = await res.json();
    const feat = data?.features?.[0];
    const [lon, lat] = feat?.center ?? [];
    if (typeof lat === "number" && typeof lon === "number") return { lat, lon, raw: feat };
    return { lat: null, lon: null, raw: null };
  } catch {
    return { lat: null, lon: null, raw: null };
  }
}

/** Fallback-Zentrum aus Aktivitäten (Mittelpunkt) */
function centerFromActivities(planJson: any): { lat: number; lon: number } | null {
  try {
    const coords: { lat: number; lon: number }[] = [];
    for (const d of planJson?.days ?? []) {
      for (const a of d?.activities ?? []) {
        if (typeof a?.lat === "number" && typeof a?.lon === "number") {
          coords.push({ lat: a.lat, lon: a.lon });
        }
      }
    }
    if (coords.length === 0) return null;
    const lat = coords.reduce((s, c) => s + c.lat, 0) / coords.length;
    const lon = coords.reduce((s, c) => s + c.lon, 0) / coords.length;
    return { lat, lon };
  } catch {
    return null;
  }
}

/** Prompt bauen */
function buildPrompt(destination: string, days: number, input: z.infer<typeof schema>) {
  const lang = (input.language || "de").toLowerCase().startsWith("en") ? "en" : "de";
  const system = `You are a precise travel planner. Always output VALID JSON only and follow this schema strictly:
{
  "title": string,
  "days": [
    {
      "day_index": number,
      "note": string,
      "activities": [
        {
          "title": string,
          "category": "sight"|"food"|"activity"|"transport"|"other",
          "start": "HH:MM",
          "end": "HH:MM",
          "cost_estimate": number|null,
          "lat": number|null,
          "lon": number|null,
          "notes": string|null
        }
      ]
    }
  ]
}
Hard constraints:
- The plan MUST be for the city "${destination}" and contain EXACTLY ${days} days (1..${days}).
- Times must be realistic (opening hours, travel buffers).
- Cluster geographically to reduce travel time.
- Respect interests and budget (amount/level) if given.
- Provide indoor alternatives for rain.
- If known, add lat/lon for major sights or restaurants (else null).
- Language for all text: ${lang === "en" ? "English" : "German"}.
- Do NOT include any commentary outside the JSON.`;

  const lines: string[] = [];
  lines.push(`Destination: ${destination}`);
  lines.push(`Duration: ${days} days`);
  if (input.month) lines.push(`Travel month: ${input.month}`);
  if (input.travelStart) lines.push(`Travel start: ${input.travelStart}`);
  if (input.travelEnd) lines.push(`Travel end: ${input.travelEnd}`);

  const budgetLine: string[] = [];
  if (typeof input.budgetAmount === "number") budgetLine.push(`Budget amount ~EUR ${Math.round(input.budgetAmount)}`);
  if (input.budgetLevel) budgetLine.push(`Budget level ${input.budgetLevel}`);
  if (budgetLine.length) lines.push(budgetLine.join(" | "));

  if (input.surprise) {
    lines.push(`User intent: general city discovery without specific interests. Create a balanced, varied mix across landmarks, neighborhoods, culture, hidden gems and food.`);
  } else if (input.interests?.length) {
    lines.push(`Interests: ${input.interests.join(", ")}`);
  }

  if (input.notes) lines.push(`Additional notes: ${input.notes}`);

  return { system, user: lines.join("\n") };
}

export async function POST(req: NextRequest) {
  // ENV prüfen
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const DEV_ALLOW_NO_AUTH = String(process.env.DEV_ALLOW_NO_AUTH || "").toLowerCase() === "true";
  if (!SUPABASE_URL || !SUPABASE_ANON) {
    return NextResponse.json(
      { error: "supabase_env_missing", hint: "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY fehlen in .env.local" },
      { status: 500 }
    );
  }

  // Body validieren
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;
  const { destination, days } = input;

  // Auth (optional im DEV)
  const authHeader = req.headers.get("authorization") || "";
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, { global: { headers: { Authorization: authHeader } } });
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthed = !!user;
  if (!isAuthed && !DEV_ALLOW_NO_AUTH) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Center (Mapbox)
  const geocoded = await geocodeCityCenter(destination);

  // OpenAI / Demo
  const DEMO = String(process.env.DEMO_MODE || "").toLowerCase() === "true";
  let planJson: any = null;
  let demoUsed = false;
  let errorHint: string | undefined;
  let rawAiMessage: string | undefined;

  const { system, user: userPrompt } = buildPrompt(destination, days, input);

  if (!DEMO) {
    const OPENAI_KEY = process.env.OPENAI_API_KEY;
    if (OPENAI_KEY && OPENAI_KEY.startsWith("sk-")) {
      try {
        const openai = new OpenAI({ apiKey: OPENAI_KEY });
        const res = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: system },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.3,
        });

        rawAiMessage = res.choices?.[0]?.message?.content?.trim();
        if (!rawAiMessage) {
          errorHint = "empty_ai_response";
          demoUsed = true;
          planJson = buildDemoPlan(destination, days);
        } else {
          try {
            planJson = JSON.parse(rawAiMessage);
            if (!planJson || !Array.isArray(planJson.days)) {
              errorHint = "parsed_but_missing_days";
              demoUsed = true;
              planJson = buildDemoPlan(destination, days);
            }
          } catch (parseErr: any) {
            errorHint = `invalid_json_from_ai: ${String(parseErr?.message || parseErr)}`;
            demoUsed = true;
            planJson = buildDemoPlan(destination, days);
          }
        }
      } catch (e: any) {
        errorHint = `openai_failed: ${e?.status ?? ""} ${e?.message ?? ""}`.trim();
        demoUsed = true;
        planJson = buildDemoPlan(destination, days);
      }
    } else {
      errorHint = "missing_openai_key";
      demoUsed = true;
      planJson = buildDemoPlan(destination, days);
    }
  } else {
    errorHint = "demo_mode";
    demoUsed = true;
    planJson = buildDemoPlan(destination, days);
  }

  // Falls Mapbox kein Zentrum liefert: Mittelpunkt aus AI-Aktivitäten
  let center = (geocoded?.lat && geocoded?.lon) ? { lat: geocoded.lat, lon: geocoded.lon } : null;
  if (!center) {
    const c = centerFromActivities(planJson);
    if (c) center = c;
  }

  // DB (nur wenn eingeloggt)
  let planId: string | null = null;
  if (isAuthed) {
    const { data: plan, error: planErr } = await supabase
      .from("plans")
      .insert({ user_id: user!.id, title: planJson.title ?? `Trip nach ${destination}`, destination })
      .select("id")
      .single();

    if (planErr || !plan) {
      return NextResponse.json({ error: "plan_insert", details: planErr?.message }, { status: 500 });
    }
    planId = plan.id;

    const dayRows = (planJson.days ?? []).map((d: any) => ({
      plan_id: planId,
      day_index: d.day_index ?? 1,
      note: d.note ?? null,
    }));

    const { data: insertedDays, error: daysErr } = await supabase
      .from("plan_days")
      .insert(dayRows)
      .select("id, day_index");

    if (daysErr) {
      return NextResponse.json({ error: "days_insert", details: daysErr.message }, { status: 500 });
    }

    const map = new Map<number, string>();
    insertedDays?.forEach((r: any) => map.set(r.day_index, r.id));

    const acts: any[] = [];
    for (const d of planJson.days ?? []) {
      const pid = map.get(d.day_index);
      for (const a of d.activities ?? []) {
        acts.push({
          plan_day_id: pid,
          title: a.title,
          category: ["sight", "food", "activity", "transport", "other"].includes(a.category) ? a.category : "other",
          start_time: a.start ?? null,
          end_time: a.end ?? null,
          cost_estimate: a.cost_estimate ?? null,
          notes: a.notes ?? null,
          lat: a.lat ?? null,
          lon: a.lon ?? null,
        });
      }
    }

    if (acts.length) {
      try {
        const { error: actErr } = await supabase.from("activities").insert(acts);
        if (actErr) console.error("activities_insert error:", actErr.message);
      } catch (e) {
        console.error("activities_insert exception:", e);
      }
    }
  }

  // Antwort mit Diagnosefeldern
  return NextResponse.json(
    {
      plan_id: planId,
      demo_used: demoUsed,
      error_hint: errorHint,
      center: center ? { lat: center.lat, lon: center.lon } : null,
      prompt_preview: input.includePrompt ? { system, user: userPrompt } : undefined,
      raw_ai_message: rawAiMessage ? String(rawAiMessage).slice(0, 2000) : undefined, // Debug-Hilfe
      plan_json_preview: planJson,
    },
    { status: 200 }
  );
}
