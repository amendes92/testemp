
import React, { useState, useMemo } from 'react';
import { PROMOTORIAS } from '../types';
import { Mail, Copy, CheckCircle, FileText, Send, AlertTriangle, Sparkles, Loader2, Bot, Upload, X, Paperclip } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

type OficioTemplate = 'GERAL_DP' | 'INQUERITO_APARTADO' | 'URGENCIA_IC' | 'CORREGEDORIA' | 'PEDIDO_COPIAS_JUIZO' | 'GAESP_ABUSO' | 'GERACAO_IA';

const OficioTool: React.FC = () => {
  const [cargo, setCargo] = useState('');
  const [processo, setProcesso] = useState('');
  const [numeroOficio, setNumeroOficio] = useState('');
  const [template, setTemplate] = useState<OficioTemplate>('GERAL_DP');
  
  // Campos específicos manuais
  const [destinatarioNome, setDestinatarioNome] = useState('');
  const [orgaoNome, setOrgaoNome] = useState('');
  const [endereco, setEndereco] = useState('');
  const [emailOrgao, setEmailOrgao] = useState('');
  const [textoLivre, setTextoLivre] = useState('');
  const [identificacaoObjeto, setIdentificacaoObjeto] = useState('');
  const [reuNome, setReuNome] = useState('');

  // Campos específicos IA
  const [iaInstrucao, setIaInstrucao] = useState('');
  const [iaContexto, setIaContexto] = useState('');
  const [iaFile, setIaFile] = useState<File | null>(null);
  const [iaBody, setIaBody] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [copied, setCopied] = useState(false);

  const selectedPromotoria = useMemo(() => 
    PROMOTORIAS.find(p => p.label === cargo), [cargo]);

  const promotorName = useMemo(() => {
    if (!selectedPromotoria) return "";
    return selectedPromotoria.schedule[0].name;
  }, [selectedPromotoria]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleGenerateIA = async () => {
    if (!iaInstrucao.trim()) {
        alert("Por favor, forneça uma instrução para a IA.");
        return;
    }

    setIsGenerating(true);
    setIaBody('');

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const parts: any[] = [];

        // Adiciona arquivo se existir
        if (iaFile) {
            const base64Data = await fileToBase64(iaFile);
            parts.push({
                inlineData: {
                    mimeType: iaFile.type,
                    data: base64Data
                }
            });
            parts.push({ text: "CONTEXTO (Documento Anexo): Utilize as informações do documento acima como base factual." });
        }

        // Adiciona contexto de texto se existir
        if (iaContexto.trim()) {
            parts.push({ text: `CONTEXTO ADICIONAL (Texto): "${iaContexto}"` });
        }

        const promptInstruction = `
        Você é um Assistente Jurídico Sênior do Ministério Público de São Paulo.
        Sua tarefa é redigir o CORPO DE TEXTO de um ofício formal.
        
        NÃO inclua cabeçalho (número do ofício, processo) nem rodapé (assinatura), pois isso será inserido automaticamente pelo sistema.
        Concentre-se apenas no texto central.

        DADOS DO DESTINATÁRIO (Para vocativo adequado):
        - Órgão: ${orgaoNome}
        - Responsável: ${destinatarioNome}

        SUA MISSÃO (INSTRUÇÃO DO PROMOTOR):
        "${iaInstrucao}"

        REGRAS DE REDAÇÃO:
        1. Inicie com o vocativo adequado (Ex: Excelentíssimo Senhor...).
        2. Use linguagem jurídica formal, culta, direta e IMPESSOAL.
        3. Se houver documento anexo ou contexto, cite fatos específicos (nomes, datas, folhas) para fundamentar o pedido.
        4. Use formatação HTML básica: <p> para parágrafos e <b> para destaques importantes.
        5. Finalize com o fecho protocolar padrão (Ex: Apresento protestos de estima e consideração).
        `;

        parts.push({ text: promptInstruction });

        const result = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [{ parts }]
        });

        setIaBody(result.text || "Erro ao gerar texto.");

    } catch (error) {
        console.error("Erro IA Ofício:", error);
        setIaBody("Ocorreu um erro ao gerar o ofício. Verifique se o arquivo é válido e tente novamente.");
    } finally {
        setIsGenerating(false);
    }
  };

  const generatedContent = useMemo(() => {
    const header = `
      <div style="margin-bottom: 20px;">
        <p><b>Ofício nº ${numeroOficio || '____'}/${new Date().getFullYear().toString().slice(-2)} - 4ª PJCrim</b><br>
        <b>Autos nº: ${processo || '________________'}</b><br>
        (Favor mencionar as referências acima)</p>
      </div>
      <p style="text-align: right;">São Paulo, data infra.</p>
    `;

    const footerAssinatura = `
      <div style="text-align: center; margin-top: 60px; margin-bottom: 40px;">
        <b>${promotorName.toUpperCase() || '________________'}</b><br>
        ${cargo || 'Promotor(a) de Justiça'}
      </div>
      <div style="font-size: 11px; color: #444; border-top: 1px solid #eee; pt-2;">
        <b>Ao: ${orgaoNome || '________________'}</b><br>
        ${destinatarioNome ? `A/C ${destinatarioNome}<br>` : ''}
        ${endereco || 'Endereço não informado'}<br>
        E-mail: ${emailOrgao || '________________'}
      </div>
    `;

    let body = "";

    if (template === 'GERACAO_IA') {
        body = iaBody ? iaBody : `
          <p style="color: #666;"><i>O corpo do ofício será gerado pela Inteligência Artificial e aparecerá aqui.</i></p>
          <p style="color: #666;"><i>Preencha os dados de contexto no painel lateral para iniciar.</i></p>
        `;
    } else {
        switch (template) {
        case 'URGENCIA_IC':
            body = `
            <p><b>EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) DIRETOR(A) DO INSTITUTO DE CRIMINALÍSTICA,</b></p>
            <br>
            <p>Pelo presente, encaminho cópia de requisição pericial referente aos autos em epígrafe e solicito a Vossa Excelência a elaboração e a remessa, <b>com urgência</b>, do Laudo Pericial solicitado referente ao objeto <b>${identificacaoObjeto || '________________'}</b>.</p>
            <p>Ocorre que o referido objeto possui risco de perecimento da prova (ex: bateria de curta duração), o que causará prejuízo à elucidação dos fatos e à persecução penal.</p>
            <p>Na oportunidade, apresento protestos de estima e consideração.</p>
            `;
            break;
        case 'INQUERITO_APARTADO':
            body = `
            <p><b>EXCELENTÍSSIMO SENHOR DELEGADO DE POLÍCIA,</b></p>
            <br>
            <p>Pelo presente, encaminho o procedimento em epígrafe e, com fundamento no disposto nos artigos 103 e 104 da Lei Complementar nº 734/93, <b>REQUISITO</b> a Vossa Excelência a instauração de <b>INQUÉRITO POLICIAL APARTADO</b> para apurar <b>${textoLivre || '________________'}</b>, em relação a <b>${reuNome || '________________'}</b>.</p>
            <p>Aguardamos informações sobre o número do inquérito instaurado.</p>
            `;
            break;
        case 'CORREGEDORIA':
            body = `
            <p><b>EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) DELEGADO(A) DIRETOR(A) DA CORREGEDORIA GERAL DA POLÍCIA CIVIL,</b></p>
            <br>
            <p>Por dever de ofício, nos termos do art. 43, VIII da Lei 8.625/1993, encaminho cópias dos autos em epígrafe a fim de que seja apurada <b>eventual desídia e atraso injustificado</b> no trato da investigação.</p>
            <p>Verifica-se que o feito retornou da repartição policial sem qualquer anotação ou diligência frutífera, apesar de sucessivos pedidos de dilação de prazo, o que compromete a celeridade processual em caso de gravidade notória.</p>
            <p>Diante do exposto, requeiro adoção de providências para sanar a falha administrativa.</p>
            `;
            break;
        case 'PEDIDO_COPIAS_JUIZO':
            body = `
            <p><b>EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA ${orgaoNome || '____ª VARA'},</b></p>
            <br>
            <p>Pelo presente, venho, respeitosamente, à presença de Vossa Excelência solicitar a <b>remessa de cópias integrais</b> dos autos em referência, especificamente documentos relativos a <b>${textoLivre || '________________'}</b>.</p>
            <p>Tais documentos são necessários para a instrução de Notícia de Fato Criminal em trâmite nesta Promotoria de Justiça para análise de eventual conduta delituosa.</p>
            <p>Na oportunidade, apresento protestos de estima e consideração.</p>
            `;
            break;
        case 'GAESP_ABUSO':
            body = `
            <p><b>EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) PROMOTOR(A) DE JUSTIÇA DO GAESP,</b></p>
            <br>
            <p>Encaminho cópia do processo em epígrafe a fim de solicitar providências quanto a indícios de <b>abuso de autoridade e controle inadequado do uso de BODYCAMs</b> por parte dos policiais militares envolvidos na operação.</p>
            <p>As gravações evidenciam manuseio inadequado, com obstrução de lentes em momentos cruciais e entrada em domicílio sem mandado judicial ou situação de flagrante, além de agressão física registrada.</p>
            <p>Encaminho em anexo a cronologia detalhada dos eventos captados pelas câmeras corporais.</p>
            `;
            break;
        default: // GERAL_DP
            body = `
            <p><b>EXCELENTÍSSIMO SENHOR DELEGADO DE POLÍCIA,</b></p>
            <br>
            <p>Pelo presente, venho solicitar a Vossa Senhoria esclarecimentos sobre o destino do BO nº <b>${identificacaoObjeto || '____'}</b>, bem como informações sobre o atual estágio das investigações.</p>
            <p>${textoLivre || 'Diligências adicionais conforme cota ministerial anexa.'}</p>
            <p>Respeitosamente,</p>
            `;
        }
    }

    return `
      <div style="font-family: 'Times New Roman', Times, serif; font-size: 14px; color: #000; line-height: 1.5; text-align: justify;">
        ${header}
        ${body}
        ${footerAssinatura}
      </div>
    `;
  }, [numeroOficio, processo, promotorName, cargo, template, orgaoNome, destinatarioNome, endereco, emailOrgao, textoLivre, identificacaoObjeto, reuNome, iaBody]);

  const handleCopy = () => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = generatedContent;
    const plainText = tempDiv.innerText;
    const htmlBlob = new Blob([generatedContent], { type: 'text/html' });
    const textBlob = new Blob([plainText], { type: 'text/plain' });
    navigator.clipboard.write([
      new ClipboardItem({ 'text/html': htmlBlob, 'text/plain': textBlob })
    ]).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-1 overflow-hidden animate-in fade-in duration-500">
      <div className="w-[420px] bg-white border-r border-slate-200 p-6 flex flex-col gap-4 shadow-xl z-10 overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-red-600 rounded-lg text-white"><FileText size={20} /></div>
          <div>
            <h2 className="font-bold uppercase tracking-tight">Gerador de Ofícios</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Modelos Padronizados 4ª PJCrim</p>
          </div>
        </div>

        {/* Template Selector */}
        <div className="space-y-3">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tipo de Ofício / Finalidade</label>
          <button
                onClick={() => setTemplate('GERACAO_IA')}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-bold transition-all mb-2 ${template === 'GERACAO_IA' ? 'bg-violet-600 border-violet-700 text-white shadow-md' : 'bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100'}`}
          >
             <Bot size={18}/> Geração Automática (IA)
          </button>
          
          <div className="grid grid-cols-1 gap-2">
            {[
              { id: 'GERAL_DP', label: 'Geral (Delegacia/DP)', icon: <Send size={12}/> },
              { id: 'URGENCIA_IC', label: 'Urgência Laudo (IC)', icon: <AlertTriangle size={12}/> },
              { id: 'INQUERITO_APARTADO', label: 'Inquérito Apartado (Geral)', icon: <FileText size={12}/> },
              { id: 'CORREGEDORIA', label: 'Corregedoria (Atraso)', icon: <Mail size={12}/> },
              { id: 'PEDIDO_COPIAS_JUIZO', label: 'Cópias (Juízo Cível)', icon: <FileText size={12}/> },
              { id: 'GAESP_ABUSO', label: 'GAESP (Abuso Policial)', icon: <AlertTriangle size={12}/> }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTemplate(t.id as OficioTemplate)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-left text-xs font-bold transition-all ${template === t.id ? 'bg-red-50 border-red-200 text-red-700 shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'}`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        <hr className="border-slate-100 my-2" />

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nº Ofício</label>
              <input type="text" value={numeroOficio} onChange={(e) => setNumeroOficio(e.target.value)} placeholder="0177/24" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Processo nº</label>
              <input type="text" value={processo} onChange={(e) => setProcesso(e.target.value)} placeholder="0000000-00..." className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cargo do Remetente</label>
            <select value={cargo} onChange={(e) => setCargo(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none">
              <option value="">Selecione o Cargo...</option>
              {PROMOTORIAS.map(p => <option key={p.label} value={p.label}>{p.label}</option>)}
            </select>
          </div>

          <div className="p-4 bg-slate-900 rounded-2xl space-y-4 shadow-lg border border-slate-800">
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Dados do Destinatário</span>
             
             <input type="text" placeholder="Nome do Órgão (Ex: 13º D.P. Casa Verde)" value={orgaoNome} onChange={(e) => setOrgaoNome(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-red-500" />
             
             <input type="text" placeholder="A/C: Nome do Delegado/Diretor" value={destinatarioNome} onChange={(e) => setDestinatarioNome(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-red-500" />

             <input type="text" placeholder="Endereço Completo" value={endereco} onChange={(e) => setEndereco(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-red-500" />

             <input type="email" placeholder="E-mail do Órgão" value={emailOrgao} onChange={(e) => setEmailOrgao(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-red-500" />
          </div>

          {/* Dynamic Inputs based on Template */}
          {template === 'GERACAO_IA' ? (
             <div className="space-y-4 animate-in fade-in duration-300 bg-violet-50/50 p-4 rounded-2xl border border-violet-100">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={16} className="text-violet-600"/>
                    <h3 className="text-sm font-bold text-violet-900">Configuração da IA</h3>
                </div>

                {/* Upload Section */}
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Contexto (PDF ou Texto)</label>
                   
                   {!iaFile ? (
                     <label className="flex items-center justify-center w-full h-16 border-2 border-dashed border-violet-200 rounded-xl cursor-pointer bg-white hover:bg-violet-50 transition-all gap-2 group mb-2">
                       <Upload size={16} className="text-violet-400 group-hover:text-violet-600"/>
                       <span className="text-xs text-violet-500 font-bold group-hover:text-violet-700">Anexar PDF (Processo/Cota)</span>
                       <input type="file" className="hidden" accept="application/pdf" onChange={(e) => e.target.files && setIaFile(e.target.files[0])} />
                     </label>
                   ) : (
                     <div className="flex items-center justify-between w-full p-2 bg-white border border-violet-200 rounded-xl mb-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                           <div className="p-1.5 bg-violet-100 rounded text-violet-600"><Paperclip size={14}/></div>
                           <span className="text-xs font-bold text-slate-700 truncate max-w-[180px]">{iaFile.name}</span>
                        </div>
                        <button onClick={() => setIaFile(null)} className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"><X size={14}/></button>
                     </div>
                   )}

                   <textarea 
                     value={iaContexto} 
                     onChange={(e) => setIaContexto(e.target.value)} 
                     placeholder="Ou cole trechos de texto aqui..." 
                     className="w-full bg-white border border-slate-200 rounded-lg p-3 text-xs outline-none focus:ring-2 focus:ring-violet-400 h-20 resize-none placeholder-slate-400"
                   />
                </div>

                {/* Instruction Section */}
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">O que a IA deve escrever?</label>
                   <textarea 
                     value={iaInstrucao} 
                     onChange={(e) => setIaInstrucao(e.target.value)} 
                     placeholder="Ex: Peça prioridade na perícia devido à réu preso; Requisite folha de antecedentes atualizada..." 
                     className="w-full bg-white border border-violet-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-violet-400 h-24 resize-none shadow-sm"
                   />
                </div>

                <button
                   onClick={handleGenerateIA}
                   disabled={isGenerating || !iaInstrucao.trim()}
                   className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2"
                >
                   {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                   {isGenerating ? 'Escrevendo Ofício...' : 'Gerar Texto com IA'}
                </button>
             </div>
          ) : (
            <>
              {(template === 'URGENCIA_IC' || template === 'GERAL_DP') && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Identificação do Objeto (Placa/BO/Série)</label>
                  <input type="text" value={identificacaoObjeto} onChange={(e) => setIdentificacaoObjeto(e.target.value)} placeholder="Ex: Placa ABC-1234..." className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none" />
                </div>
              )}

              {(template === 'INQUERITO_APARTADO') && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nome do Investigado / Réu</label>
                  <input type="text" value={reuNome} onChange={(e) => setReuNome(e.target.value)} placeholder="Ex: Nome do Indiciado..." className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none" />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  {template === 'INQUERITO_APARTADO' ? 'O que deve ser apurado?' : 'Observações / Texto Complementar'}
                </label>
                <textarea 
                  value={textoLivre} 
                  onChange={(e) => setTextoLivre(e.target.value)} 
                  placeholder={template === 'INQUERITO_APARTADO' ? "Ex: a procedência do veículo apreendido..." : "Detalhes adicionais do pedido..."} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none h-24" 
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 bg-slate-100 p-10 overflow-y-auto flex flex-col items-center">
        <div className="w-full max-w-[800px] bg-white shadow-2xl border border-slate-200 rounded-sm p-16 min-h-[850px] relative">
          <div dangerouslySetInnerHTML={{ __html: generatedContent }} />
          <button 
            onClick={handleCopy}
            className={`absolute top-6 right-6 px-6 py-2.5 rounded-lg shadow-md flex items-center gap-2 font-bold transition-all ${copied ? 'bg-green-600 text-white' : 'bg-red-600 text-white hover:bg-red-700'}`}
          >
            {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
            {copied ? 'Copiado!' : 'Copiar Ofício'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OficioTool;
