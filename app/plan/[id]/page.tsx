import Link from "next/link";
import { Inter } from "next/font/google";
import ExportPdf from "../../../components/ExportPdf";
import PlanMap from "../../../components/PlanMap";

const inter = Inter({ subsets: ["latin"], display: "swap" });

type SearchParamRecord = { [key: string]: string | string[] | undefined };

type PlanPageProps = {
  params: { id: string };
  // <<< WICHTIG: In Next.js 15 sind searchParams asynchron
  searchParams: Promise<SearchParamRecord>;
};

type ApiResponse = {
  plan_id: string | null;
  demo_used: boolean;
  error_hint?: string;
  center: { lat: number; lon: number } | null;
  prompt_preview?: { system: string; user: string };
  raw_ai_message?: string;
  plan_json_preview?: {
    title?: string;
    days?: {
      day_index: number;
      note?: string | null;
      activities?: {
        title: string;
        category: "sight" | "food" | "activity" | "transport" | "other";
        start?: string | null;
        end?: string | null;
        cost_estimate?: number | null;
        lat?: number | null;
        lon?: number | null;
        notes?: string | null;
      }[];
    }[];
  };
};

const BASE = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

type GeneratePlanPayload = {
  destination: string;
  days: number;
  month?: string;
  travelStart?: string;
  travelEnd?: string;
  budgetAmount?: number;
  budgetLevel?: "low" | "medium" | "high";
  interests?: string[];
  surprise?: boolean;
  notes?: string;
  language?: string;
  includePrompt?: boolean;
};

async function callGenerateAPI(payload: GeneratePlanPayload): Promise<ApiResponse> {
  const res = await fetch(`${BASE}/api/plan/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text || "request failed"}`);
  }
  return (await res.json()) as ApiResponse;
}

function renderPlanHtmlFromJson(api: ApiResponse | null, fallbackCity: string, fallbackDays: number) {
  const plan = api?.plan_json_preview;
  if (!plan || !Array.isArray(plan.days) || plan.days.length === 0) {
    const parts: string[] = [];
    parts.push(`<h1>${fallbackDays} Tage in ${fallbackCity}</h1>`);
    parts.push(`<p><strong>Ziel:</strong> ${fallbackCity}</p>`);
    for (let i = 1; i <= fallbackDays; i++) {
      parts.push(`<h2>Tag ${i}</h2>`);
      parts.push(`<ul>
        <li>Vormittag: Spaziergang</li>
        <li>Mittagessen: Lokales Restaurant</li>
        <li>Nachmittag: Museum</li>
        <li>Abend: Aussichtspunkt</li>
      </ul>`);
    }
    return parts.join("\n");
  }

  const out: string[] = [];
  out.push(`<h1>${plan.title ?? `${fallbackDays} Tage in ${fallbackCity}`}</h1>`);
  out.push(`<p><strong>Ziel:</strong> ${fallbackCity}</p>`);

  const sortedDays = [...plan.days].sort((a, b) => (a.day_index || 0) - (b.day_index || 0));
  for (const d of sortedDays) {
    out.push(`<h2>Tag ${d.day_index}</h2>`);
    if (d.note) out.push(`<p>${d.note}</p>`);
    if (Array.isArray(d.activities) && d.activities.length > 0) {
      out.push("<ul>");
      for (const a of d.activities) {
        const time = (a.start ? `${a.start}` : "") + (a.end ? `–${a.end}` : a.start ? "" : "");
        const price = typeof a.cost_estimate === "number" ? ` · ~${a.cost_estimate}€` : "";
        out.push(
          `<li>${time ? `<strong>${time}</strong> · ` : ""}${a.title}${price}${
            a.notes ? ` — <em>${a.notes}</em>` : ""
          }</li>`
        );
      }
      out.push("</ul>");
    }
  }
  out.push(`<p>© ${new Date().getFullYear()} TripMVP · Built with ❤️</p>`);
  return out.join("\n");
}

export default async function PlanPage({ searchParams }: PlanPageProps) {
  // --- Next 15 Fix: searchParams zuerst awaiten ---
  const sp = await searchParams;

  const get = (key: string) => (typeof sp[key] === "string" ? (sp[key] as string) : Array.isArray(sp[key]) ? (sp[key] as string[])[0] : undefined);

  const city = (get("city") || "").trim() || "Barcelona";
  const days = Number(get("days") || "") || 3;
  const month = get("month") || undefined;

  const budgetStr = get("budget");
  const budgetAmount = budgetStr ? Number(budgetStr) : undefined;

  const interests = (get("interests") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const travelStart = get("ts") || undefined;
  const travelEnd = get("te") || undefined;
  const notes = (get("notes") || "").trim() || undefined;
  const surprise = (get("surprise") || "").toLowerCase() === "1" || (get("surprise") || "").toLowerCase() === "true";

  const payload: GeneratePlanPayload = {
    destination: city,
    days,
    includePrompt: true,
    month,
    travelStart,
    travelEnd,
    notes,
    surprise,
    interests: surprise ? [] : interests,
  };
  if (typeof budgetAmount === "number" && !Number.isNaN(budgetAmount)) {
    payload.budgetAmount = budgetAmount;
  }

  let api: ApiResponse | null = null;
  let apiError: string | null = null;
  try {
    api = await callGenerateAPI(payload);
  } catch (error: unknown) {
    apiError = error instanceof Error ? error.message : String(error);
  }

  const center = api?.center ?? null;
  const planHtml = renderPlanHtmlFromJson(api, city, days);

  const showNotice = Boolean(apiError || api?.demo_used || api?.error_hint);

  return (
    <main className={`${inter.className} min-h-screen bg-white`}>
      <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/80 border-b border-zinc-200">
        <div className="mx-auto max-w-3xl px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold tracking-tight">TripMVP</Link>
          <Link href="/create" className="rounded-xl border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50 transition">
            Plan erstellen
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-3xl border border-zinc-200 shadow-sm p-6 md:p-8">
          {showNotice && (
            <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <strong>Hinweis:</strong>{" "}
              {apiError ? `API-Fehler: ${apiError}` : api?.error_hint ? `Diagnose: ${api.error_hint}` : "Demo-Plan aktiv."}
            </div>
          )}

          <article
            id="plan-article"
            className="prose prose-zinc max-w-none prose-h1:mb-2 prose-h1:text-3xl md:prose-h1:text-4xl prose-h2:mt-8 prose-h2:mb-2 prose-p:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: planHtml }}
          />

          <div className="mt-8">
            <PlanMap city={city} center={center ?? undefined} height={360} />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/create" className="rounded-2xl bg-black text-white px-4 py-2 text-sm md:text-base hover:opacity-90 transition">
              Neuen Plan erstellen
            </Link>
            <ExportPdf targetId="plan-article" fileName={`Reiseplan-${city}.pdf`} />
          </div>

          <details className="mt-6">
            <summary className="cursor-pointer text-sm text-zinc-600">API Response anzeigen (Debug)</summary>
            <pre className="mt-3 text-xs overflow-auto p-3 bg-zinc-50 border rounded-xl">
{JSON.stringify({ payload, api, apiError }, null, 2)}
            </pre>
          </details>
        </div>
      </section>

      <footer className="border-t border-zinc-200">
        <div className="mx-auto max-w-3xl px-4 py-6 text-sm text-zinc-500">
          © {new Date().getFullYear()} TripMVP
        </div>
      </footer>
    </main>
  );
}
