import { useEffect, useState, useCallback } from "react";
import { AUTH_TIMEOUT_MS, AUTH_REFRESH_INTERVAL_MS } from "@/config/authConstants";
import AuthenticatedApp from "./AuthenticatedApp";

export default function App() {
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem("user_email");
      const savedTime = Number(localStorage.getItem("login_time") || 0);

      if (saved && savedTime && (Date.now() - savedTime < AUTH_TIMEOUT_MS)) {
        return saved;
      }
    } catch { /* Ignora erro de storage */ }
    return null;
  });


  const handleLogout = useCallback(() => {
    (window as any)?.google?.accounts?.id?.disableAutoSelect?.();
    localStorage.clear(); // Limpeza mais rápida
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

  // if (!userEmail) {
  //   // Carregamos o LoginScreen APENAS aqui dentro
  //   const LoginScreen = lazy(() => import('./LoginScreen'));
  //   return (
  //     <Suspense fallback={<div className="h-screen bg-white" />}>
  //       <LoginScreen onSuccess={handleLoginSuccess} onError={() => { }} />
  //     </Suspense>
  //   );
  // }

  return <AuthenticatedApp onLogout={handleLogout} />;
}