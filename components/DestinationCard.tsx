type Props = { name: string; country: string; price: string; img?: string };

export default function DestinationCard({ name, country, price, img }: Props) {
  return (
    <article className="surface-card group overflow-hidden transition duration-200 hover:-translate-y-1">
      <div className="relative h-44 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand/45 via-brand/20 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#ffffffaa,transparent_55%)] opacity-90" />
        <div className="relative flex h-full items-center justify-center text-xs font-medium uppercase tracking-[0.35em] text-white/80">
          {img ? `Preview · ${img}` : "Bild folgt"}
        </div>
      </div>
      <div className="flex flex-col gap-2 px-6 py-6 text-left">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-ink/45">
          {country}
          <span className="rounded-full bg-white/70 px-3 py-1 text-[10px] text-ink/60">
            {price}
          </span>
        </div>
        <h3 className="text-xl font-semibold text-ink">{name}</h3>
        <p className="text-sm text-ink/60">
          Kuratierte Tipps, Spots und Routen in einem aufgeräumten Apple-Interface.
        </p>
        <button className="mt-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm font-medium text-ink transition hover:-translate-y-0.5 hover:shadow-card">
          Merken
          <span aria-hidden>⌘</span>
        </button>
      </div>
    </article>
  );
}
