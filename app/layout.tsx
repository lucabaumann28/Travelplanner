import "./globals.css";

export const metadata = {
  title: "KI-Reiseplaner",
  description: "Personalisierte, umsetzbare Reisepläne in Sekunden.",
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="min-h-screen text-zinc-900 antialiased">
        <Nav />
        <main className="container py-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

/* --- Inline minimal Nav & Footer, damit du nichts verpasst --- */
function Nav() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-white/70 border-b border-zinc-200">
      <div className="container h-14 flex items-center justify-between">
        <a href="/" className="font-semibold tracking-tight">TripMVP</a>
        <nav className="hidden md:flex gap-6 text-sm">
          <a href="/create" className="hover:text-zinc-700">Generator</a>
          <a href="/login" className="hover:text-zinc-700">Login</a>
        </nav>
        <a href="/create" className="rounded-full bg-brand text-white px-4 py-2 text-sm font-medium hover:bg-brand/90">
          Plan erstellen
        </a>
      </div>
    </header>
  );
}
function Footer() {
  return (
    <footer className="border-t border-zinc-200 mt-16">
      <div className="container py-8 text-sm text-zinc-500">
        © {new Date().getFullYear()} TripMVP · Built with ❤️
      </div>
    </footer>
  );
}
