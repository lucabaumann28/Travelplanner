export default function Home() {
  return (
    <section className="text-center">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-tight">
          Reiseplanung, <span className="text-brand">neu gedacht</span>.
        </h1>
        <p className="mt-5 text-zinc-600 text-lg">
          Erzeuge in Sekunden einen realistischen Reiseplan – Zeiten, Wege, Budget
          und Karte inklusive. Teile, bewerte und optimiere mit der Community.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <a href="/create" className="rounded-full bg-brand text-white px-6 py-3 font-medium hover:bg-brand/90">
            Jetzt Plan erstellen
          </a>
          <a href="/login" className="rounded-full border border-zinc-300 px-6 py-3 font-medium hover:bg-white/70 backdrop-blur">
            Anmelden
          </a>
        </div>

        {/* Hero-Karte als Platzhalter */}
        <div className="card mt-12 p-6">
          <div className="h-[360px] rounded-xl bg-[radial-gradient(1000px_400px_at_50%_-20%,rgba(0,122,255,.15),transparent)] grid place-items-center text-zinc-400">
            <span>Hier erscheint später deine interaktive Karte</span>
          </div>
        </div>
      </div>

      {/* kleine Trust/Features-Zeile */}
      <div className="mt-10 text-zinc-500 text-sm">
        DSGVO-freundlich · Superschnell · Für Desktop & Mobile optimiert
      </div>
    </section>
  );
}
