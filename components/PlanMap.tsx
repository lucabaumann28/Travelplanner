"use client";

import { useEffect, useMemo, useState } from "react";

type PlanMapProps = {
  city: string;
  center?: { lat: number; lon: number };
  height?: number;
};

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

/** Mapbox Static URL mit Marker */
function mapboxStaticURL(lat: number, lon: number, h: number) {
  const width = 1280;
  const zoom = 11;
  const style = "mapbox/streets-v11";
  const marker = `pin-s+285A98(${lon},${lat})`;
  const center = `${lon},${lat},${zoom},0`;
  return `https://api.mapbox.com/styles/v1/${style}/static/${marker}/${center}/${width}x${Math.max(
    240,
    h
  )}@2x?access_token=${MAPBOX_TOKEN}`;
}

/** OSM Embed als Fallback */
function osmEmbedURL(lat: number, lon: number) {
  const bboxPad = 0.05;
  const left = lon - bboxPad;
  const right = lon + bboxPad;
  const top = lat + bboxPad;
  const bottom = lat - bboxPad;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${lat}%2C${lon}`;
}

export default function PlanMap({ city, center, height = 360 }: PlanMapProps) {
  const [latlon, setLatlon] = useState<{ lat: number; lon: number } | null>(
    center ?? null
  );
  const [src, setSrc] = useState<string>("");

  useEffect(() => {
    if (center && typeof center.lat === "number" && typeof center.lon === "number") {
      setLatlon(center);
    }
  }, [center]);

  useEffect(() => {
    let cancelled = false;
    async function geocode() {
      if (latlon || !city) return;
      try {
        if (!MAPBOX_TOKEN) return;
        const url =
          `https://api.mapbox.com/geocoding/v5/mapbox.places/` +
          `${encodeURIComponent(city)}.json?access_token=${MAPBOX_TOKEN}&limit=1&language=de,en&types=place,locality,region`;
        const res = await fetch(url, { cache: "no-store" });
        const data = await res.json();
        const feat = data?.features?.[0];
        const [lon, lat] = feat?.center ?? [];
        if (!cancelled && typeof lat === "number" && typeof lon === "number") {
          setLatlon({ lat, lon });
        }
      } catch {
        // OSM-Fallback später
      }
    }
    geocode();
    return () => {
      cancelled = true;
    };
  }, [city, latlon]);

  useEffect(() => {
    if (latlon) {
      if (MAPBOX_TOKEN) {
        setSrc(mapboxStaticURL(latlon.lat, latlon.lon, height));
      } else {
        setSrc(osmEmbedURL(latlon.lat, latlon.lon));
      }
    } else {
      setSrc("");
    }
  }, [latlon, height]);

  const boxStyle = useMemo(() => ({ height: `${Math.max(240, height)}px` }), [height]);

  return (
    <div className="rounded-2xl overflow-hidden border border-zinc-200" style={boxStyle}>
      {src ? (
        <iframe
          title={`Karte: ${city}`}
          src={src}
          style={{ width: "100%", height: "100%", border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div className="w-full h-full grid place-items-center text-sm text-zinc-500">
          Karte wird geladen …
        </div>
      )}
    </div>
  );
}
