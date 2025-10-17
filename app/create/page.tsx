"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const MONTHS = [
  "Januar","Februar","März","April","Mai","Juni",
  "Juli","August","September","Oktober","November","Dezember",
];

const INTERESTS = [
  "Kultur","Natur","Food","Nachtleben","Kunst","Architektur",
  "Shopping","Familie","Outdoor","Sport","Geschichte","Entspannung","Sehenswürdigkeiten",
];

const CITY_SUGGESTIONS = [
  "Berlin","Barcelona","New York City","Paris","Rom","London","Athen","Lissabon","Istanbul","Dubai","Bangkok","Tokio","Sydney"
];

function Pill({
  active,
  children,
  onClick,
  disabled = false,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`relative px-3 py-1.5 rounded-2xl border text-sm select-none
        ${active ? "bg-black text-white border-black" : "border-zinc-300 hover:bg-zinc-50"}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <span className="pr-4">{children}</span>
      {active && (
        <span aria-hidden className="absolute right-1 top-1 text-[11px] leading-none">✓</span>
      )}
    </button>
  );
}

export default function CreatePage() {
  const router = useRouter();

  // Ziel + Vorschläge
  const [city, setCity] = useState("");
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);

  // Dauer
  const [selectedDays, setSelectedDays] = useState<number | null>(null); // 1..14
  const [customDays, setCustomDays] = useState<string>("");             // 1..30

  // Monat
  const [month, setMonth] = useState("");

  // Budget (10–5000 in 20er-Schritten) + "Keine Angabe"
  const [budget, setBudget] = useState<number>(1000);
  const [noBudget, setNoBudget] = useState<boolean>(false);

  // Interessen + Überraschung
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [surpriseMe, setSurpriseMe] = useState<boolean>(false);

  // Hinweise
  const [notes, setNotes] = useState("");

  // finale Tage: custom > pill
  const days = useMemo(() => {
    if (customDays) {
      const n = Number(customDays);
      return Number.isFinite(n) && n >= 1 && n <= 30 ? n : null;
    }
    return selectedDays;
  }, [selectedDays, customDays]);

  const isValid = city.trim().length > 0 && !!days && month !== "";

  // Zeitraum aus Monat + Tagen ableiten
  function computeDates(): { ts: string; te: string } {
    const year = new Date().getFullYear();
    const idx = MONTHS.indexOf(month);
    const start = new Date(Date.UTC(year, idx, 1));
    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + (days! - 1));
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    return { ts: iso(start), te: iso(end) };
  }

  function toggleInterest(name: string) {
    setSelectedInterests((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    const { ts, te } = computeDates();
    const interests = surpriseMe ? ["Überraschung"] : selectedInterests;

    const q = new URLSearchParams({
      city: city.trim(),
      days: String(days!),
      month,
      interests: interests.join(","),
      ts,
      te,
      notes,
    });

    if (!noBudget) q.set("budget", String(budget)); // nur senden, wenn nicht „Keine Angabe“
    if (surpriseMe) q.set("surprise", "1");

    router.push(`/plan/test?${q.toString()}`);
  }

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-4xl font-bold tracking-tight mb-8">Reiseplan erstellen</h1>

        <form onSubmit={onSubmit} className="space-y-8">
          {/* Ziel */}
          <div>
            <label className="block text-sm font-medium mb-2">Ziel</label>
            <input
              value={city}
              onChange={(e) => { setCity(e.target.value); setShowCitySuggestions(true); }}
              onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
              placeholder="z. B. Barcelona"
              className="w-full rounded-2xl border border-zinc-300 px-4 py-2.5"
              autoComplete="off"
            />
            {showCitySuggestions && city.length > 0 && (
              <div className="mt-2 border rounded-xl bg-white shadow-sm max-h-56 overflow-auto">
                {CITY_SUGGESTIONS
                  .filter((c) => c.toLowerCase().includes(city.toLowerCase()))
                  .map((c) => (
                    <div
                      key={c}
                      onMouseDown={() => { setCity(c); setShowCitySuggestions(false); }}
                      className="px-4 py-2 cursor-pointer hover:bg-zinc-100"
                    >
                      {c}
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Dauer */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Dauer (Tage)</label>
              <span className="text-sm text-zinc-600">
                {days ? `Gewählt: ${days} Tage` : "Bitte wählen"}
              </span>
            </div>

            {/* in Pärchen 1–2, 3–4, … 13–14 */}
            <div className="space-y-2">
              {[[1,2],[3,4],[5,6],[7,8],[9,10],[11,12],[13,14]].map(([a,b]) => (
                <div key={`${a}-${b}`} className="flex flex-wrap gap-2">
                  {[a,b].map((d) => (
                    <Pill
                      key={d}
                      active={selectedDays === d && !customDays}
                      onClick={() => { setSelectedDays(d); setCustomDays(""); }}
                    >
                      {d}
                    </Pill>
                  ))}
                </div>
              ))}
            </div>

            {/* Individuelle Dauer */}
            <div className="mt-3">
              <input
                type="number"
                min={1}
                max={30}
                value={customDays}
                onChange={(e) => setCustomDays(e.target.value)}
                placeholder="Individuelle Dauer (1–30 Tage)"
                className="w-60 rounded-2xl border border-zinc-300 px-4 py-2.5"
              />
            </div>
          </div>

          {/* Monat */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Reisezeitraum (Monat)</label>
              <span className="text-sm text-zinc-600">
                {month ? `Gewählt: ${month}` : "Bitte wählen"}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MONTHS.map((m) => (
                <Pill key={m} active={month === m} onClick={() => setMonth(m)}>
                  {m}
                </Pill>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Budget für Aktivitäten</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setNoBudget((v) => !v)}
                  className={`rounded-xl px-3 py-1.5 text-sm border ${
                    noBudget ? "bg-black text-white border-black" : "border-zinc-300 hover:bg-zinc-50"
                  }`}
                >
                  {noBudget ? "Keine Angabe ✓" : "Keine Angabe"}
                </button>
                {!noBudget && (
                  <span className="text-sm tabular-nums">
                    {new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(budget)}
                  </span>
                )}
              </div>
            </div>

            <input
              type="range"
              min={10}
              max={5000}
              step={20}
              value={noBudget ? 10 : budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              disabled={noBudget}
              className="w-full"
            />
            <div className={`flex justify-between text-[11px] mt-1 ${noBudget ? "text-zinc-400" : "text-zinc-500"}`}>
              <span>10 €</span>
              <span>5.000 €</span>
            </div>
          </div>

          {/* Interessen */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Interessen</label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={surpriseMe}
                  onChange={(e) => setSurpriseMe(e.target.checked)}
                />
                Ich möchte die Stadt einfach kennenlernen / lass mich überraschen
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((name) => (
                <Pill
                  key={name}
                  active={selectedInterests.includes(name)}
                  onClick={() => toggleInterest(name)}
                  disabled={surpriseMe}
                >
                  {name}
                </Pill>
              ))}
            </div>
          </div>

          {/* Hinweise */}
          <div>
            <label className="block text-sm font-medium mb-2">Sonstige Hinweise</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="z. B. früh starten, glutenfrei, kinderwagenfreundlich …"
              className="w-full rounded-2xl border border-zinc-300 px-4 py-2.5"
              rows={3}
            />
          </div>

          <button
            type="submit"
            disabled={!isValid}
            className={`rounded-2xl px-4 py-2 text-white transition ${
              isValid ? "bg-black hover:opacity-90" : "bg-zinc-400 cursor-not-allowed"
            }`}
          >
            Plan erzeugen
          </button>
        </form>
      </section>
    </main>
  );
}
