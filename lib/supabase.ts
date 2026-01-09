
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://supabase.santanamendes.com.br';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzE1MDUwODAwLAogICJleHAiOiAxODcyODE3MjAwCn0.pc_jz2BLJk83c7Ld-HxNa44flxavgQdha004_bwPdwQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
