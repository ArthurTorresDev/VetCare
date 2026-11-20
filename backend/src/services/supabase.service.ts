import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

let supabaseInstance: SupabaseClient | null = null;

/**
 * Valida se uma string é uma URL HTTP/HTTPS válida para o Supabase
 */
function isValidHttpUrl(stringUrl?: string): boolean {
  if (!stringUrl || stringUrl.includes('<') || stringUrl.includes('>')) return false;
  try {
    const url = new URL(stringUrl);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Retorna o cliente do Supabase se as variáveis de ambiente estiverem configuradas com valores reais válidos.
 * Utiliza preferencialmente a service role key no backend para bypass de RLS e operações administrativas seguras.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  if (isValidHttpUrl(env.supabaseUrl) && env.supabaseKey && !env.supabaseKey.includes('<')) {
    try {
      supabaseInstance = createClient(env.supabaseUrl, env.supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      return supabaseInstance;
    } catch (err) {
      console.warn('[SupabaseClient Init Warning]:', err);
      return null;
    }
  }

  return null;
}

export const SUPABASE_BUCKET_PET_FOTOS = env.supabaseBucketPetFotos;
