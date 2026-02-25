import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import { verifyEmailAuthorization } from "@/api/home";
import { AUTH_TIMEOUT_MS, AUTH_REFRESH_INTERVAL_MS } from "@/config/authConstants";
import AuthenticatedApp from "./AuthenticatedApp";

interface CredentialResponse {
  credential?: string
}

export default function App() {
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem("user_email");
      const savedTime = Number(localStorage.getItem("login_time") || 0);

      if (saved && savedTime && (Date.now() - savedTime < AUTH_TIMEOUT_MS)) {
        return saved;
      }
    } catch { }
    return null;
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
        alert('E-mail não autorizado!');
        return;
      }

      localStorage.setItem("user_email", email);
      localStorage.setItem("login_time", Date.now().toString());
      setUserEmail(email);
    } catch (err) {
      console.error("Erro ao decodificar login:", err);
      alert('Erro ao fazer login');
    }
  }

  const handleLogout = useCallback(() => {
    (window as any)?.google?.accounts?.id?.disableAutoSelect?.();
    localStorage.clear();
    sessionStorage.removeItem("period");
    setUserEmail(null);
  }, []);

  useEffect(() => {
    if (!userEmail) return;

    const interval = setInterval(() => {
      localStorage.setItem("login_time", Date.now().toString());
    }, AUTH_REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [userEmail]);

  if (!userEmail) {
    const LoginScreen = lazy(() => import('./LoginScreen'));
    return (
      <Suspense fallback={<div className="h-screen bg-white" />}>
        <LoginScreen onSuccess={handleLoginSuccess} onError={() => { }} />
      </Suspense>
    );
  }

  return <AuthenticatedApp onLogout={handleLogout} />;
}