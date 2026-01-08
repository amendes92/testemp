
import React, { useState, useMemo } from 'react';
import { PROMOTORIAS } from '../types';
import { FileCheck, CheckCircle, RotateCcw, Printer, FileText, ChevronRight, ChevronLeft, User } from 'lucide-react';
import Logo from './Logo';

const AnppTool: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    processo: '',
    tipo: 'Digital',
    cargo: '',
    prazoDefesa: '60',
    tipoAnpp: 'minuta',
    observacao: '',
    contatosVitima: '',
    partes: Array(8).fill(null).map(() => ({ nome: '', endereco: '', contato: '' }))
  });
  const [copied, setCopied] = useState(false);

  const selectedPromotoria = useMemo(() => 
    PROMOTORIAS.find(p => p.label === formData.cargo), [formData.cargo]);

  const promotorName = useMemo(() => {
    if (!selectedPromotoria) return "";
    return selectedPromotoria.schedule[0].name;
  }, [selectedPromotoria]);

  const cargoNumero = useMemo(() => {
    const match = formData.cargo.match(/\d+/);
    return match ? match[0] : "";
  }, [formData.cargo]);

  const handlePartChange = (index: number, field: string, value: string) => {
    const newPartes = [...formData.partes];
    newPartes[index] = { ...newPartes[index], [field]: value };
    setFormData({ ...formData, partes: newPartes });
  };

  const handlePrint = () => {
    window.print();
  };

  const filledPartes = useMemo(() => {
    return formData.partes.filter(p => p.nome.trim() !== '');
  }, [formData.partes]);

  // Helper para renderizar Checkbox visual
  const CheckBox = ({ checked, label }: { checked: boolean, label: string }) => (
    <div className="flex items-center gap-1.5 mr-4">
      <div className={`w-4 h-4 border border-black flex items-center justify-center text-[10px] ${checked ? 'bg-black text-white' : 'bg-white'}`}>
        {checked ? 'X' : ''}
      </div>
      <span className="uppercase text-[9pt]">{label}</span>
    </div>
  );

  const generatedContent = useMemo(() => (
    <div id="printable-anpp" className="bg-white text-black p-0 printable-area" style={{ fontFamily: '"Arial", sans-serif', width: '100%', minHeight: '297mm', boxSizing: 'border-box' }}>
      
      {/* Header oficial MPSP - Estilo Clean */}
      <div className="flex items-start justify-between border-b-[3px] border-black pb-4 mb-6">
        <div className="flex items-center gap-5">
           <Logo className="h-14" />
           <div className="flex flex-col">
             <span className="text-[14pt] font-black leading-none tracking-tight">MINISTÉRIO PÚBLICO</span>
             <span className="text-[10pt] font-medium tracking-widest uppercase mt-1">Do Estado de São Paulo</span>
             <span className="text-[9pt] font-bold text-gray-600 mt-1">4ª Promotoria de Justiça Criminal da Capital</span>
           </div>
        </div>
        <div className="flex flex-col items-end justify-center h-full pt-1">
          <div className="bg-black text-white px-3 py-1 font-bold text-[9pt] uppercase tracking-widest mb-1">
            SAAf - Apoio à Atividade Fim
          </div>
          <span className="text-[8pt] font-bold uppercase text-gray-500">Formulário de Solicitação</span>
        </div>
      </div>

      <h2 className="text-center font-black text-[16pt] uppercase tracking-wide mb-6 border-2 border-black py-2 bg-gray-100">
        Solicitação de Acordo de Não Persecução Penal
      </h2>

      {/* Tabela de Dados Principais */}
      <table className="w-full border-collapse border border-black text-[10pt] mb-6">
        <tbody>
          {/* Linha 1 */}
          <tr>
            <td className="w-[15%] bg-gray-200 font-bold p-2 border border-black border-r-2 uppercase text-[8pt] align-middle">
              Nº dos Autos
            </td>
            <td className="w-[45%] p-2 border border-black font-bold text-[11pt] uppercase align-middle">
              {formData.processo || '________________________________'}
            </td>
            <td className="w-[10%] bg-gray-200 font-bold p-2 border border-black border-r-2 uppercase text-[8pt] align-middle">
              Formato
            </td>
            <td className="w-[30%] p-2 border border-black align-middle">
              <div className="flex">
                <CheckBox checked={formData.tipo === 'Físico'} label="Físico" />
                <CheckBox checked={formData.tipo === 'Digital'} label="Digital" />
              </div>
            </td>
          </tr>

          {/* Linha 2 */}
          <tr>
            <td className="bg-gray-200 font-bold p-2 border border-black border-r-2 uppercase text-[8pt] align-middle">
              Promotor(a)
            </td>
            <td colSpan={3} className="p-2 border border-black font-bold text-[11pt] uppercase align-middle">
              {promotorName || '________________________________________________________________'}
            </td>
          </tr>

          {/* Linha 3 */}
          <tr>
            <td className="bg-gray-200 font-bold p-2 border border-black border-r-2 uppercase text-[8pt] align-middle">
              Cargo
            </td>
            <td className="p-2 border border-black uppercase align-middle">
              {cargoNumero ? `${cargoNumero}º Promotor de Justiça Criminal` : '____________________'}
            </td>
             <td className="bg-gray-200 font-bold p-2 border border-black border-r-2 uppercase text-[8pt] align-middle">
              Prazo Defesa
            </td>
            <td className="p-2 border border-black uppercase align-middle">
               {formData.prazoDefesa} Dias
            </td>
          </tr>
        </tbody>
      </table>

      {/* Seção de Partes / Imputados */}
      <div className="mb-6">
        <div className="bg-black text-white font-bold text-[9pt] uppercase px-2 py-1 mb-0 border-x border-t border-black flex justify-between">
           <span>Dados dos Imputados / Investigados</span>
           <span>Total: {filledPartes.length > 0 ? filledPartes.length : 1}</span>
        </div>
        
        <table className="w-full border-collapse border border-black text-[10pt]">
          <tbody>
             {(filledPartes.length > 0 ? filledPartes : [formData.partes[0]]).map((p, i) => (
                <React.Fragment key={i}>
                  <tr className="border-t-2 border-black">
                     <td className="w-[40px] bg-gray-300 text-center font-bold border-r border-b border-black text-[14pt] text-gray-600 align-middle">
                        {i + 1}
                     </td>
                     <td className="p-0 border-b border-black">
                        <table className="w-full border-collapse">
                           <tbody>
                              <tr>
                                 <td className="w-[15%] bg-gray-100 font-bold p-1 px-2 border-r border-b border-gray-300 text-[7pt] uppercase">Nome Completo</td>
                                 <td className="p-1 px-2 border-b border-gray-300 font-bold uppercase">{p.nome || '________________________________'}</td>
                              </tr>
                              <tr>
                                 <td className="bg-gray-100 font-bold p-1 px-2 border-r border-b border-gray-300 text-[7pt] uppercase">Endereço</td>
                                 <td className="p-1 px-2 border-b border-gray-300 uppercase">{p.endereco || '________________________________'}</td>
                              </tr>
                              <tr>
                                 <td className="bg-gray-100 font-bold p-1 px-2 border-r text-[7pt] uppercase">Contatos</td>
                                 <td className="p-1 px-2 uppercase">{p.contato || '________________________________'}</td>
                              </tr>
                           </tbody>
                        </table>
                     </td>
                  </tr>
                </React.Fragment>
             ))}
          </tbody>
        </table>
      </div>

      {/* Seção de Vítima e Observações */}
      <div className="grid grid-cols-1 gap-6 mb-6">
         
         <div className="border border-black">
            <div className="bg-gray-200 font-bold text-[8pt] uppercase px-2 py-1 border-b border-black">
               Dados / Contatos da Vítima (Se houver)
            </div>
            <div className="p-3 min-h-[60px] uppercase font-medium text-[10pt]">
               {formData.contatosVitima || 'Sem informações de contato.'}
            </div>
         </div>

         <div className="border border-black">
            <div className="bg-gray-200 font-bold text-[8pt] uppercase px-2 py-1 border-b border-black">
               Observações Gerais / Diligências Pendentes
            </div>
            <div className="p-3 min-h-[100px] uppercase font-medium text-[10pt] whitespace-pre-wrap">
               {formData.observacao || ''}
            </div>
         </div>

      </div>

      {/* Rodapé - Tipo de Celebração */}
      <div className="border-2 border-black p-4 bg-gray-50 flex items-center justify-between">
         <div className="font-bold uppercase text-[9pt]">Forma de Celebração Sugerida:</div>
         <div className="flex gap-8">
            <div className="flex items-center gap-2">
               <div className={`w-6 h-6 border-2 border-black flex items-center justify-center font-bold ${formData.tipoAnpp === 'minuta' ? 'bg-black text-white' : 'bg-white'}`}>
                  {formData.tipoAnpp === 'minuta' ? 'X' : ''}
               </div>
               <span className="uppercase font-bold text-[10pt]">Minuta (Padrão)</span>
            </div>
            <div className="flex items-center gap-2">
               <div className={`w-6 h-6 border-2 border-black flex items-center justify-center font-bold ${formData.tipoAnpp === 'teams' ? 'bg-black text-white' : 'bg-white'}`}>
                  {formData.tipoAnpp === 'teams' ? 'X' : ''}
               </div>
               <span className="uppercase font-bold text-[10pt]">Audiência Virtual (Teams)</span>
            </div>
         </div>
      </div>

    </div>
  ), [formData, promotorName, cargoNumero, filledPartes]);

  const handleReset = () => {
    if(confirm("Deseja resetar o formulário?")) {
      setFormData({
        processo: '',
        tipo: 'Digital',
        cargo: '',
        prazoDefesa: '60',
        tipoAnpp: 'minuta',
        observacao: '',
        contatosVitima: '',
        partes: Array(8).fill(null).map(() => ({ nome: '', endereco: '', contato: '' }))
      });
      setStep(1);
    }
  };

  return (
    <div className="flex flex-1 overflow-hidden animate-in fade-in duration-500">
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #printable-anpp, #printable-anpp * { visibility: visible !important; }
          #printable-anpp {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 10mm 15mm !important;
            background: white !important;
            z-index: 9999 !important;
            box-sizing: border-box !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            margin: 0;
            size: A4;
          }
          .no-print { display: none !important; }
        }
      `}</style>
      
      <div className="w-[420px] bg-white border-r border-slate-200 p-6 flex flex-col gap-4 shadow-xl z-10 overflow-y-auto custom-scrollbar no-print">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-green-600 rounded-lg text-white"><FileCheck size={20} /></div>
          <div>
            <h2 className="font-bold uppercase tracking-tight">ANPP - SAAf</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Solicitação de Acordo</p>
          </div>
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <div className="flex bg-slate-100 p-1 rounded-xl">
               {['Digital', 'Físico'].map(t => (
                 <button key={t} onClick={() => setFormData({...formData, tipo: t})} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all ${formData.tipo === t ? 'bg-white shadow-sm text-green-600' : 'text-slate-400'}`}>{t}</button>
               ))}
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Processo nº</label>
              <input type="text" value={formData.processo} onChange={(e) => setFormData({...formData, processo: e.target.value})} placeholder="0000000-00..." className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cargo</label>
              <select value={formData.cargo} onChange={(e) => setFormData({...formData, cargo: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none">
                <option value="">Selecione o Cargo...</option>
                {PROMOTORIAS.map(p => <option key={p.label} value={p.label}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Prazo Defesa (Dias)</label>
              <input type="text" value={formData.prazoDefesa} onChange={(e) => setFormData({...formData, prazoDefesa: e.target.value})} placeholder="60" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Celebração do ANPP</label>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button onClick={() => setFormData({...formData, tipoAnpp: 'teams'})} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all ${formData.tipoAnpp === 'teams' ? 'bg-white shadow-sm text-green-600' : 'text-slate-400'}`}>MS Teams</button>
                <button onClick={() => setFormData({...formData, tipoAnpp: 'minuta'})} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all ${formData.tipoAnpp === 'minuta' ? 'bg-white shadow-sm text-green-600' : 'text-slate-400'}`}>Minuta</button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contatos da Vítima</label>
              <input type="text" value={formData.contatosVitima} onChange={(e) => setFormData({...formData, contatosVitima: e.target.value})} placeholder="Telefone, e-mail..." className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none" />
            </div>
             <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Observações Gerais</label>
              <textarea value={formData.observacao} onChange={(e) => setFormData({...formData, observacao: e.target.value})} placeholder="Informações adicionais para o formulário..." className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none h-20 resize-none" />
            </div>
            <button onClick={() => setStep(2)} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold uppercase text-xs tracking-widest shadow-lg mt-2 flex items-center justify-center gap-2">Próximo Passo <ChevronRight size={16}/></button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cadastro de Imputados (Máx. 8)</span>
                <button onClick={() => setStep(1)} className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase flex items-center gap-1"><ChevronLeft size={12}/> Dados Iniciais</button>
            </div>
            <div className="space-y-3">
              {formData.partes.map((part, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    <User size={12}/>
                    <p className="text-[9px] font-bold uppercase">Imputado {idx + 1}</p>
                  </div>
                  <input type="text" placeholder="Nome Completo" value={part.nome} onChange={(e) => handlePartChange(idx, 'nome', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-green-400" />
                  <input type="text" placeholder="Endereço com CEP" value={part.endereco} onChange={(e) => handlePartChange(idx, 'endereco', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-green-400" />
                  <input type="text" placeholder="Contato" value={part.contato} onChange={(e) => handlePartChange(idx, 'contato', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-green-400" />
                </div>
              ))}
            </div>
            <div className="flex gap-2 sticky bottom-0 bg-white py-4 border-t border-slate-100">
               <button onClick={handleReset} className="w-full bg-red-100 text-red-600 py-3 rounded-xl font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-colors hover:bg-red-200"><RotateCcw size={14} /> Resetar Campos</button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 bg-slate-200 p-8 overflow-y-auto flex flex-col items-center custom-scrollbar">
        <div className="flex gap-4 mb-8 no-print sticky top-0 z-20 bg-slate-200/90 backdrop-blur-sm p-4 rounded-2xl w-full justify-center">
            <button 
                onClick={handlePrint}
                className="bg-red-600 hover:bg-red-700 text-white px-10 py-3.5 rounded-xl shadow-xl flex items-center gap-3 font-bold uppercase text-xs tracking-widest transition-all transform active:scale-95"
            >
                <Printer size={20} /> Imprimir / PDF
            </button>
            <button 
                onClick={() => {
                   const range = document.createRange();
                   const container = document.getElementById('printable-anpp');
                   if (container) {
                      range.selectNode(container);
                      window.getSelection()?.removeAllRanges();
                      window.getSelection()?.addRange(range);
                      document.execCommand('copy');
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                   }
                }}
                className={`px-10 py-3.5 rounded-xl shadow-xl flex items-center gap-3 font-bold uppercase text-xs tracking-widest transition-all transform active:scale-95 ${copied ? 'bg-green-600 text-white' : 'bg-slate-800 text-white hover:bg-slate-900'}`}
            >
                {copied ? <CheckCircle size={20} /> : <FileText size={20} />}
                {copied ? 'Copiado!' : 'Copiar Texto'}
            </button>
        </div>

        {/* Container do Papel Preview - Ajustado para aparecer tudo */}
        <div className="w-full max-w-[210mm] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-300 rounded-sm min-h-[297mm] transition-all mb-12 flex flex-col items-stretch p-[15mm] transform scale-90 md:scale-100 origin-top">
          {generatedContent}
        </div>
      </div>
    </div>
  );
};

export default AnppTool;
