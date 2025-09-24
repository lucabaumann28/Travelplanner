import DestinationCard from "@/components/DestinationCard";

const destinations = [
  { name: "Lissabon", country: "Portugal", price: "ab 120€", img: "/lisbon.jpg" },
  { name: "Rom", country: "Italien", price: "ab 140€", img: "/rome.jpg" },
  { name: "Athen", country: "Griechenland", price: "ab 130€", img: "/athens.jpg" },
];

export default function Explore() {
  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Entdecken</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {destinations.map((d) => (
          <DestinationCard key={d.name} {...d} />
        ))}
      </div>
    </section>
  );
}
