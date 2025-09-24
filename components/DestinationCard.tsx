type Props = { name: string; country: string; price: string; img?: string };

export default function DestinationCard({ name, country, price, img }: Props) {
  return (
    <article className="rounded-2xl border overflow-hidden hover:shadow-md transition">
      <div className="h-40 bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
        {/* Platzhalter – echte Bilder später in /public hinzufügen */}
        <span className="text-sm opacity-70">{img ?? "Bild folgt"}</span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold">{name}</h3>
        <p className="text-sm text-slate-500">{country}</p>
        <div className="mt-2 text-sm">{price}</div>
        <button className="mt-3 rounded-lg border px-3 py-1 text-sm hover:bg-slate-50 dark:hover:bg-slate-900">
          Merken
        </button>
      </div>
    </article>
  );
}
