import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Leaf, Lock, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { Button } from "../ui/button";
import { LeafSprig, FlowerSprig } from "../Illustrations";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase";
import { updatePassword } from "../../lib/auth";

/**
 * Tela aberta pelo link do email "Redefinir senha".
 *
 * A senha é atualizada só no Supabase Auth (hash no servidor).
 * Não gravamos senha em tabela nossa — isso seria inseguro e desnecessário:
 * depois da troca, o login com a senha nova funciona em qualquer dispositivo.
 */
export function ResetPasswordPage() {
  const navigate = useNavigate();

  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [linkInvalid, setLinkInvalid] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function resolveRecoverySession() {
      // 1) Sessão já criada pelo detectSessionInUrl
      const { data: sessionData } = await supabase.auth.getSession();
      if (!active) return;
      if (sessionData.session?.user?.email) {
        setEmail(sessionData.session.user.email);
        setChecking(false);
        return;
      }

      // 2) Links antigos / alguns clientes colocam tokens no hash (#access_token=...)
      const hash = typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "";
      if (hash.includes("access_token") || hash.includes("type=recovery")) {
        const params = new URLSearchParams(hash);
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");
        if (access_token && refresh_token) {
          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (!active) return;
          if (!error && data.session?.user?.email) {
            setEmail(data.session.user.email);
            setChecking(false);
            // limpa o hash da URL (não deixa o token exposto)
            window.history.replaceState(null, "", window.location.pathname);
            return;
          }
        }
      }

      // 3) PKCE: code na query (?code=...)
      const search = typeof window !== "undefined" ? window.location.search : "";
      if (search.includes("code=")) {
        // O client já tenta trocar o code; espera um pouco e reconsulta
        await new Promise((r) => setTimeout(r, 800));
        const { data } = await supabase.auth.getSession();
        if (!active) return;
        if (data.session?.user?.email) {
          setEmail(data.session.user.email);
          setChecking(false);
          return;
        }
      }
    }

    resolveRecoverySession();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (
        (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") &&
        session?.user?.email
      ) {
        setEmail(session.user.email);
        setChecking(false);
        setLinkInvalid(false);
      }
    });

    const timeout = setTimeout(() => {
      if (!active) return;
      setChecking(false);
      setEmail((current) => {
        if (!current) setLinkInvalid(true);
        return current;
      });
    }, 5000);

    return () => {
      active = false;
      listener.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);

    if (error) {
      toast.error(error);
      return;
    }

    toast.success(
      "Senha atualizada! Agora entre com a senha nova em qualquer dispositivo (computador ou celular)."
    );
    // Vai para o login com aviso; a senha já está no Auth do Supabase
    navigate("/login?senha=ok", { replace: true });
  };

  if (checking) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gradient-to-b from-green-50 to-white p-4">
        <p className="text-gray-600">Validando link de recuperação...</p>
      </div>
    );
  }

  if (linkInvalid || !email) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white p-6">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-3" />
        <h2 className="text-xl font-bold text-gray-800 text-center">Link inválido ou expirado</h2>
        <p className="text-sm text-gray-600 text-center mt-2 max-w-sm">
          Solicite um novo link em &quot;Esqueci minha senha&quot;. Abra o link no mesmo
          aparelho em que quiser definir a senha, ou depois use a senha nova para
          entrar em qualquer dispositivo.
        </p>
        <Button className="mt-6 bg-green-600 hover:bg-green-700" onClick={() => navigate("/login")}>
          Voltar ao login
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white p-4 relative overflow-hidden">
      <LeafSprig className="absolute -left-8 top-10 w-32 h-32 text-green-200 opacity-40 pointer-events-none" />
      <FlowerSprig className="absolute -right-6 bottom-16 w-28 h-28 text-green-200 opacity-40 pointer-events-none" />

      <div className="w-full max-w-sm space-y-6 relative">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-600 mb-3">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Nova senha</h1>
          <p className="text-sm text-gray-600 mt-1">
            Conta: <span className="font-medium">{email}</span>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Depois de salvar, use esta senha para entrar no computador ou no celular.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <Label htmlFor="password">Nova senha</Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                className="pl-9 pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                minLength={6}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="confirm">Confirmar senha</Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                className="pl-9 pr-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
                minLength={6}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? "Ocultar senha" : "Mostrar senha"}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
            {loading ? "Salvando..." : "Salvar nova senha"}
          </Button>
        </form>
      </div>
    </div>
  );
}
