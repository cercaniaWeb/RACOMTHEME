// Archivo de compatibilidad para Supabase
// Este archivo se mantiene para mantener la compatibilidad con el código existente
// que importa auth y otras variables de este archivo

import { supabase } from './supabase';
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getCurrentUser
} from './supabaseAuth';

// Inicializar analíticas (podemos usar una función vacía o una alternativa como Plausible)
const analytics = {
  logEvent: () => {},
  setUserProperties: () => {},
  setUserId: () => {}
};

export { 
  supabase as db, 
  supabase,
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  getCurrentUser,
  analytics 
};

// Exportar como 'auth' para mantener compatibilidad con imports existentes
export const auth = {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getCurrentUser
};