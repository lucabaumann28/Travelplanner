import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

/**
 * Stellt sicher, dass die Supabase-Session mit Cookies synchron bleibt.
 * Wir verwenden zusätzlich Bearer-Token in API-Requests, aber das hier
 * schadet nicht und hält Client/Server in Sync.
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  await supabase.auth.getSession()
  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
