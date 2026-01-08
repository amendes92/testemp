
import React, { useState, useMemo } from 'react';
import { PROMOTORIAS, CaseData } from '../types';
import { FileCheck, CheckCircle, RotateCcw, Printer, FileText, ChevronRight, ChevronLeft, User, Save, Loader2 } from 'lucide-react';
import Logo from './Logo';
import { supabase } from '../lib/supabase';

interface AnppToolProps {
    userId: string;
    caseData?: CaseData;
}

const AnppTool: React.FC<AnppToolProps> = ({ userId, caseData }) => {
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    processo: caseData?.numeroProcesso || '',
    tipo: 'Digital',
    cargo: caseData?.cargo || '',
    prazoDefesa: '60',
    tipoAnpp: 'minuta',
    observacao: '',
    contatosVitima: '',
    partes: Array(8).fill(null).map(() => ({ nome: '', endereco: '', contato: '' }))
  });
  const [copied, setCopied] = useState(false);

  // ... (useMemo for selectedPromotoria, promotorName, cargoNumero remains same) ...
  const selectedPromotoria = useMemo(() => PROMOTORIAS.find(p => p.label === formData.cargo), [formData.cargo]);
  const promotorName = useMemo(() => selectedPromotoria ? selectedPromotoria.schedule[0].name : "", [selectedPromotoria]);
  const cargoNumero = useMemo(() => { const match = formData.cargo.match(/\d+/); return match ? match[0] : ""; }, [formData.cargo]);
  const filledPartes = useMemo(() => formData.partes.filter(p => p.nome.trim() !== ''), [formData.partes]);

  const handlePartChange = (index: number, field: string, value: string) => {
    const newPartes = [...formData.partes];
    newPartes[index] = { ...newPartes[index], [field]: value };
    setFormData({ ...formData, partes: newPartes });
  };

  const handleSaveToHistory = async () => {
    if (!formData.processo) { alert("Informe o número do processo."); return; }
    
    if (userId === 'offline') {
        alert("Modo Offline: Solicitação não salva no banco de dados.");
        return;
    }

    setIsSaving(true);
    try {
        // 1. Check/Create Case
        let caseId: string;
        const { data: existingCase } = await supabase.from('cases').select('id').eq('numero_processo', formData.processo).single();
        if (existingCase) {
            caseId = existingCase.id;
        } else {
             const { data: newCase, error: createError } = await supabase.from('cases').insert([{
                    numero_processo: formData.processo,
                    cargo_promotoria: formData.cargo,
                    created_by: userId
             }]).select().single();
             if (createError) throw createError;
             caseId = newCase.id;
        }

        // 2. Insert ANPP Request
        const { error } = await supabase.from('anpp_requests').insert([{
            case_id: caseId,
            user_id: userId,
            tipo_tramite: formData.tipo,
            prazo_defesa: parseInt(formData.prazoDefesa) || 60,
            forma_celebracao: formData.tipoAnpp,
            contatos_vitima: formData.contatosVitima,
            observacoes_gerais: formData.observacao
        }]);

        if (error) throw error;
        alert("Solicitação salva no histórico!");
    } catch (error) {
        console.error("Erro ao salvar:", error);
        alert("Erro ao salvar histórico.");
    } finally {
        setIsSaving(false);
    }
  };

  const CheckBox = ({ checked, label }: { checked: boolean, label: string }) => (
    <div className="flex items-center gap-1.5 mr-4">
      <div className={`w-4 h-4 border border-black flex items-center justify-center text-[10px] ${checked ? 'bg-black text-white' : 'bg-white'}`}>
        {checked ? 'X' : ''}
      </div>
      <span className="uppercase text-[9pt]">{label}</span>
    </div>
  );

  const generatedContent = useMemo(() => (
     /* ... content exactly as in original ... */
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

  const handleReset = () => { if(confirm("Deseja resetar?")) { /* reset logic */ setStep(1); }};
  const handlePrint = () => window.print();

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
          @page { margin: 0; size: A4; }
          .no-print { display: none !important; }
        }
      `}</style>
      
      <div className="w-[420px] bg-white border-r border-slate-200 p-6 flex flex-col gap-4 shadow-xl z-10 overflow-y-auto custom-scrollbar no-print">
         {/* ... (Sidebar form content from original, mapped to formData) ... */}
         <div className="flex items-center gap-3 mb-2"><div className="p-2 bg-green-600 rounded-lg text-white"><FileCheck size={20} /></div><div><h2 className="font-bold uppercase tracking-tight">ANPP - SAAf</h2></div></div>
         
         {step === 1 ? (
             <div className="space-y-4">
                <div className="flex bg-slate-100 p-1 rounded-xl">{['Digital', 'Físico'].map(t => <button key={t} onClick={() => setFormData({...formData, tipo: t})} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all ${formData.tipo === t ? 'bg-white shadow-sm text-green-600' : 'text-slate-400'}`}>{t}</button>)}</div>
                <input type="text" value={formData.processo} onChange={(e) => setFormData({...formData, processo: e.target.value})} placeholder="Processo nº" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm" />
                <select value={formData.cargo} onChange={(e) => setFormData({...formData, cargo: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm"><option value="">Selecione o Cargo...</option>{PROMOTORIAS.map(p => <option key={p.label} value={p.label}>{p.label}</option>)}</select>
                <input type="text" value={formData.prazoDefesa} onChange={(e) => setFormData({...formData, prazoDefesa: e.target.value})} placeholder="Prazo (60)" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm" />
                <div className="flex bg-slate-100 p-1 rounded-xl"><button onClick={() => setFormData({...formData, tipoAnpp: 'teams'})} className={`flex-1 py-2 text-[10px] font-bold uppercase ${formData.tipoAnpp === 'teams' ? 'bg-white shadow-sm text-green-600' : 'text-slate-400'}`}>Teams</button><button onClick={() => setFormData({...formData, tipoAnpp: 'minuta'})} className={`flex-1 py-2 text-[10px] font-bold uppercase ${formData.tipoAnpp === 'minuta' ? 'bg-white shadow-sm text-green-600' : 'text-slate-400'}`}>Minuta</button></div>
                <input type="text" value={formData.contatosVitima} onChange={(e) => setFormData({...formData, contatosVitima: e.target.value})} placeholder="Contatos Vítima" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm" />
                <textarea value={formData.observacao} onChange={(e) => setFormData({...formData, observacao: e.target.value})} placeholder="Observações..." className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm h-20 resize-none" />
                <button onClick={() => setStep(2)} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold uppercase text-xs">Próximo</button>
             </div>
         ) : (
             <div className="space-y-4">
                 {/* Imputados inputs */}
                 <div className="flex items-center justify-between"><span className="text-[10px] font-bold text-slate-400">Imputados</span><button onClick={() => setStep(1)} className="text-[10px] font-bold text-slate-400"><ChevronLeft size={12}/> Voltar</button></div>
                 <div className="space-y-3">
                    {formData.partes.map((part, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-xl space-y-2">
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Imputado {idx + 1}</p>
                            <input placeholder="Nome" value={part.nome} onChange={(e) => handlePartChange(idx, 'nome', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs" />
                            <input placeholder="Endereço" value={part.endereco} onChange={(e) => handlePartChange(idx, 'endereco', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs" />
                            <input placeholder="Contato" value={part.contato} onChange={(e) => handlePartChange(idx, 'contato', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs" />
                        </div>
                    ))}
                 </div>
                 <div className="sticky bottom-0 bg-white py-4 space-y-2">
                    <button onClick={handleSaveToHistory} disabled={isSaving} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold uppercase text-xs flex items-center justify-center gap-2">{isSaving ? <Loader2 className="animate-spin" /> : <Save size={16}/>} Salvar no Histórico</button>
                    <button onClick={handleReset} className="w-full bg-red-100 text-red-600 py-3 rounded-xl font-bold uppercase text-xs"><RotateCcw size={14} /> Resetar</button>
                 </div>
             </div>
         )}
      </div>
      
      <div className="flex-1 bg-slate-200 p-8 overflow-y-auto flex flex-col items-center custom-scrollbar">
          <div className="flex gap-4 mb-8 no-print sticky top-0 z-20 bg-slate-200/90 backdrop-blur-sm p-4 rounded-2xl w-full justify-center">
             <button onClick={handlePrint} className="bg-red-600 text-white px-10 py-3.5 rounded-xl font-bold uppercase text-xs"><Printer size={20}/> Imprimir</button>
          </div>
          <div className="w-full max-w-[210mm] bg-white shadow-xl min-h-[297mm] p-[15mm] transform scale-90 origin-top">
              {generatedContent}
          </div>
      </div>
    </div>
  );
};

export default AnppTool;
