import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://soanbvvthhfxwjycxved.supabase.co';
const SUPABASE_ANON = 'sb_publishable_FnI52GgK4i0h-LSCEGZ6sQ_XR-XAnS9';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
export { SUPABASE_URL };
