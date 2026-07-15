
/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase URL or Anon Key');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// El UID no es un secreto: la seguridad real la imponen las políticas RLS
// (función is_admin() en Postgres). Aquí solo decide UI y redirecciones.
export const ADMIN_USER_ID = 'b8f61d8d-17db-4cfb-aa44-095ba79b4a31';

export const isAdminUser = (user: { id: string } | null | undefined): boolean =>
    user?.id === ADMIN_USER_ID;
