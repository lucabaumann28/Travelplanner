"use client";

import dynamic from "next/dynamic";

// Die eigentliche Map (Client-Komponente) wird nur im Browser geladen
const PlanMap = dynamic(() => import("./plan-map"), { ssr: false });

type MarkerT = { lat: number | null; lon: number | null; title: string };

export default function MapSection({ markers }: { markers: MarkerT[] }) {
  // Nur valide Marker (mit Zahlen) an die Map weitergeben
  const valid = markers.filter(
    (m) => typeof m.lat === "number" && typeof m.lon === "number"
  ) as { lat: number; lon: number; title: string }[];

  return (
    <div className="my-4">
      <PlanMap markers={valid} />
    </div>
  );
}
