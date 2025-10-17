'use client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabaseBrowser } from '@/lib/supabaseBrowser'

export default function LoginPage() {
  const supabase = supabaseBrowser()
  return (
    <div className="container max-w-md p-8">
      <h1 className="text-2xl font-semibold mb-4">Anmelden</h1>
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={[]} // nur Email, kein Google
        view="magic_link"
        // wichtig: sorgt für Redirect nach Magic Link Login
        redirectTo={
          typeof window !== 'undefined'
            ? `${window.location.origin}/create`
            : undefined
        }
      />
    </div>
  )
}
