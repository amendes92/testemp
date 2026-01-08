
import React, { useState } from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import Logo from './Logo';

interface WelcomeScreenProps {
  onConfirm: (name: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onConfirm }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onConfirm(name.trim());
    }
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
            
            <form onSubmit={handleSubmit} className="w-full space-y-6">
              <div className="text-left">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                  Seu Nome Completo
                </label>
                <input
                  autoFocus
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-700 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all shadow-inner"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
              >
                Acessar Intranet <ArrowRight size={20} />
              </button>
            </form>
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
