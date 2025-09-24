export const metadata = { title: "TripMVP", description: "Deine Reiseplattform" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="min-h-screen">
        <nav className="sticky top-0 z-10 border-b bg-white/70 backdrop-blur dark:bg-slate-950/70">
          <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-6">
            <a href="/" className="font-bold text-xl">TripMVP</a>
            <a href="/explore" className="hover:underline">Entdecken</a>
            <a href="/trips" className="hover:underline">Meine Trips</a>
            <a href="/about" className="hover:underline ml-auto">Über</a>
          </div>
        </nav>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-5xl px-4 py-8 text-sm text-slate-500">
          © {new Date().getFullYear()} TripMVP
        </footer>
      </body>
    </html>
  );
}
