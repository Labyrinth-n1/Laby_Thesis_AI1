import { createClient } from '@supabase/supabase-js';

const supabaseUrl: string = 'https://wjdqvwoewmgawespkbbp.supabase.co';
const supabaseKey: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqZHF2d29ld21nYXdlc3BrYmJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NzkwNDksImV4cCI6MjA3NzE1NTA0OX0.8a7tCiSTv103MYklxrWRaSwA9EVg7JosiISqE8TCFE8';
export const supabase = createClient(supabaseUrl, supabaseKey);
