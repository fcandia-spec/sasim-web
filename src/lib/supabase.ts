import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON) {
  throw new Error(
    '[supabase] Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. Añádelas en las variables de entorno del proyecto en Vercel.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
export { SUPABASE_URL };
