
import React, { useState, useCallback } from 'react';
import { Upload, Gavel, Copy, CheckCircle, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

interface ExtractedData {
  numeroProcesso: string;
  nomeParte: string;
  cpf: string;
  cep: string;
  endereco: string;
  numero: string;
  estaPreso: string;
}

const MultaPenalTool: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ExtractedData | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const extractDataFromImage = async (base64Data: string, mimeType: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Extraia rigorosamente as seguintes informações desta certidão de multa penal:
      1. Número do Processo
      2. Nome da Parte (conforme consta em Dados do Devedor)
      3. CPF
      4. CEP
      5. Endereço Completo (IMPORTANTE: Se no campo 'Local de Prisão' houver uma unidade prisional ATIVA e não apenas alvará de soltura, use o endereço da prisão. Caso contrário, use o endereço residencial em 'Dados do Devedor')
      6. Número do endereço
      7. Está preso? (Responda SIM ou NÃO. Se houver unidade prisional indicada em 'Local de Prisão', responda SIM)

      Retorne APENAS um JSON válido seguindo este esquema:
      {
        "numeroProcesso": string,
        "nomeParte": string,
        "cpf": string,
        "cep": string,
        "endereco": string,
        "numero": string,
        "estaPreso": "SIM" | "NÃO"
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            parts: [
              { inlineData: { data: base64Data, mimeType } },
              { text: prompt }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              numeroProcesso: { type: Type.STRING },
              nomeParte: { type: Type.STRING },
              cpf: { type: Type.STRING },
              cep: { type: Type.STRING },
              endereco: { type: Type.STRING },
              numero: { type: Type.STRING },
              estaPreso: { type: Type.STRING }
            },
            required: ["numeroProcesso", "nomeParte", "cpf", "cep", "endereco", "numero", "estaPreso"]
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      setData(result);
    } catch (err) {
      console.error(err);
      setError("Falha ao processar o documento. Verifique se o arquivo é legível e tente novamente.");
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
      extractDataFromImage(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const DataItem = ({ label, value, field }: { label: string; value: string; field: string }) => (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between group hover:border-purple-300 transition-all">
      <div className="min-w-0 flex-1">
        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</span>
        <span className="block text-sm font-bold text-slate-700 truncate uppercase">{value || "Não identificado"}</span>
      </div>
      <button 
        onClick={() => copyToClipboard(value, field)}
        className={`ml-4 p-2 rounded-lg transition-all ${copiedField === field ? 'bg-green-100 text-green-600' : 'bg-white text-slate-400 border border-slate-200 hover:border-purple-500 hover:text-purple-600'}`}
      >
        {copiedField === field ? <CheckCircle size={18} /> : <Copy size={18} />}
      </button>
    </div>
  );

  return (
    <div className="flex flex-1 overflow-hidden animate-in fade-in duration-500">
      <div className="w-[420px] bg-white border-r border-slate-200 p-8 flex flex-col gap-6 shadow-xl z-10 overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-600 rounded-lg text-white"><Gavel size={20} /></div>
          <div>
            <h2 className="font-bold uppercase tracking-tight">Multa Penal</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Extração de Certidões</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <label 
              className={`w-full h-48 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${loading ? 'border-purple-300 bg-purple-50 cursor-not-allowed' : 'border-slate-200 hover:border-purple-400 hover:bg-slate-50'}`}
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
                  <Loader2 size={40} className="text-purple-500 animate-spin" />
                  <div className="text-center">
                    <p className="text-sm font-bold text-purple-600">Processando Documento...</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Aguarde o processamento digital</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 bg-purple-100 text-purple-600 rounded-full group-hover:scale-110 transition-transform">
                    <Upload size={28} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-700">Carregar Certidão</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">PDF ou Imagem da Multa</p>
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

          {data && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dados Extraídos</span>
                <button 
                  onClick={() => setData(null)}
                  className="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase tracking-widest flex items-center gap-1"
                >
                  <Trash2 size={12} /> Limpar Tudo
                </button>
              </div>
              
              <DataItem label="Número do Processo" value={data.numeroProcesso} field="processo" />
              <DataItem label="Nome da Parte" value={data.nomeParte} field="nome" />
              <DataItem label="CPF" value={data.cpf} field="cpf" />
              <DataItem label="CEP" value={data.cep} field="cep" />
              <DataItem label="Endereço" value={data.endereco} field="endereco" />
              <DataItem label="Número" value={data.numero} field="numero" />
              
              <div className={`p-4 rounded-xl border flex items-center justify-between ${data.estaPreso === 'SIM' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Situação Carcerária</span>
                  <span className={`text-sm font-black uppercase ${data.estaPreso === 'SIM' ? 'text-red-600' : 'text-green-600'}`}>
                    {data.estaPreso === 'SIM' ? 'ESTÁ PRESO' : 'EM LIBERDADE'}
                  </span>
                </div>
                <button 
                  onClick={() => copyToClipboard(data.estaPreso, 'preso')}
                  className={`p-2 rounded-lg transition-all ${copiedField === 'preso' ? 'bg-green-200 text-green-700' : 'bg-white text-slate-400 border border-slate-200'}`}
                >
                  {copiedField === 'preso' ? <CheckCircle size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 bg-slate-200 p-12 overflow-y-auto flex flex-col items-center justify-center relative">
        {!data && !loading && (
          <div className="text-center space-y-4 max-w-sm animate-in fade-in zoom-in duration-700">
             <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-xl border border-slate-200">
                <Gavel size={40} className="text-purple-500" />
             </div>
             <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Pronto para Extração</h3>
             <p className="text-slate-500 text-sm">Carregue uma certidão de multa penal ao lado para que o sistema identifique os dados do devedor automaticamente.</p>
          </div>
        )}

        {loading && (
           <div className="flex flex-col items-center gap-6 animate-pulse">
              <div className="w-[500px] h-[700px] bg-white rounded-lg shadow-2xl flex flex-col p-12 gap-8">
                 <div className="h-8 w-1/2 bg-slate-100 rounded-full"></div>
                 <div className="h-4 w-full bg-slate-50 rounded-full"></div>
                 <div className="h-4 w-3/4 bg-slate-50 rounded-full"></div>
                 <div className="mt-8 space-y-4">
                    <div className="h-24 w-full bg-slate-50 rounded-2xl"></div>
                    <div className="h-24 w-full bg-slate-50 rounded-2xl"></div>
                    <div className="h-24 w-full bg-slate-50 rounded-2xl"></div>
                 </div>
              </div>
           </div>
        )}

        {data && (
          <div className="w-full max-w-3xl bg-white shadow-2xl border border-slate-300 rounded-sm p-[15mm] min-h-[500px] flex flex-col animate-in zoom-in duration-500">
            <div className="border-b-2 border-slate-900 pb-4 mb-8 flex justify-between items-end">
               <div>
                  <h1 className="text-2xl font-black text-slate-900 uppercase">Resumo da Extração</h1>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Processamento de Dados Cadastrais</p>
               </div>
               <div className="text-right">
                  <p className="text-xs font-bold text-slate-900">Processo: {data.numeroProcesso}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">{new Date().toLocaleDateString('pt-BR')}</p>
               </div>
            </div>

            <div className="space-y-6 text-slate-800">
               <div className="grid grid-cols-2 gap-8">
                  <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Devedor</label>
                     <p className="text-lg font-bold uppercase">{data.nomeParte}</p>
                  </div>
                  <div>
                     <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">CPF</label>
                     <p className="text-lg font-bold">{data.cpf}</p>
                  </div>
               </div>

               <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Localização Confirmada</label>
                  <div className="space-y-1">
                     <p className="text-sm font-bold uppercase">{data.endereco}, {data.numero}</p>
                     <p className="text-xs text-slate-500 font-bold uppercase">CEP: {data.cep}</p>
                  </div>
               </div>

               <div className="mt-auto pt-12 border-t border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase text-center tracking-[0.2em]">Confira os dados antes de inserir no sistema oficial</p>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultaPenalTool;
