
import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Loader2, UserRound, UserPlus } from 'lucide-react';
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
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    if (password.length < 6) {
        setError("A senha deve ter no mínimo 6 caracteres.");
        return;
    }

    if (!navigator.onLine) {
        setError("Sem conexão com a internet.");
        return;
    }

    setIsLoading(true);
    setError(null);

    let loginEmail = email.trim();
    if (!loginEmail.includes('@')) {
        loginEmail = `${loginEmail}@mpsp.mp.br`;
    }

    try {
      let result;
      
      if (isSignUp) {
        result = await supabase.auth.signUp({
            email: loginEmail,
            password,
        });
      } else {
        result = await supabase.auth.signInWithPassword({
            email: loginEmail,
            password,
        });
      }

      const { data, error } = result;

      if (error) {
        throw error;
      }

      if (data.session) {
        onConfirm(data.session);
      } else if (isSignUp && data.user) {
        // User created but no session (maybe email confirmation needed, or just allow login now)
        setError("Conta criada com sucesso! Faça login.");
        setIsSignUp(false);
        setIsLoading(false);
      }
    } catch (err: any) {
      const errorMessage = err.message || "Erro desconhecido";
      
      const isNetworkError = errorMessage.includes("FetchError") || 
                             errorMessage.includes("Failed to fetch") || 
                             errorMessage.includes("NetworkError");

      if (isNetworkError) {
          console.warn("Erro de conexão durante autenticação:", errorMessage);
          setError("Falha na conexão com o servidor. Verifique se o servidor está acessível.");
      } else {
          console.error("Auth attempt failed:", errorMessage);
          
          if (errorMessage.includes("Invalid login credentials") || errorMessage.includes("invalid_grant")) {
            setError("Usuário ou senha incorretos.");
          } else if (errorMessage.includes("Password should be at least 6 characters")) {
              setError("A senha deve ter no mínimo 6 caracteres.");
          } else if (errorMessage.includes("Email logins are disabled")) {
              setError("Login por e-mail desativado.");
          } else if (errorMessage.includes("User already registered")) {
              setError("Usuário já cadastrado.");
          } else {
              setError(`Erro: ${errorMessage.slice(0, 100)}`);
          }
      }
      setIsLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    if (!navigator.onLine) {
        setError("Sem conexão com a internet.");
        return;
    }

    setIsLoading(true);
    setError(null);
    try {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
        if (data.session) onConfirm(data.session);
    } catch (err: any) {
        const errorMessage = err.message || "";
        const isNetworkError = errorMessage.includes("FetchError") || errorMessage.includes("Failed to fetch");
        
        if (isNetworkError) {
            console.warn("Erro de conexão (Anon):", errorMessage);
            setError("Erro de conexão. O servidor pode estar indisponível.");
        } else {
            console.error("Anon Login failed:", err);
            setError("Erro ao entrar como convidado.");
        }
        setIsLoading(false);
    }
  };

  const toggleMode = () => {
      setIsSignUp(!isSignUp);
      setError(null);
      setPassword('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900 overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/5 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md p-8 relative animate-in fade-in zoom-in duration-500">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
          <div className="p-8 flex flex-col items-center text-center">
            <Logo className="h-16 mb-6" />
            
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
                {isSignUp ? "Criar Conta" : "Bem-vindo ao Sistema"}
            </h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-8">Painel do Oficial de Promotoria</p>
            
            {error && (
              <div className={`mb-4 p-3 border rounded-xl text-xs font-bold w-full break-words animate-in slide-in-from-top ${error.includes("sucesso") ? "bg-green-50 border-green-100 text-green-600" : "bg-red-50 border-red-100 text-red-600"}`}>
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
                {isSignUp && (
                    <p className="text-[10px] text-slate-400 ml-2 mt-1">Mínimo de 6 caracteres</p>
                )}
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white py-4 rounded-2xl font-bold shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                    isSignUp ? 
                    <>Criar Conta <UserPlus size={20} /></> : 
                    <>Acessar Intranet <ArrowRight size={20} /></>
                )}
              </button>

              <div className="pt-2">
                <button 
                    type="button" 
                    onClick={toggleMode}
                    className="text-[10px] font-bold text-slate-400 hover:text-red-600 uppercase tracking-widest transition-colors"
                >
                    {isSignUp ? "Já possui cadastro? Fazer Login" : "Não tem conta? Cadastre-se"}
                </button>
              </div>
            </form>

            {!isSignUp && (
                <>
                <div className="w-full flex items-center gap-4 my-6">
                     <div className="h-px bg-slate-200 flex-1"></div>
                     <span className="text-xs text-slate-400 font-bold uppercase">Alternativas</span>
                     <div className="h-px bg-slate-200 flex-1"></div>
                </div>

                <div className="space-y-3 w-full">
                    <div className="grid grid-cols-1 gap-3">
                      <button
                          type="button"
                          onClick={handleAnonymousLogin}
                          disabled={isLoading}
                          className="w-full bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 text-slate-600 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all"
                      >
                          {isLoading ? <Loader2 className="animate-spin" size={16} /> : <UserRound size={16} />}
                          Entrar como Convidado
                      </button>
                    </div>
                </div>
                </>
            )}

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
