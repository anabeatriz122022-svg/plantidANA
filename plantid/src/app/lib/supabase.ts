import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Faltam as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env"
  );
} else {
  console.info(
    `[PlantID] Supabase configurado: URL=${supabaseUrl.slice(0, 20)}... / ANON_KEY termina em ...${supabaseAnonKey.slice(-6)}`
  );
}

/**
 * Client único do app.
 * - persistSession: sessão fica no localStorage deste dispositivo
 * - detectSessionInUrl: lê o token do link de email (confirmação / redefinir senha)
 * - flowType pkce: padrão moderno do Supabase Auth
 *
 * A senha NUNCA fica salva no nosso banco nem no front: o Supabase Auth
 * guarda só o hash no servidor dele. Por isso, depois de trocar a senha
 * em qualquer celular/computador, o login com a senha nova funciona em todos.
 */
export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce",
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
});
