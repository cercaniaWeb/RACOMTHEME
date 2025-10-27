import { createClient } from '@supabase/supabase-js';

// Configura estas variables de entorno en tu archivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL; // Ej: https://xxxxx.supabase.co
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY; // Tu API anon key

// Verificar que las variables estén definidas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Faltan credenciales de Supabase. Por favor, define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export { supabase };