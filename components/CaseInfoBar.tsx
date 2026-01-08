
import React, { useCallback } from 'react';
import { CaseData, PROMOTORIAS } from '../types';
import { Search, Gavel, Calendar, UserRound } from 'lucide-react';

interface CaseInfoBarProps {
  caseData: CaseData;
  setCaseData: React.Dispatch<React.SetStateAction<CaseData>>;
}

const CaseInfoBar: React.FC<CaseInfoBarProps> = ({ caseData, setCaseData }) => {
  
  const getPromotorForDate = useCallback((cargoLabel: string, dateString: string) => {
    const promotoria = PROMOTORIAS.find(p => p.label === cargoLabel);
    if (!promotoria) return "";

    if (!dateString) {
      const allNames = Array.from(new Set(promotoria.schedule.map(s => s.name)));
      return allNames.join(" / ");
    }

    const [year, month, day] = dateString.split('-').map(Number);
    const entry = promotoria.schedule.find(s => day >= s.start && day <= s.end);
    return entry ? entry.name : "";
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setCaseData(prev => {
      const newData = { ...prev, [name]: value };
      
      if (name === 'cargo' || name === 'dataAudiencia') {
        const targetCargo = name === 'cargo' ? value : prev.cargo;
        const targetDate = name === 'dataAudiencia' ? value : prev.dataAudiencia;
        const newPromotor = getPromotorForDate(targetCargo, targetDate);
        if (targetCargo) {
             newData.promotor = newPromotor;
        }
      }
      return newData;
    });
  };

  const handleSearch = () => {
    if (!caseData.numeroProcesso) return;
    const url = `https://esaj.tjsp.jus.br/cpopg/search.do?conversationId=&cbPesquisa=NUMPROC&numeroDigitoAnoUnificado=&foroNumeroUnificado=&dadosConsulta.valorConsultaNuUnificado=&dadosConsulta.valorConsultaNuUnificado=UNIFICADO&dadosConsulta.valorConsulta=${encodeURIComponent(caseData.numeroProcesso)}&dadosConsulta.tipoNuProcesso=SAJ`;
    window.open(url, '_blank');
  };

  const inputContainer = "relative group flex-1 min-w-[200px]";
  const iconClass = "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors";
  const inputClass = "h-12 w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all shadow-sm text-slate-700";

  return (
    <div className="bg-slate-50 p-6 border-b border-slate-200">
      <div className="max-w-[1400px] mx-auto flex flex-wrap gap-4">
        
        {/* Process Number */}
        <div className={inputContainer}>
          <Gavel size={18} className={iconClass} />
          <input
            type="text"
            name="numeroProcesso"
            placeholder="Nº Processo (SAJ)"
            value={caseData.numeroProcesso}
            onChange={handleChange}
            className={inputClass}
          />
          <button 
            onClick={handleSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
            title="Pesquisar no ESAJ"
          >
            <Search size={16} />
          </button>
        </div>

        {/* Cargo Dropdown */}
        <div className={inputContainer}>
          <Calendar size={18} className={iconClass} />
          <select
            name="cargo"
            value={caseData.cargo}
            onChange={handleChange}
            className={`${inputClass} appearance-none cursor-pointer pr-10`}
          >
            <option value="" disabled>Cargo da Promotoria</option>
            {PROMOTORIAS.map(p => (
              <option key={p.label} value={p.label}>{p.label}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            ▼
          </div>
        </div>

        {/* Audience Date */}
        <div className={inputContainer}>
          <Calendar size={18} className={iconClass} />
          <input
            type="date"
            name="dataAudiencia"
            value={caseData.dataAudiencia}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        {/* Promotor Name */}
        <div className={`${inputContainer} flex-[1.5]`}>
            <UserRound size={18} className={iconClass} />
            <input
            type="text"
            name="promotor"
            placeholder="Nome do Promotor(a)"
            value={caseData.promotor}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

      </div>
    </div>
  );
};

export default CaseInfoBar;
