
import React from 'react';
import { ChevronLeft, User, LayoutDashboard, LogOut } from 'lucide-react';
import Logo from './Logo';

interface HeaderProps {
  userName: string;
  showBackButton?: boolean;
  onBack?: () => void;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ userName, showBackButton, onBack, onLogout }) => {
  return (
    <header className="bg-white text-slate-900 h-16 flex items-center justify-between px-8 shadow-sm shrink-0 z-20 border-b border-slate-200">
      <div className="flex items-center gap-6">
        {showBackButton ? (
          <button 
            onClick={onBack}
            className="group p-2 rounded-xl hover:bg-slate-50 transition-all border border-slate-200 flex items-center gap-2"
          >
              <ChevronLeft size={20} className="text-slate-400 group-hover:text-slate-600 group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden md:inline text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-slate-600">Voltar ao Início</span>
          </button>
        ) : (
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
              <LayoutDashboard size={20} className="text-slate-400" />
              <span className="hidden md:inline text-[10px] font-bold uppercase tracking-widest text-slate-400">Painel SISDIGITAL</span>
          </div>
        )}
        
        <div className="h-6 w-px bg-slate-200"></div>
        
        <div className="flex items-center gap-4">
            <Logo className="h-7" />
            <div className="flex flex-col border-l border-slate-200 pl-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none">Intranet</span>
                <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest mt-1">Ministério Público de São Paulo</span>
            </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-4 group cursor-default">
            <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">{userName || 'Usuário'}</p>
                <p className="text-[10px] text-red-600 font-bold tracking-widest uppercase">Oficial de Promotoria</p>
            </div>
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200 shadow-sm transition-all overflow-hidden">
                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 transition-colors">
                    <User size={20} />
                </div>
            </div>
        </div>

        {onLogout && (
            <>
                <div className="h-8 w-px bg-slate-200 mx-2"></div>
                <button 
                    onClick={onLogout}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all shadow-sm"
                    title="Sair do Sistema"
                >
                    <LogOut size={18} />
                </button>
            </>
        )}
      </div>
    </header>
  );
};

export default Header;
