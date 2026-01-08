
import React, { useState } from 'react';
import { Upload, Archive, Copy, CheckCircle, Loader2, AlertCircle, Trash2, FileText } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const ArchivingPromotionTool: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const extractTextFromDoc = async (base64Data: string, mimeType: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Extraia o texto integral desta PROMOÇÃO DE ARQUIVAMENTO ministerial.
      
      REGRAS CRÍTICAS:
      1. IGNORE completamente qualquer texto que esteja nas margens laterais (metadados de assinatura digital, links do esaj, códigos de barras laterais).
      2. IGNORE cabeçalhos repetitivos de páginas se houver.
      3. Mantenha a formatação de parágrafos.
      4. Comece o texto pelo título (ex: EXCELENTÍSSIMO SENHOR JUIZ ou PROMOÇÃO DE ARQUIVAMENTO).
      5. Remova as marcas d'água de "Cópia Digital" ou similares.
      6. Retorne apenas o texto limpo e formatado.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            parts: [
              { inlineData: { data: base64Data, mimeType } },
              { text: prompt }
            ]
          }
        ]
      });

      setExtractedText(response.text || "");
    } catch (err) {
      console.error(err);
      setError("Falha ao processar o arquivo. Verifique se o documento está legível.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      extractTextFromDoc(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleCopy = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-1 overflow-hidden animate-in fade-in duration-500">
      <div className="w-[420px] bg-white border-r border-slate-200 p-8 flex flex-col gap-6 shadow-xl z-10 overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-700 rounded-lg text-white"><Archive size={20} /></div>
          <div>
            <h2 className="font-bold uppercase tracking-tight">Arquivamento</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Extração e Limpeza</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <label 
              className={`w-full h-48 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${loading ? 'border-slate-300 bg-slate-50 cursor-not-allowed' : 'border-slate-200 hover:border-slate-400 hover:bg-slate-50'}`}
            >
              <input 
                type="file" 
                className="hidden" 
                accept="image/*,application/pdf" 
                onChange={handleFileUpload}
                disabled={loading}
              />
              {loading ? (
                <>
                  <Loader2 size={40} className="text-slate-500 animate-spin" />
                  <div className="text-center px-4">
                    <p className="text-sm font-bold text-slate-600">Limpando Documento...</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Removendo assinaturas laterais</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 bg-slate-100 text-slate-600 rounded-full group-hover:scale-110 transition-transform">
                    <Upload size={28} />
                  </div>
                  <div className="text-center px-4">
                    <p className="text-sm font-bold text-slate-700">Carregar Promoção</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">PDF ou Imagem da Peça</p>
                  </div>
                </>
              )}
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex gap-3 animate-in slide-in-from-top duration-300">
              <AlertCircle size={20} className="text-red-500 shrink-0" />
              <p className="text-xs text-red-600 font-medium leading-relaxed">{error}</p>
            </div>
          )}

          {extractedText && (
            <div className="pt-4 border-t border-slate-100">
               <button 
                  onClick={() => setExtractedText(null)}
                  className="w-full bg-slate-100 text-slate-500 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-600 transition-all"
                >
                  <Trash2 size={14} /> Descartar Resultado
                </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 bg-slate-200 p-12 overflow-y-auto flex flex-col items-center custom-scrollbar relative">
        {!extractedText && !loading && (
          <div className="text-center space-y-4 max-w-sm animate-in fade-in zoom-in duration-700 mt-20">
             <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-xl border border-slate-200">
                <Archive size={40} className="text-slate-500" />
             </div>
             <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Limpeza de Texto</h3>
             <p className="text-slate-500 text-sm">O sistema irá extrair apenas o conteúdo da promoção, ignorando assinaturas e metadados das margens laterais.</p>
          </div>
        )}

        {loading && (
           <div className="flex flex-col items-center gap-6 animate-pulse mt-20">
              <div className="w-[600px] h-[400px] bg-white rounded-lg shadow-2xl flex flex-col p-12 gap-8">
                 <div className="h-6 w-3/4 bg-slate-100 rounded-full"></div>
                 <div className="h-4 w-full bg-slate-50 rounded-full"></div>
                 <div className="h-4 w-full bg-slate-50 rounded-full"></div>
                 <div className="h-4 w-full bg-slate-50 rounded-full"></div>
                 <div className="h-4 w-1/2 bg-slate-50 rounded-full"></div>
              </div>
           </div>
        )}

        {extractedText && (
          <div className="w-full max-w-4xl flex flex-col gap-6 animate-in slide-in-from-bottom duration-500">
             <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-lg border border-slate-200 sticky top-0 z-20">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                      <FileText size={18} />
                   </div>
                   <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Texto Extraído e Limpo</span>
                </div>
                <button 
                  onClick={handleCopy}
                  className={`px-8 py-2.5 rounded-xl shadow-md flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest transition-all transform active:scale-95 ${copied ? 'bg-green-600 text-white' : 'bg-slate-800 text-white hover:bg-slate-900'}`}
                >
                  {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                  {copied ? 'Copiado!' : 'Copiar Texto'}
                </button>
             </div>

             <div className="bg-white shadow-2xl border border-slate-300 rounded-sm p-16 min-h-[800px] whitespace-pre-wrap font-serif text-[13pt] text-slate-900 leading-relaxed text-justify">
                {extractedText}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArchivingPromotionTool;
