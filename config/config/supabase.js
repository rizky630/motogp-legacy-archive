import { createClient } from
"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "ISI_URL_SUPABASE_KAMU";
const SUPABASE_ANON_KEY = "ISI_PUBLISHABLE_KEY_KAMU";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
