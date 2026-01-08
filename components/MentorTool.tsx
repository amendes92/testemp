
import React, { useState } from 'react';
import { BrainCircuit, Upload, Send, FileText, Loader2, Sparkles, Copy, CheckCircle, AlertCircle, X, RefreshCw, FileSignature } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const MentorTool: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  // States for the main analysis
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);

  // States for the "Ofício" generation
  const [oficioPrompt, setOficioPrompt] = useState('');
  const [oficioText, setOficioText] = useState('');
  const [isGeneratingOficio, setIsGeneratingOficio] = useState(false);
  const [copiedOficio, setCopiedOficio] = useState(false);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove prefix like "data:application/pdf;base64,"
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleConsult = async () => {
    if (!prompt.trim() && !file) {
      alert("Por favor, digite sua dúvida ou anexe um arquivo para análise.");
      return;
    }

    handleReset();
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const systemInstruction = "Você é um Mentor Jurídico Sênior e Promotor de Justiça experiente do Ministério Público de São Paulo. Sua função é analisar documentos jurídicos (PDFs), identificar teses, sugerir estratégias processuais e responder a dúvidas do usuário com linguagem técnica, formal e fundamentada. Seja direto, cite artigos de lei quando pertinente e foque na melhor estratégia para a acusação ou fiscalização da lei.";
      
      const parts: any[] = [];

      // Add file if present
      if (file) {
        const base64Data = await fileToBase64(file);
        parts.push({
          inlineData: {
            mimeType: file.type, // 'application/pdf' or 'image/...'
            data: base64Data
          }
        });
      }

      // Add user prompt
      if (prompt.trim()) {
        parts.push({ text: prompt });
      } else {
        parts.push({ text: "Analise este documento e forneça um resumo executivo com pontos de atenção para o Ministério Público." });
      }

      const result = await ai.models.generateContent({
        model: 'gemini-3-pro-preview', // Using Pro model for better legal reasoning
        contents: [{ role: 'user', parts }],
        config: {
          systemInstruction: systemInstruction,
          thinkingConfig: { thinkingBudget: 2048 } // Enabled thinking for complex analysis
        }
      });

      setResponse(result.text || "Não foi possível gerar uma resposta.");

    } catch (error) {
      console.error("Erro na consulta ao Mentor:", error);
      setResponse("Ocorreu um erro ao consultar o Mentor. Verifique o arquivo e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateOficio = async () => {
    if (!oficioPrompt.trim() || !response) return;

    setIsGeneratingOficio(true);
    setOficioText('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const fullOficioPrompt = `
      Você é um Promotor de Justiça experiente do MPSP. Sua tarefa é redigir documentos oficiais.

      ANÁLISE JURÍDICA PRÉVIA (CONTEXTO):
      ---
      ${response}
      ---
      
      INSTRUÇÃO PARA O DOCUMENTO:
      "${oficioPrompt}"
      
      Com base no contexto e na instrução, elabore o ofício solicitado. O documento deve ser formal, técnico e seguir o padrão do Ministério Público de São Paulo. Inclua placeholders para dados como número do ofício, processo, data e nome do promotor.
      `;

      const result = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [{ parts: [{ text: fullOficioPrompt }] }],
        config: {
          thinkingConfig: { thinkingBudget: 2048 }
        }
      });

      setOficioText(result.text || "Não foi possível gerar o ofício.");

    } catch (error) {
      console.error("Erro na geração do ofício:", error);
      setOficioText("Ocorreu um erro ao gerar o ofício. Tente novamente.");
    } finally {
      setIsGeneratingOficio(false);
    }
  };


  const handleReset = () => {
    setPrompt('');
    setFile(null);
    setResponse('');
    setOficioPrompt('');
    setOficioText('');
  };

  const handleCopy = (text: string, type: 'response' | 'oficio') => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'response') {
        setCopiedResponse(true);
        setTimeout(() => setCopiedResponse(false), 2000);
      } else {
        setCopiedOficio(true);
        setTimeout(() => setCopiedOficio(false), 2000);
      }
    });
  };

  // Simple formatter for bold text
  const renderFormattedText = (text: string) => {
    return text.split(/(\*\*.*?\*\*)/g).map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-violet-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="flex flex-1 overflow-hidden animate-in fade-in duration-500">
      {/* Sidebar - Input Area */}
      <div className="w-full md:w-[420px] bg-white border-r border-slate-200 p-6 flex flex-col gap-6 shadow-xl z-10 overflow-y-auto custom-scrollbar">
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-600 rounded-lg text-white">
            <BrainCircuit size={20} />
          </div>
          <div>
            <h2 className="font-bold uppercase tracking-tight">Mentor Jurídico</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">IA & Consultoria Estratégica</p>
          </div>
        </div>

        <div className="p-4 bg-violet-50 rounded-xl border border-violet-100 mb-2">
          <p className="text-xs text-violet-800 leading-relaxed">
            Olá. Sou seu assistente sênior. Anexe peças, inquéritos ou decisões (PDF) e pergunte sobre estratégias, jurisprudência ou análise de mérito.
          </p>
        </div>

        <div className="space-y-4 flex-1">
          {/* File Upload */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
              Documento para Análise (PDF)
            </label>
            {!file ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-violet-300 transition-all group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload size={24} className="text-slate-400 mb-2 group-hover:text-violet-500 transition-colors" />
                  <p className="text-xs text-slate-500 font-bold group-hover:text-violet-600">Carregar Documento</p>
                  <p className="text-[10px] text-slate-400">PDF (Max 10MB)</p>
                </div>
                <input type="file" className="hidden" accept="application/pdf" onChange={handleFileChange} />
              </label>
            ) : (
              <div className="flex items-center justify-between w-full p-3 bg-violet-50 border border-violet-200 rounded-xl animate-in fade-in">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-white rounded-lg text-violet-600">
                     <FileText size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-violet-900 truncate">{file.name}</p>
                    <p className="text-[10px] text-violet-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button 
                  onClick={() => setFile(null)}
                  className="p-1.5 text-violet-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Prompt Input */}
          <div className="flex flex-col flex-1 min-h-[200px]">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
              Sua Solicitação ou Dúvida
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Resuma os pontos principais deste inquérito e sugira diligências faltantes. Ou: Analise a tese da defesa nas fls. X e sugira contra-argumentos."
              className="w-full flex-1 bg-white border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition-all placeholder-slate-400 text-slate-700 resize-none shadow-sm"
            />
          </div>
          
          <div className="flex gap-2">
             <button
                onClick={handleReset}
                disabled={isLoading}
                className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all disabled:opacity-50"
                title="Limpar tudo"
             >
                <RefreshCw size={20} />
             </button>
             <button
                onClick={handleConsult}
                disabled={isLoading || (!prompt && !file)}
                className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2 transform active:scale-95"
             >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                {isLoading ? 'Pensando...' : 'Consultar Mentor'}
             </button>
          </div>
        </div>
      </div>

      {/* Main Content - Response Area */}
      <div className="flex-1 bg-slate-100 p-8 overflow-y-auto custom-scrollbar flex flex-col items-center">
        {!response && !isLoading && (
          <div className="text-center space-y-4 max-w-md animate-in fade-in zoom-in duration-700 mt-20">
             <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-xl border border-slate-200">
                <BrainCircuit size={40} className="text-violet-500" />
             </div>
             <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Sala do Mentor</h3>
             <p className="text-slate-500 text-sm">
               Utilize este espaço para obter <i>insights</i> rápidos sobre processos complexos. A IA analisará o contexto e fornecerá diretrizes baseadas na atuação do Ministério Público.
             </p>
          </div>
        )}

        {isLoading && (
           <div className="flex flex-col items-center gap-6 animate-pulse mt-20 w-full max-w-3xl">
              <div className="w-full h-80 bg-white rounded-2xl shadow-xl flex flex-col p-8 gap-6 border border-slate-200">
                 <div className="flex items-center gap-4 mb-4">
                    <div className="h-10 w-10 bg-slate-100 rounded-full"></div>
                    <div className="h-4 w-1/3 bg-slate-100 rounded-full"></div>
                 </div>
                 <div className="h-4 w-full bg-slate-50 rounded-full"></div>
                 <div className="h-4 w-full bg-slate-50 rounded-full"></div>
                 <div className="h-4 w-3/4 bg-slate-50 rounded-full"></div>
                 <div className="h-4 w-full bg-slate-50 rounded-full"></div>
                 <div className="h-4 w-1/2 bg-slate-50 rounded-full"></div>
              </div>
              <p className="text-violet-600 font-bold text-sm animate-bounce">Processando análise jurídica...</p>
           </div>
        )}

        {response && (
          <div className="w-full max-w-4xl flex flex-col gap-8 animate-in slide-in-from-bottom duration-500">
             {/* Parecer Card */}
             <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-lg border border-slate-200 sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-violet-100 text-violet-600 rounded-lg">
                          <BrainCircuit size={18} />
                       </div>
                       <span className="text-xs font-bold text-violet-700 uppercase tracking-widest">Parecer do Mentor</span>
                    </div>
                    <button 
                      onClick={() => handleCopy(response, 'response')}
                      className={`px-6 py-2 rounded-xl shadow-sm flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest transition-all transform active:scale-95 ${copiedResponse ? 'bg-green-600 text-white' : 'bg-slate-800 text-white hover:bg-slate-900'}`}
                    >
                      {copiedResponse ? <CheckCircle size={16} /> : <Copy size={16} />}
                      {copiedResponse ? 'Copiado!' : 'Copiar Texto'}
                    </button>
                </div>

                <div className="bg-white shadow-2xl border border-slate-300 rounded-sm p-12 text-slate-800 leading-relaxed text-justify whitespace-pre-wrap font-serif text-[1.05rem]">
                    {renderFormattedText(response)}
                </div>
             </div>

             {/* Oficio Generation Card */}
             <div className="flex flex-col gap-4 bg-slate-900/50 backdrop-blur-sm border border-violet-300/20 rounded-2xl p-6 shadow-2xl sticky top-[104px] z-10">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-violet-300 text-violet-900 rounded-lg"><FileSignature size={18} /></div>
                   <span className="text-xs font-bold text-white uppercase tracking-widest">Ações Práticas</span>
                </div>
                <textarea
                   value={oficioPrompt}
                   onChange={(e) => setOficioPrompt(e.target.value)}
                   placeholder="Com base na análise, instrua a IA sobre o ofício. Ex: Elabore um ofício requisitando o laudo pericial faltante à Polícia Científica com urgência."
                   className="w-full h-20 bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-500 outline-none focus:ring-2 focus:ring-violet-400 resize-none shadow-inner"
                />
                <button
                   onClick={handleGenerateOficio}
                   disabled={isGeneratingOficio || !oficioPrompt.trim()}
                   className="bg-violet-500 hover:bg-violet-600 disabled:bg-slate-500 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2 transform active:scale-95"
                >
                   {isGeneratingOficio ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                   {isGeneratingOficio ? 'Elaborando...' : 'Gerar Ofício'}
                </button>
             </div>

             {/* Oficio Result Card */}
             {isGeneratingOficio && (
                <div className="w-full h-80 bg-white rounded-2xl shadow-xl p-8 border border-slate-200 animate-pulse flex flex-col gap-4">
                  <div className="h-4 w-1/4 bg-slate-100 rounded-full"></div>
                  <div className="h-3 w-full bg-slate-50 rounded-full"></div>
                  <div className="h-3 w-full bg-slate-50 rounded-full"></div>
                  <div className="h-3 w-3/4 bg-slate-50 rounded-full"></div>
                </div>
             )}
             {oficioText && (
                <div className="flex flex-col gap-6 animate-in slide-in-from-bottom duration-500">
                    <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-lg border border-slate-200 sticky top-[104px] z-20">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-violet-100 text-violet-600 rounded-lg">
                              <FileSignature size={18} />
                           </div>
                           <span className="text-xs font-bold text-violet-700 uppercase tracking-widest">Minuta do Ofício</span>
                        </div>
                        <button 
                          onClick={() => handleCopy(oficioText, 'oficio')}
                          className={`px-6 py-2 rounded-xl shadow-sm flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest transition-all transform active:scale-95 ${copiedOficio ? 'bg-green-600 text-white' : 'bg-slate-800 text-white hover:bg-slate-900'}`}
                        >
                          {copiedOficio ? <CheckCircle size={16} /> : <Copy size={16} />}
                          {copiedOficio ? 'Copiado!' : 'Copiar Ofício'}
                        </button>
                    </div>

                    <div className="bg-white shadow-2xl border border-slate-300 rounded-sm p-12 text-slate-800 leading-relaxed whitespace-pre-wrap font-serif text-base">
                       {renderFormattedText(oficioText)}
                    </div>
                </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorTool;
