
"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export default function LoginPage() {
  const supabase = supabaseBrowser();
  return (
    <section className="glass-panel mx-auto max-w-lg px-8 py-10">
      <div className="space-y-6 text-center">
        <span className="inline-flex items-center rounded-full border border-white/70 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-ink/60">
          Willkommen zurück
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-ink">Anmelden</h1>
        <p className="text-sm text-ink/60">
          Logge dich ein, um deine gespeicherten Trips zu sehen und neue Reisen im Apple-inspirierten Interface zu planen.
        </p>
      </div>

      <div className="mt-8 rounded-3xl border border-white/60 bg-white/85 p-6 shadow-inner">
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          view="magic_link"
          redirectTo={
            typeof window !== "undefined"
              ? `${window.location.origin}/create`
              : undefined
          }
        />
      </div>
    </section>
  );
}
