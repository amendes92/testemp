
import React, { useState, useMemo } from 'react';
import { PROMOTORIAS, CaseData } from '../types';
import { Mail, Copy, CheckCircle, FileText, Send, AlertTriangle, Sparkles, Loader2, Bot, Upload, X, Paperclip, Save } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { supabase } from '../lib/supabase';

type OficioTemplate = 'GERAL_DP' | 'INQUERITO_APARTADO' | 'URGENCIA_IC' | 'CORREGEDORIA' | 'PEDIDO_COPIAS_JUIZO' | 'GAESP_ABUSO' | 'GERACAO_IA';

interface OficioToolProps {
    userId: string;
    caseData?: CaseData;
}

const OficioTool: React.FC<OficioToolProps> = ({ userId, caseData }) => {
  const [cargo, setCargo] = useState(caseData?.cargo || '');
  const [processo, setProcesso] = useState(caseData?.numeroProcesso || '');
  const [numeroOficio, setNumeroOficio] = useState('');
  const [template, setTemplate] = useState<OficioTemplate>('GERAL_DP');
  const [isSaving, setIsSaving] = useState(false);
  
  const [destinatarioNome, setDestinatarioNome] = useState('');
  const [orgaoNome, setOrgaoNome] = useState('');
  const [endereco, setEndereco] = useState('');
  const [emailOrgao, setEmailOrgao] = useState('');
  const [textoLivre, setTextoLivre] = useState('');
  const [identificacaoObjeto, setIdentificacaoObjeto] = useState('');
  const [reuNome, setReuNome] = useState('');

  const [iaInstrucao, setIaInstrucao] = useState('');
  const [iaContexto, setIaContexto] = useState('');
  const [iaFile, setIaFile] = useState<File | null>(null);
  const [iaBody, setIaBody] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const selectedPromotoria = useMemo(() => PROMOTORIAS.find(p => p.label === cargo), [cargo]);
  const promotorName = useMemo(() => selectedPromotoria ? selectedPromotoria.schedule[0].name : "", [selectedPromotoria]);

  const fileToBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = reject;
      });
  };

  const handleGenerateIA = async () => {
    if (!iaInstrucao.trim()) { alert("Forneça uma instrução."); return; }
    setIsGenerating(true);
    setIaBody('');
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const parts: any[] = [];
        if (iaFile) {
            const base64 = await fileToBase64(iaFile);
            parts.push({ inlineData: { mimeType: iaFile.type, data: base64 } });
            parts.push({ text: "CONTEXTO (Anexo): Use os fatos do documento." });
        }
        if (iaContexto.trim()) parts.push({ text: `CONTEXTO: "${iaContexto}"` });
        parts.push({ text: `Escreva o corpo de um ofício jurídico formal. Destinatário: ${orgaoNome} (${destinatarioNome}). Instrução: ${iaInstrucao}. Sem cabeçalho/rodapé.` });
        
        const result = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: [{ parts }] });
        setIaBody(result.text || "Erro ao gerar.");
    } catch (e) { console.error(e); setIaBody("Erro na IA."); } finally { setIsGenerating(false); }
  };

  const generatedContent = useMemo(() => {
    const header = `<div style="margin-bottom: 20px;"><p><b>Ofício nº ${numeroOficio || '____'}/${new Date().getFullYear().toString().slice(-2)} - 4ª PJCrim</b><br><b>Autos nº: ${processo || '________________'}</b></p></div><p style="text-align: right;">São Paulo, data infra.</p>`;
    const footer = `<div style="text-align: center; margin-top: 60px;"><b>${promotorName.toUpperCase() || '________________'}</b><br>${cargo || 'Promotor(a)'}</div><div style="font-size: 11px; margin-top: 40px; border-top: 1px solid #ccc;"><b>Ao: ${orgaoNome || '________________'}</b><br>${destinatarioNome}</div>`;
    
    let body = "";
    if (template === 'GERACAO_IA') body = iaBody || '<p><i>Corpo gerado pela IA...</i></p>';
    else if (template === 'URGENCIA_IC') body = `<p>Solicito urgência no laudo do objeto <b>${identificacaoObjeto}</b>.</p>`;
    else body = `<p>Solicito informações sobre <b>${identificacaoObjeto || 'o caso'}</b>. ${textoLivre}</p>`;
    
    return `<div style="font-family: 'Times New Roman'; font-size: 14px; text-align: justify;">${header}${body}${footer}</div>`;
  }, [numeroOficio, processo, promotorName, cargo, template, orgaoNome, destinatarioNome, textoLivre, identificacaoObjeto, iaBody]);

  const handleCopy = () => {
    const blobHtml = new Blob([generatedContent], { type: 'text/html' });
    const blobText = new Blob([document.createElement('div').innerText], { type: 'text/plain' });
    navigator.clipboard.write([new ClipboardItem({ 'text/html': blobHtml, 'text/plain': blobText })]).then(() => {
        setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSave = async () => {
      if (!processo) { alert("Informe o processo."); return; }

      if (userId === 'offline') {
          alert("Modo Offline: Ofício não salvo no banco.");
          return;
      }

      setIsSaving(true);
      try {
          // 1. Get Cargo ID
          let cargoId = null;
          if (cargo) {
             const { data: cargoData } = await supabase.from('master_cargos').select('id').eq('label', cargo).single();
             if (cargoData) cargoId = cargoData.id;
          }

          // 2. Check/Create Case
          let caseId: string;
          const { data: existingCase } = await supabase.from('cases').select('id').eq('numero_processo', processo).single();
          if (existingCase) caseId = existingCase.id;
          else {
              const { data: newCase, error } = await supabase.from('cases').insert([{ numero_processo: processo, cargo_id: cargoId, created_by: userId }]).select().single();
              if (error) throw error;
              caseId = newCase.id;
          }

          // 3. Insert Oficio
          const { error } = await supabase.from('oficios').insert([{
              case_id: caseId,
              user_id: userId,
              numero_oficio: numeroOficio,
              destinatario_orgao: orgaoNome,
              destinatario_nome: destinatarioNome,
              template_usado: template,
              conteudo_gerado: generatedContent
          }]);
          if (error) throw error;
          alert("Ofício salvo!");
      } catch (e: any) { console.error(e); alert(`Erro ao salvar: ${e.message}`); } finally { setIsSaving(false); }
  };

  return (
    <div className="flex flex-1 overflow-hidden animate-in fade-in duration-500">
      <div className="w-[420px] bg-white border-r border-slate-200 p-6 flex flex-col gap-4 shadow-xl z-10 overflow-y-auto custom-scrollbar">
         <div className="flex items-center gap-3 mb-2"><div className="p-2 bg-red-600 rounded-lg text-white"><FileText size={20} /></div><h2 className="font-bold uppercase">Gerador de Ofícios</h2></div>
         <button onClick={() => setTemplate('GERACAO_IA')} className={`w-full py-3 rounded-xl border font-bold text-sm flex items-center justify-center gap-2 ${template === 'GERACAO_IA' ? 'bg-violet-600 text-white' : 'bg-violet-50 text-violet-700'}`}><Bot size={16}/> IA</button>
         <input value={numeroOficio} onChange={e => setNumeroOficio(e.target.value)} placeholder="Nº Ofício" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm" />
         <input value={processo} onChange={e => setProcesso(e.target.value)} placeholder="Processo" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm" />
         <select value={cargo} onChange={e => setCargo(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm"><option value="">Cargo...</option>{PROMOTORIAS.map(p => <option key={p.label} value={p.label}>{p.label}</option>)}</select>
         
         <div className="p-4 bg-slate-900 rounded-2xl space-y-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Destinatário</span>
            <input value={orgaoNome} onChange={e => setOrgaoNome(e.target.value)} placeholder="Órgão" className="w-full bg-slate-800 border-slate-700 rounded-lg p-2.5 text-xs text-white" />
            <input value={destinatarioNome} onChange={e => setDestinatarioNome(e.target.value)} placeholder="Nome" className="w-full bg-slate-800 border-slate-700 rounded-lg p-2.5 text-xs text-white" />
         </div>

         {template === 'GERACAO_IA' && (
             <div className="bg-violet-50 p-4 rounded-2xl space-y-3">
                 <input type="file" onChange={e => e.target.files && setIaFile(e.target.files[0])} className="text-xs" />
                 <textarea value={iaInstrucao} onChange={e => setIaInstrucao(e.target.value)} placeholder="Instrução..." className="w-full h-24 p-2 text-sm rounded-lg" />
                 <button onClick={handleGenerateIA} disabled={isGenerating} className="w-full bg-violet-600 text-white py-2 rounded-xl font-bold text-xs">{isGenerating ? 'Gerando...' : 'Gerar'}</button>
             </div>
         )}
      </div>

      <div className="flex-1 bg-slate-100 p-10 overflow-y-auto flex flex-col items-center">
        <div className="w-full max-w-[800px] bg-white shadow-2xl p-16 min-h-[850px] relative">
           <div dangerouslySetInnerHTML={{ __html: generatedContent }} />
           <div className="absolute top-6 right-6 flex gap-2">
               <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold text-xs flex items-center gap-2">{isSaving ? <Loader2 className="animate-spin"/> : <Save size={14}/>} Salvar</button>
               <button onClick={handleCopy} className="px-4 py-2 bg-slate-800 text-white rounded-lg font-bold text-xs flex items-center gap-2">{copied ? <CheckCircle size={14}/> : <Copy size={14}/>} Copiar</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default OficioTool;
