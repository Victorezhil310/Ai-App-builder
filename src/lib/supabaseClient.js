import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kovkmkntvldxfksrhnwk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtvdmtta250dmxkeGZrc3JobndrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxMjY2MTgsImV4cCI6MjEwMDcwMjYxOH0.wkJLLPhE2mxnBnySKClKOs9G2NkIbz42kGptDf4p2MM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
