import { cookies } from 'next/headers'
import { createServerComponentClient, createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export const supabaseSsr = () => createServerComponentClient({ cookies })
export const supabaseRoute = () => createRouteHandlerClient({ cookies })
