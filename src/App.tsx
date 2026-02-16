import { useEffect, useState } from "react";
import { GoogleLogin, googleLogout, type CredentialResponse } from "@react-oauth/google";
import { useToast } from '@/contexts/toast';
import { verifyEmailAuthorization } from "@/api/home";
import { createQueryClient } from '@/lib/queryClient';
import { AppRouter } from "@/AppRouter";
import { AUTH_TIMEOUT_MS, AUTH_REFRESH_INTERVAL_MS } from "@/config/constants";

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
      } catch (err) {
         console.error("Erro ao decodificar login:", err);
         toast.error('Erro ao fazer login');
      }
   }

   const handleLogout = () => {
      googleLogout();
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
         <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
            <div className="w-full max-w-sm bg-white shadow-lg rounded-xl border border-slate-200 p-6 sm:p-10 text-center">
               <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-slate-800">
                  Fintrack
               </h1>
               <p className="mb-6 sm:mb-8 text-sm sm:text-base text-slate-500">
                  Acesse com sua conta Google para gerenciar seus dados
               </p>

               <GoogleLogin
                  onSuccess={handleLoginSuccess}
                  onError={() => toast.error('Erro no login Google')}
                  useOneTap
               />

               <p className="mt-4 text-xs sm:text-sm text-slate-400">
                  Apenas e-mails autorizados terão acesso.
               </p>
            </div>
         </div>
      );
   }

   return (
      <AppRouter onLogout={handleLogout} />
   );
}

export default App;