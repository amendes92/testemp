
import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Loader2, UserRound, WifiOff, ShieldAlert } from 'lucide-react';
import Logo from './Logo';
import { supabase } from '../lib/supabase';

interface WelcomeScreenProps {
  onConfirm: (session: any) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onConfirm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdminAccess = () => {
      // Bypass Auth using Service Key privileges setup in lib/supabase
      const adminSession = {
          user: {
              id: 'service_admin',
              email: 'admin@mpsp.mp.br',
              role: 'service_role'
          }
      };
      onConfirm(adminSession);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        onConfirm(data.session);
      }
    } catch (err: any) {
      console.error("Login failed:", err.message || err);
      
      const errorMessage = err.message || JSON.stringify(err);
      
      if (errorMessage === "Invalid login credentials") {
        setError("Credenciais inválidas. Tente novamente ou use o Modo Offline.");
      } else if (errorMessage.includes("Email logins are disabled")) {
          setError("Login por e-mail desativado. Use 'Entrar como Convidado' ou 'Modo Offline'.");
      } else if (errorMessage.includes("Database error querying schema") || errorMessage.includes("Database error")) {
          // Auto-fallback suggestion for DB schema errors which are server-side config issues
          setError("Erro Crítico no Banco de Dados (Schema). Recomendado: Acesso Administrativo ou Offline.");
      } else {
          setError(`Falha na autenticação: ${errorMessage.slice(0, 100)}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
        if (data.session) onConfirm(data.session);
    } catch (err: any) {
        console.error("Anon Login failed:", err);
        if (err.message && err.message.includes("Anonymous sign-ins are disabled")) {
             setError("Login anônimo desativado no servidor. Utilize o Modo Offline.");
        } else if (err.message && err.message.includes('not a function')) {
             setError("Erro de versão do cliente. Tente o Modo Offline.");
        } else {
             setError("Falha no login anônimo. Tente o Modo Offline.");
        }
    } finally {
        setIsLoading(false);
    }
  };

  const handleOfflineAccess = () => {
      // Create a fake session object for offline usage
      const offlineSession = {
          user: {
              id: 'offline',
              email: 'offline@local',
              role: 'offline_user'
          }
      };
      onConfirm(offlineSession);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900 overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/5 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md p-8 relative animate-in fade-in zoom-in duration-500">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
          <div className="p-8 flex flex-col items-center text-center">
            <Logo className="h-16 mb-6" />
            
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Bem-vindo ao Sistema</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-8">Painel do Oficial de Promotoria</p>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold w-full break-words">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="w-full space-y-4">
              <div className="text-left">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                  Usuário ou E-mail
                </label>
                <input
                  autoFocus
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario ou usuario@mpsp.mp.br"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-700 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all shadow-inner"
                />
              </div>

              <div className="text-left">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                  Senha
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-700 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all shadow-inner"
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white py-4 rounded-2xl font-bold shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>Acessar Intranet <ArrowRight size={20} /></>}
              </button>
            </form>

            <div className="w-full flex items-center gap-4 my-6">
                 <div className="h-px bg-slate-200 flex-1"></div>
                 <span className="text-xs text-slate-400 font-bold uppercase">Alternativas</span>
                 <div className="h-px bg-slate-200 flex-1"></div>
            </div>

            <div className="space-y-3 w-full">
                <button
                    type="button"
                    onClick={handleAdminAccess}
                    disabled={isLoading}
                    className="w-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                    <ShieldAlert size={16} />
                    Acesso Administrativo (Service Key)
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                      type="button"
                      onClick={handleAnonymousLogin}
                      disabled={isLoading}
                      className="w-full bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 text-slate-600 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all"
                  >
                      {isLoading ? <Loader2 className="animate-spin" size={16} /> : <UserRound size={16} />}
                      Convidado
                  </button>

                  <button
                      type="button"
                      onClick={handleOfflineAccess}
                      disabled={isLoading}
                      className="w-full bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all"
                  >
                      <WifiOff size={16} />
                      Modo Offline
                  </button>
                </div>
            </div>

          </div>
          
          <div className="bg-slate-50 py-4 px-8 border-t border-slate-100 flex items-center justify-center gap-2">
            <ShieldCheck size={14} className="text-slate-400" />
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Acesso Restrito - MPSP</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
