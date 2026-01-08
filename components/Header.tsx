
import React from 'react';
import { ChevronLeft, User, LayoutDashboard } from 'lucide-react';
import Logo from './Logo';

interface HeaderProps {
  userName: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({ userName, showBackButton, onBack }) => {
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
      
      <div className="flex items-center gap-4 group cursor-pointer">
        <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">{userName || 'Usuário'}</p>
            <p className="text-[10px] text-red-600 font-bold tracking-widest uppercase">Oficial de Promotoria</p>
        </div>
        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200 shadow-sm group-hover:border-red-500/30 transition-all overflow-hidden">
            <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                <User size={20} />
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
