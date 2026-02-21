import { lazy, Suspense, useEffect, useState } from "react";
import { useToast } from '@/contexts/toast';
import { verifyEmailAuthorization } from "@/api/home";
import { createQueryClient } from '@/lib/queryClient';
import { AppRouter } from "@/AppRouter";
import { AUTH_TIMEOUT_MS, AUTH_REFRESH_INTERVAL_MS } from "@/config/constants";

const LoginScreen = lazy(() => import('./LoginScreen'))

interface CredentialResponse {
  credential?: string
}

function App() {
  const toast = useToast();
  const [queryClient] = useState(createQueryClient);

  const [userEmail, setUserEmail] = useState<string | null>(() => {
    const saved = localStorage.getItem("user_email");
    const savedTime = Number(localStorage.getItem("login_time") || 0);

    if (!saved || !savedTime) return null;

    if (Date.now() - savedTime > AUTH_TIMEOUT_MS) {
      localStorage.removeItem("user_email");
      localStorage.removeItem("login_time");

      return null;
    }

    return saved;
  });

  async function handleLoginSuccess(credentialResponse: CredentialResponse) {
    try {
      if (!credentialResponse.credential) return;

      const decoded = JSON.parse(
        atob(credentialResponse.credential.split(".")[1])
      );
      const email = decoded.email;

      const autorizado = await verifyEmailAuthorization(email);

      if (!autorizado) {
        toast.error('E-mail não autorizado!');

        return;
      }

      localStorage.setItem("user_email", email);
      localStorage.setItem("login_time", Date.now().toString());

      setUserEmail(email);
    }
    catch (err) {
      console.error("Erro ao decodificar login:", err);
      toast.error('Erro ao fazer login');
    }
  }

  const handleLogout = () => {
    // Revoga a sessão Google sem necessitar do pacote carregado
    (window as unknown as { google?: { accounts?: { id?: { disableAutoSelect?: () => void } } } })
      .google?.accounts?.id?.disableAutoSelect?.();

    localStorage.removeItem("user_email");
    localStorage.removeItem("login_time");
    sessionStorage.removeItem("period");

    queryClient.clear();

    setUserEmail(null);

    toast.info('Você foi desconectado');
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (userEmail) {
        localStorage.setItem("login_time", Date.now().toString());
      }

    }, AUTH_REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [userEmail]);

  if (!userEmail) {
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
          <div className="animate-pulse text-sm text-slate-400">Carregando…</div>
        </div>
      }>
        <LoginScreen
          onSuccess={handleLoginSuccess}
          onError={() => toast.error('Erro no login Google')}
        />
      </Suspense>
    );
  }

  return (
    <AppRouter onLogout={handleLogout} />
  );
}

export default App;