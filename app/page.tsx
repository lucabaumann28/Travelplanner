import Link from "next/link";

export default function Home() {
  return (
    <section className="relative overflow-hidden glass-panel px-8 py-16 text-center">
      <div className="absolute inset-x-10 -top-32 h-72 rounded-full bg-[radial-gradient(circle_at_top,#4BA3FF33,transparent)] blur-3xl" />
      <div className="relative mx-auto max-w-3xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-ink/60">
          Sanft. Schnell. Smart.
        </span>
        <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-ink md:text-6xl">
          Reiseplanung, neu gedacht – im <span className="text-brand">Apple-Style</span>.
        </h1>
        <p className="mt-5 text-lg text-ink/70">
          Plane in Sekunden eine komplette Reise mit Zeitplanung, Budget und Highlights.
          TripMVP sorgt für klare Strukturen, elegante Karten und teilbare Ergebnisse.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/create" className="btn-primary">
            Jetzt Plan erstellen
          </Link>
          <Link href="/login" className="btn-secondary">
            Anmelden
          </Link>
        </div>

        <div className="surface-card mt-14 p-6 md:p-10">
          <div className="relative h-[360px] overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br from-white/60 via-white/20 to-brand/10 shadow-inner">
            <div className="absolute inset-6 rounded-3xl border border-white/40 bg-white/65 backdrop-blur-xl" />
            <div className="relative z-10 grid h-full place-items-center text-sm font-medium text-ink/55">
              Interaktive Karten-Preview erscheint hier in Kürze
            </div>
          </div>
        </div>
      </div>

        <div className="relative mt-14 grid gap-4 text-sm text-ink/60 md:grid-cols-3">
          {["DSGVO-freundlich", "Sofort startklar", "Für Desktop & Mobile optimiert"].map((item) => (
            <div key={item} className="glass-panel px-6 py-4 text-center">
              {item}
            </div>
          ))}
        </div>
    </section>
  );
}
