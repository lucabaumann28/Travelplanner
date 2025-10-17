"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const MONTHS = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

const INTERESTS = [
  "Kultur",
  "Natur",
  "Food",
  "Nachtleben",
  "Kunst",
  "Architektur",
  "Shopping",
  "Familie",
  "Outdoor",
  "Sport",
  "Geschichte",
  "Entspannung",
  "Sehenswürdigkeiten",
];

const CITY_SUGGESTIONS = [
  "Berlin",
  "Barcelona",
  "New York City",
  "Paris",
  "Rom",
  "London",
  "Athen",
  "Lissabon",
  "Istanbul",
  "Dubai",
  "Bangkok",
  "Tokio",
  "Sydney",
];

type PillProps = {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
};

function Pill({ active, children, onClick, disabled = false }: PillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`pill relative select-none px-4 py-2 text-sm
        ${active ? "active" : ""}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <span className="pr-4">{children}</span>
      {active && (
        <span aria-hidden className="absolute right-1 top-1 text-[11px] leading-none">
          ✓
        </span>
      )}
    </button>
  );
}

export default function CreatePage() {
  const router = useRouter();

  const [city, setCity] = useState("");
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);

  const [selectedDays, setSelectedDays] = useState<number | null>(null);
  const [customDays, setCustomDays] = useState<string>("");

  const [month, setMonth] = useState("");

  const [budget, setBudget] = useState<number>(1000);
  const [noBudget, setNoBudget] = useState<boolean>(false);

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [surpriseMe, setSurpriseMe] = useState<boolean>(false);

  const [notes, setNotes] = useState("");

  const days = useMemo(() => {
    if (customDays) {
      const n = Number(customDays);
      return Number.isFinite(n) && n >= 1 && n <= 30 ? n : null;
    }
    return selectedDays;
  }, [selectedDays, customDays]);

  const isValid = city.trim().length > 0 && !!days && month !== "";

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

    if (!noBudget) q.set("budget", String(budget));
    if (surpriseMe) q.set("surprise", "1");

    router.push(`/plan/test?${q.toString()}`);
  }

  return (
    <section className="glass-panel mx-auto max-w-5xl px-8 py-12">
      <div className="mb-12 flex flex-col items-center gap-4 text-center">
        <span className="inline-flex items-center rounded-full border border-white/70 bg-white/80 px-5 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-ink/60">
          Dein Reise-Setup
        </span>
        <h1 className="text-4xl font-semibold tracking-tight text-ink">
          Reiseplan erstellen
        </h1>
        <p className="max-w-2xl text-sm text-ink/60">
          Wähle Destination, Dauer, Budget und Interessen. TripMVP baut daraus deinen individuellen Apple-inspirierten Reiseplan mit Karten, Zeiten und Highlights.
        </p>
      </div>

      <form onSubmit={onSubmit} className="grid gap-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="surface-card space-y-3 px-6 py-6">
            <label className="block">Reiseziel</label>
            <div className="relative">
              <input
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setShowCitySuggestions(true);
                }}
                onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
                placeholder="z. B. Barcelona"
                autoComplete="off"
              />
              {showCitySuggestions && city.length > 0 && (
                <div className="surface-card absolute inset-x-0 top-full z-20 mt-2 max-h-56 overflow-auto rounded-3xl border border-white/70">
                  {CITY_SUGGESTIONS.filter((c) =>
                    c.toLowerCase().includes(city.toLowerCase())
                  ).map((c) => (
                    <div
                      key={c}
                      onMouseDown={() => {
                        setCity(c);
                        setShowCitySuggestions(false);
                      }}
                      className="cursor-pointer px-5 py-2 text-sm transition hover:bg-white/80"
                    >
                      {c}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-ink/45">
              Tippe ein paar Buchstaben für Vorschläge aus beliebten Städten.
            </p>
          </div>

          <div className="surface-card space-y-4 px-6 py-6">
            <div className="flex items-center justify-between">
              <label className="block">Reisezeitraum</label>
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/45">
                {month ? month : "Bitte wählen"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {MONTHS.map((m) => (
                <Pill key={m} active={month === m} onClick={() => setMonth(m)}>
                  {m}
                </Pill>
              ))}
            </div>
          </div>
        </div>

        <div className="surface-card space-y-4 px-6 py-6">
          <div className="flex items-center justify-between">
            <label>Dauer (Tage)</label>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/45">
              {days ? `Gewählt: ${days}` : "Bitte wählen"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[[1,2],[3,4],[5,6],[7,8],[9,10],[11,12],[13,14]].flat().map((d) => (
              <Pill
                key={d}
                active={selectedDays === d && !customDays}
                onClick={() => {
                  setSelectedDays(d);
                  setCustomDays("");
                }}
              >
                {d} Tage
              </Pill>
            ))}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="number"
              min={1}
              max={30}
              value={customDays}
              onChange={(e) => setCustomDays(e.target.value)}
              placeholder="Eigene Tageszahl (1–30)"
              className="w-full sm:w-64"
            />
            <span className="text-xs text-ink/45">
              Individuelle Eingabe überschreibt die Auswahl oben.
            </span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="surface-card space-y-4 px-6 py-6">
            <label className="block">Budget (gesamt)</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={10}
                max={5000}
                step={20}
                value={noBudget ? 10 : budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                disabled={noBudget}
                className="flex-1"
              />
              <span className={`text-sm font-medium ${noBudget ? "text-ink/30" : "text-ink/70"}`}>
                {new Intl.NumberFormat("de-DE", {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 0,
                }).format(budget)}
              </span>
            </div>
            <label className="inline-flex items-center gap-2 text-xs font-medium normal-case text-ink/60">
              <input
                type="checkbox"
                checked={noBudget}
                onChange={(e) => setNoBudget(e.target.checked)}
                className="h-4 w-4 rounded border"
              />
              Kein fixes Budget
            </label>
          </div>

          <div className="surface-card space-y-4 px-6 py-6">
            <label className="block">Überrasch mich</label>
            <p className="text-xs text-ink/45">
              Du willst, dass wir dich mit neuen Ideen überraschen? Wir priorisieren Inspiration über bekannte Favoriten.
            </p>
            <label className="inline-flex items-center gap-2 text-sm font-medium normal-case text-ink/70">
              <input
                type="checkbox"
                checked={surpriseMe}
                onChange={(e) => setSurpriseMe(e.target.checked)}
                className="h-4 w-4 rounded border"
              />
              Aktivieren
            </label>
          </div>
        </div>

        <div className="surface-card space-y-4 px-6 py-6">
          <div className="flex items-center justify-between">
            <label className="block">Interessen</label>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/45">
              bis zu 6 auswählen
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((interest) => (
              <Pill
                key={interest}
                active={selectedInterests.includes(interest)}
                onClick={() => toggleInterest(interest)}
                disabled={surpriseMe}
              >
                {interest}
              </Pill>
            ))}
          </div>
        </div>

        <div className="surface-card space-y-3 px-6 py-6">
          <label className="block">Besondere Hinweise</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="z. B. Allergien, Anreisefenster, Must-See"
          />
          <p className="text-xs text-ink/45">
            Wir berücksichtigen diese Hinweise bei der Planung deiner Tage.
          </p>
        </div>

        <div className="flex justify-center pt-4">
          <button
            type="submit"
            className="btn-primary min-w-[220px] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!isValid}
          >
            Plan generieren
          </button>
        </div>
      </form>
    </section>
  );
}
