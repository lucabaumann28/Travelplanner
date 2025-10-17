import DestinationCard from "@/components/DestinationCard";

const destinations = [
  { name: "Lissabon", country: "Portugal", price: "ab 120€", img: "/lisbon.jpg" },
  { name: "Rom", country: "Italien", price: "ab 140€", img: "/rome.jpg" },
  { name: "Athen", country: "Griechenland", price: "ab 130€", img: "/athens.jpg" },
];

export default function Explore() {
  return (
    <section className="space-y-10">
      <div className="glass-panel px-8 py-10">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full border border-white/70 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-ink/60">
            Highlights
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            Entdecke kuratierte Ziele für dein nächstes Abenteuer
          </h1>
          <p className="mt-3 text-sm text-ink/60">
            Jeder Ort wird mit typischen Kosten, Stimmung und Signature-Spots versehen – ganz im Stil eines Apple Reiseguides.
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {destinations.map((d) => (
          <DestinationCard key={d.name} {...d} />
        ))}
      </div>
    </section>
  );
}
