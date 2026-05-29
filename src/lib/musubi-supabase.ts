import { createClient } from '@supabase/supabase-js'

const musubiSupabase = createClient(
  process.env.NEXT_PUBLIC_MUSUBI_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_MUSUBI_SUPABASE_ANON_KEY!,
)

export function getMusubiImageUrl(storagePath: string): string {
  return `${process.env.NEXT_PUBLIC_MUSUBI_SUPABASE_URL}/storage/v1/object/public/material-images/${storagePath}`
}

export { musubiSupabase }
