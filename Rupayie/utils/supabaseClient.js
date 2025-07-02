import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://yyaibubpzwxvihnaecfs.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5YWlidWJwend4dmlobmFlY2ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNTA4ODMsImV4cCI6MjA2MjcyNjg4M30.4YQs38Qn49iK1nZTD4RCD_OKrkM208PzIA4gZ998IwU";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
