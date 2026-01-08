
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://supabase.santanamendes.com.br';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzE1MDUwODAwLAogICJleHAiOiAxODcyODE3MjAwCn0.JFLEfHEf4gwNOM06kbg0pB5acVFjdFBJTTWULmHLzT4';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogInNlcnZpY2Vfcm9sZSIsCiAgImlzcyI6ICJzdXBhYmFzZSIsCiAgImlhdCI6IDE3MTUwNTA4MDAsCiAgImV4cCI6IDE4NzI4MTcyMDAKfQ.oGoknhZs-Rn4GQR7K_YiaxanFU69hdNOv7G-kGjpG7A';

// Using SERVICE_KEY for admin access as requested
export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
