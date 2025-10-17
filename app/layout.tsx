import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "KI-Reiseplaner",
  description: "Personalisierte, umsetzbare Reisepläne in Sekunden.",
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="min-h-screen text-ink antialiased">
        <div className="relative min-h-screen pb-24">
          <Nav />
          <main className="container pt-24 pb-16 lg:pt-32">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}

/* --- Inline minimal Nav & Footer, damit du nichts verpasst --- */
function Nav() {
  return (
    <header className="sticky top-6 z-50">
      <div className="container">
          <div className="glass-panel flex items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
              <span className="h-8 w-8 rounded-full bg-gradient-to-br from-brand to-brand/70 shadow-inner" />
              TripMVP
            </Link>
            <nav className="hidden md:flex items-center gap-8 text-sm text-ink/70">
              <Link href="/create" className="transition hover:text-ink">
                Generator
              </Link>
              <Link href="/explore" className="transition hover:text-ink">
                Entdecken
              </Link>
              <Link href="/about" className="transition hover:text-ink">
                Über uns
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/login" className="btn-secondary hidden sm:inline-flex text-sm px-4 py-2">
                Login
              </Link>
              <Link href="/create" className="btn-primary text-sm px-5 py-2.5">
                Plan erstellen
              </Link>
            </div>
          </div>
        </div>
      </header>
    );
}
function Footer() {
  return (
    <footer className="mt-16 pb-12">
      <div className="container">
        <div className="glass-panel px-6 py-5 text-sm text-ink/60">
          © {new Date().getFullYear()} TripMVP · Crafted with ❤️ für neugierige Reisende
        </div>
      </div>
    </footer>
  );
}
