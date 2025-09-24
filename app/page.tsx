export default function Home() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">Willkommen bei TripMVP 🚀</h1>
      <p className="text-lg">Finde Ziele, plane Trips, alles an einem Ort.</p>
      <a
        href="/explore"
        className="inline-block rounded-xl border px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-900"
      >
        Ziele entdecken
      </a>
    </section>
  );
}
