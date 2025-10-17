'use client'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

/**
 * Client für den Browser, der Sessions korrekt verwaltet.
 * Nutzt die Auth-Helpers, damit Login-Status sauber funktioniert.
 */
export const supabaseBrowser = () => createClientComponentClient()
