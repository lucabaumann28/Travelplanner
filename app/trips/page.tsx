import Link from "next/link";

export default function Trips() {
  return (
    <section className="glass-panel px-8 py-10 text-center">
      <div className="mx-auto max-w-2xl space-y-4">
        <span className="inline-flex items-center rounded-full border border-white/70 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-ink/60">
          Coming soon
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-ink">
          Deine Trips sammeln sich hier
        </h1>
        <p className="text-sm text-ink/60">
          Sobald du Pläne speicherst, erscheinen sie in einer eleganten Übersicht mit Coverbildern,
          Fortschritt und Favoriten – ganz wie im Apple Reisealbum.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link href="/explore" className="btn-secondary">
            Ziele entdecken
          </Link>
          <Link href="/create" className="btn-primary">
            Plan erstellen
          </Link>
        </div>
      </div>
    </section>
  );
}
