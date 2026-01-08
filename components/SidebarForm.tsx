
import React, { useState } from 'react';
import { Person } from '../types';
import { Plus, Trash2, Users, UserPlus, X, Sparkles, Loader2, ClipboardType } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

interface SidebarFormProps {
  onAddPerson: (person: Person) => void;
  people: Person[];
  onRemovePerson: (id: string) => void;
}

const SidebarForm: React.FC<SidebarFormProps> = ({ onAddPerson, people, onRemovePerson }) => {
  const initialFormState = {
    folha: '',
    nome: '',
    dataNascimento: '',
    rg: '',
    cpf: '',
    mae: '',
    pai: '',
    nacionalidade: 'Brasileiro'
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isAiMode, setIsAiMode] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  // Helper para validação real de CPF (Algoritmo da Receita Federal)
  const validateCPF = (cpf: string) => {
    const strCPF = cpf.replace(/[^\d]+/g, '');
    if (strCPF === '') return true; // Permite vazio se não for obrigatório, mas aqui validamos se preenchido
    if (strCPF.length !== 11) return false;

    // Elimina CPFs invalidos conhecidos
    if (
      strCPF === "00000000000" ||
      strCPF === "11111111111" ||
      strCPF === "22222222222" ||
      strCPF === "33333333333" ||
      strCPF === "44444444444" ||
      strCPF === "55555555555" ||
      strCPF === "66666666666" ||
      strCPF === "77777777777" ||
      strCPF === "88888888888" ||
      strCPF === "99999999999"
    ) return false;

    let soma = 0;
    let resto;

    for (let i = 1; i <= 9; i++) 
      soma = soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
      
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(strCPF.substring(9, 10))) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) 
      soma = soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i);
      
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(strCPF.substring(10, 11))) return false;

    return true;
  };

  // Helper para formatar CPF: 000.000.000-00
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 11);
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2');
  };

  // Helper para formatar RG (Padrão SP: 00.000.000-X)
  const formatRG = (value: string) => {
    const raw = value.toUpperCase().replace(/[^0-9X]/g, '').slice(0, 9);
    
    if (raw.length <= 2) return raw;
    if (raw.length <= 5) return raw.replace(/^(\d{2})(\d+)/, '$1.$2');
    if (raw.length <= 8) return raw.replace(/^(\d{2})(\d{3})(\d+)/, '$1.$2.$3');
    return raw.replace(/^(\d{2})(\d{3})(\d{3})([0-9X])/, '$1.$2.$3-$4');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue = value;

    // Aplica máscaras conforme digitação
    if (name === 'cpf') {
      newValue = formatCPF(value);
    } else if (name === 'rg') {
      newValue = formatRG(value);
    }

    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleClear = () => {
    setFormData(initialFormState);
    setAiInput('');
  };

  const handleAdd = () => {
    // Validação de Nome
    if (!formData.nome.trim()) {
        alert("O nome da parte é obrigatório.");
        return;
    }

    // Validação de Data de Nascimento (Parsing seguro)
    if (formData.dataNascimento) {
      const parts = formData.dataNascimento.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const day = parseInt(parts[2]);
        
        const selectedDate = new Date(year, month, day);
        const today = new Date();
        today.setHours(0,0,0,0);

        if (selectedDate > today) {
          alert("A data de nascimento não pode ser no futuro.");
          return;
        }
        if (year < 1900) {
          alert("O ano de nascimento parece incorreto (antes de 1900).");
          return;
        }
      }
    }

    // Validação Robusta de CPF
    if (formData.cpf && formData.cpf.length > 0) {
       if (!validateCPF(formData.cpf)) {
          alert("O CPF informado é inválido. Verifique os dígitos verificadores.");
          return;
       }
    }

    // Validação de RG (mínimo de caracteres úteis)
    if (formData.rg && formData.rg.length > 0) {
      const cleanRG = formData.rg.replace(/[^0-9X]/gi, '');
      if (cleanRG.length < 5) {
         alert("O RG informado parece muito curto. Verifique o número.");
         return;
      }
    }

    const newPerson: Person = {
      id: crypto.randomUUID(),
      ...formData
    };

    onAddPerson(newPerson);
    handleClear();
  };

  const handleAiParse = async () => {
    if (!aiInput.trim()) return;
    
    setIsParsing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Extraia os dados desta pessoa para uma pesquisa de antecedentes (NI).
      Texto: "${aiInput}"
      
      Extraia rigorosamente:
      - nome (Nome completo)
      - folha (Número da folha no processo, se houver)
      - nacionalidade (Ex: Brasileiro, Estrangeiro)
      - cpf (Apenas números ou formatado)
      - rg (Apenas números ou formatado)
      - pai (Nome do pai)
      - mae (Nome da mãe)
      - dataNascimento (Data de nascimento no formato YYYY-MM-DD)`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              nome: { type: Type.STRING },
              folha: { type: Type.STRING },
              nacionalidade: { type: Type.STRING },
              cpf: { type: Type.STRING },
              rg: { type: Type.STRING },
              pai: { type: Type.STRING },
              mae: { type: Type.STRING },
              dataNascimento: { type: Type.STRING }
            },
            required: ["nome"]
          }
        }
      });

      const extracted = JSON.parse(response.text || "{}");
      
      // Aplicar formatação aos dados extraídos pela IA também
      const formattedCpf = extracted.cpf ? formatCPF(extracted.cpf) : '';
      const formattedRg = extracted.rg ? formatRG(extracted.rg) : '';

      setFormData(prev => ({
        ...prev,
        ...extracted,
        cpf: formattedCpf || prev.cpf,
        rg: formattedRg || prev.rg,
        nacionalidade: extracted.nacionalidade || prev.nacionalidade
      }));
      setIsAiMode(false);
      setAiInput('');
    } catch (error) {
      console.error("Erro ao analisar com IA:", error);
      alert("Não foi possível processar o texto. Tente inserir manualmente.");
    } finally {
      setIsParsing(false);
    }
  };

  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all placeholder-slate-400 text-slate-700";
  const labelClass = "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1";

  return (
    <div className="w-full md:w-[380px] bg-white flex flex-col h-full border-r border-slate-200 shadow-2xl relative z-10">
      {/* Dynamic Header */}
      <div className="bg-slate-900 p-6 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="flex items-center gap-3 relative z-10">
            <div className="p-2 bg-amber-500 rounded-lg">
                <Users size={20} className="text-slate-900" />
            </div>
            <div>
                <h2 className="font-bold text-lg leading-tight uppercase tracking-tight">Pesquisa NI</h2>
                <p className="text-slate-400 text-xs font-medium">CADASTRO DE PARTES</p>
            </div>
        </div>
      </div>

      {/* Form Fields Section */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <UserPlus size={16} className="text-amber-500" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nova Parte</span>
            </div>
            <button 
              onClick={() => setIsAiMode(!isAiMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${isAiMode ? 'bg-amber-500 border-amber-600 text-white' : 'bg-slate-50 border-slate-200 text-amber-600 hover:bg-amber-50'}`}
            >
              <Sparkles size={12} /> {isAiMode ? 'Fechar IA' : 'Modo IA'}
            </button>
          </div>

          {isAiMode ? (
            <div className="space-y-3 animate-in fade-in slide-in-from-top duration-300">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                   <ClipboardType size={12} /> Cole o parágrafo da denúncia ou BO
                </p>
                <textarea
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Ex: O denunciado JOÃO DA SILVA, brasileiro, fls. 40, portador do RG..."
                  className="w-full h-32 bg-white border border-amber-200 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                />
                <button
                  onClick={handleAiParse}
                  disabled={isParsing || !aiInput.trim()}
                  className="w-full mt-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isParsing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  {isParsing ? 'Analisando...' : 'Extrair com IA'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-1">
                  <label className={labelClass}>Fls.</label>
                  <input
                    type="text"
                    name="folha"
                    placeholder="00"
                    value={formData.folha}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div className="col-span-3">
                  <label className={labelClass}>Nome Completo *</label>
                  <input
                    type="text"
                    name="nome"
                    placeholder="Digite o nome..."
                    value={formData.nome}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Data de Nascimento</label>
                <input
                  type="date"
                  name="dataNascimento"
                  value={formData.dataNascimento}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]} // Impede seleção futura no calendário nativo
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelClass}>RG</label>
                  <input
                    type="text"
                    name="rg"
                    placeholder="00.000.000-X"
                    value={formData.rg}
                    onChange={handleChange}
                    maxLength={12}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>CPF</label>
                  <input
                    type="text"
                    name="cpf"
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={handleChange}
                    maxLength={14}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Nome da Mãe</label>
                <input
                  type="text"
                  name="mae"
                  placeholder="Nome da mãe..."
                  value={formData.mae}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              
              <div>
                <label className={labelClass}>Nome do Pai</label>
                <input
                  type="text"
                  name="pai"
                  placeholder="Nome do pai..."
                  value={formData.pai}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Nacionalidade</label>
                <input
                  type="text"
                  name="nacionalidade"
                  placeholder="Brasileiro"
                  value={formData.nacionalidade}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  onClick={handleClear}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 border border-slate-200"
                >
                  <Trash2 size={16} /> Limpar
                </button>
                <button 
                  onClick={handleAdd}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transform active:scale-95"
                >
                  <Plus size={16} /> Adicionar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Added People List */}
        {people.length > 0 && (
          <div className="border-t border-slate-100 bg-slate-50/50 p-6">
            <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Partes Adicionadas ({people.length})</span>
            </div>
            <div className="space-y-2">
              {people.map(person => (
                <div key={person.id} className="bg-white border border-slate-200 p-3 rounded-xl flex items-center justify-between shadow-sm animate-in slide-in-from-left duration-300">
                   <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{person.nome}</p>
                      <p className="text-[10px] text-slate-400">Fls. {person.folha || 'N/A'}</p>
                   </div>
                   <button 
                    onClick={() => onRemovePerson(person.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                   >
                     <X size={16} />
                   </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarForm;
