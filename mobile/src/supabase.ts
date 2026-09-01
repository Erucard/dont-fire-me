import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

export const SB_URL = 'https://thijolchfiisfxmufkvh.supabase.co';
export const SB_KEY = 'sb_publishable_SXt0orI5uHVKUq3BI81y1A_ImLXJm0d';

export const sb = createClient(SB_URL, SB_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
