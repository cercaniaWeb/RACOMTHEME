import { supabase } from '../config/supabase';

// Funciones de autenticación de Supabase
export const signInWithEmailAndPassword = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  // La respuesta de Supabase tiene una estructura diferente
  // Devolvemos data completo que contiene user en data.user
  return data;
};

export const signUpWithEmailAndPassword = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Error al cerrar sesión:', error);
    throw error;
  }
};

export const onAuthStateChanged = (callback) => {
  // Supabase tiene una función para escuchar cambios de autenticación
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      callback(session?.user || null);
    }
  );

  // Devolver una función para cancelar la suscripción
  return () => {
    subscription.unsubscribe();
  };
};

// Función para obtener el usuario actual
export const getCurrentUser = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user || null;
};