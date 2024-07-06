import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = 'https://dutveihwaquoeegexrwb.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1dHZlaWh3YXF1b2VlZ2V4cndiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTkwOTEyNjksImV4cCI6MjAzNDY2NzI2OX0.iTs9i9we9mvO1X4_Wijl3vA--FmeMYHSUNWJpslSpi4'; // Reemplaza con tu API Key de Supabase

export const supabase = createClient(supabaseUrl, supabaseKey);
