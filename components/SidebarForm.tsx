
import React, { useState } from 'react';
import { Person, CaseData } from '../types';
import { Plus, Trash2, Users, UserPlus, X, Sparkles, Loader2, ClipboardType } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { supabase } from '../lib/supabase';

interface SidebarFormProps {
  onAddPerson: (person: Person) => void;
  people: Person[];
  onRemovePerson: (id: string) => void;
  caseData: CaseData;
  userId: string;
}

const SidebarForm: React.FC<SidebarFormProps> = ({ onAddPerson, people, onRemovePerson, caseData, userId }) => {
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
  const [isSaving, setIsSaving] = useState(false);

  // ... (Validation Helpers: validateCPF, formatCPF, formatRG remain same) ...
  const validateCPF = (cpf: string) => {
    const strCPF = cpf.replace(/[^\d]+/g, '');
    if (strCPF === '') return true;
    if (strCPF.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(strCPF)) return false;
    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(strCPF.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(strCPF.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(strCPF.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    return resto === parseInt(strCPF.substring(10, 11));
  };

  const formatCPF = (value: string) => value.replace(/\D/g, '').slice(0, 11).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  const formatRG = (value: string) => value.toUpperCase().replace(/[^0-9X]/g, '').slice(0, 9).replace(/^(\d{2})(\d{3})(\d{3})([0-9X])/, '$1.$2.$3-$4');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === 'cpf') newValue = formatCPF(value);
    else if (name === 'rg') newValue = formatRG(value);
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleClear = () => {
    setFormData(initialFormState);
    setAiInput('');
  };

  const handleAdd = async () => {
    if (!formData.nome.trim()) { alert("Nome é obrigatório."); return; }
    if (!caseData.numeroProcesso) { alert("Informe o número do processo na barra superior antes de adicionar partes."); return; }
    
    // Basic validation logic
    if (formData.cpf && !validateCPF(formData.cpf)) { alert("CPF inválido."); return; }

    // Offline Mode Logic
    if (userId === 'offline') {
        const mockPerson: Person = {
            id: Date.now().toString(), // Temp ID
            case_id: 'offline',
            nome: formData.nome,
            folha: formData.folha,
            nacionalidade: formData.nacionalidade,
            cpf: formData.cpf,
            rg: formData.rg,
            pai: formData.pai,
            mae: formData.mae,
            dataNascimento: formData.dataNascimento
        };
        onAddPerson(mockPerson);
        handleClear();
        return;
    }

    setIsSaving(true);
    try {
        // 1. Check or Create Case
        let caseId: string;
        
        const { data: existingCase, error: searchError } = await supabase
            .from('cases')
            .select('id')
            .eq('numero_processo', caseData.numeroProcesso)
            .single();

        if (existingCase) {
            caseId = existingCase.id;
        } else {
            // Create new case
            const { data: newCase, error: createError } = await supabase
                .from('cases')
                .insert([{
                    numero_processo: caseData.numeroProcesso,
                    cargo_promotoria: caseData.cargo,
                    promotor_responsavel: caseData.promotor,
                    data_audiencia: caseData.dataAudiencia || null,
                    created_by: userId
                }])
                .select()
                .single();
            
            if (createError) throw createError;
            caseId = newCase.id;
        }

        // 2. Insert Person
        const personPayload = {
            case_id: caseId,
            nome: formData.nome,
            folha: formData.folha,
            nacionalidade: formData.nacionalidade,
            cpf: formData.cpf,
            rg: formData.rg,
            pai: formData.pai,
            mae: formData.mae,
            data_nascimento: formData.dataNascimento || null
        };

        const { data: newPerson, error: personError } = await supabase
            .from('people')
            .insert([personPayload])
            .select()
            .single();

        if (personError) throw personError;

        // 3. Update UI
        const uiPerson: Person = {
            id: newPerson.id,
            case_id: newPerson.case_id,
            nome: newPerson.nome,
            folha: newPerson.folha || '',
            nacionalidade: newPerson.nacionalidade || '',
            cpf: newPerson.cpf || '',
            rg: newPerson.rg || '',
            pai: newPerson.pai || '',
            mae: newPerson.mae || '',
            dataNascimento: newPerson.data_nascimento || ''
        };

        onAddPerson(uiPerson);
        handleClear();

    } catch (error: any) {
        console.error("Error saving person:", error);
        alert(`Erro de banco de dados. Salvando localmente.`);
        // Fallback local save
        const mockPerson: Person = {
            id: Date.now().toString(),
            case_id: 'local_fallback',
            nome: formData.nome,
            folha: formData.folha,
            nacionalidade: formData.nacionalidade,
            cpf: formData.cpf,
            rg: formData.rg,
            pai: formData.pai,
            mae: formData.mae,
            dataNascimento: formData.dataNascimento
        };
        onAddPerson(mockPerson);
        handleClear();
    } finally {
        setIsSaving(false);
    }
  };

  const handleAiParse = async () => {
    if (!aiInput.trim()) return;
    setIsParsing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Extraia dados da pessoa (nome, folha, nac, cpf, rg, pai, mae, dataNasc YYYY-MM-DD). JSON. Texto: "${aiInput}"`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });
      const extracted = JSON.parse(response.text || "{}");
      setFormData(prev => ({
        ...prev,
        ...extracted,
        cpf: extracted.cpf ? formatCPF(extracted.cpf) : prev.cpf,
        rg: extracted.rg ? formatRG(extracted.rg) : prev.rg
      }));
      setIsAiMode(false);
      setAiInput('');
    } catch (error) {
      console.error(error);
      alert("Erro na IA.");
    } finally {
      setIsParsing(false);
    }
  };

  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all placeholder-slate-400 text-slate-700";
  const labelClass = "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1";

  return (
    <div className="w-full md:w-[380px] bg-white flex flex-col h-full border-r border-slate-200 shadow-2xl relative z-10">
       <div className="bg-slate-900 p-6 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="flex items-center gap-3 relative z-10">
            <div className="p-2 bg-amber-500 rounded-lg"><Users size={20} className="text-slate-900" /></div>
            <div>
                <h2 className="font-bold text-lg leading-tight uppercase tracking-tight">Pesquisa NI</h2>
                <p className="text-slate-400 text-xs font-medium">CADASTRO DE PARTES</p>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-6 space-y-4">
           {/* ... Toggle AI / Manual ... */}
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
             <div className="space-y-3">
                 <textarea value={aiInput} onChange={(e) => setAiInput(e.target.value)} className="w-full h-32 bg-white border border-amber-200 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-amber-400 resize-none" placeholder="Cole o texto..." />
                 <button onClick={handleAiParse} disabled={isParsing} className="w-full bg-amber-500 text-white py-2 rounded-lg font-bold text-xs uppercase">{isParsing ? 'Processando...' : 'Extrair'}</button>
             </div>
          ) : (
             <div className="space-y-4">
                 {/* Inputs */}
                 <div className="grid grid-cols-4 gap-2">
                    <div className="col-span-1"><label className={labelClass}>Fls.</label><input name="folha" value={formData.folha} onChange={handleChange} className={inputClass} placeholder="00" /></div>
                    <div className="col-span-3"><label className={labelClass}>Nome *</label><input name="nome" value={formData.nome} onChange={handleChange} className={inputClass} /></div>
                 </div>
                 <div><label className={labelClass}>Nascimento</label><input type="date" name="dataNascimento" value={formData.dataNascimento} onChange={handleChange} className={inputClass} /></div>
                 <div className="grid grid-cols-2 gap-2">
                    <div><label className={labelClass}>RG</label><input name="rg" value={formData.rg} onChange={handleChange} className={inputClass} /></div>
                    <div><label className={labelClass}>CPF</label><input name="cpf" value={formData.cpf} onChange={handleChange} className={inputClass} /></div>
                 </div>
                 <div><label className={labelClass}>Mãe</label><input name="mae" value={formData.mae} onChange={handleChange} className={inputClass} /></div>
                 <div><label className={labelClass}>Pai</label><input name="pai" value={formData.pai} onChange={handleChange} className={inputClass} /></div>
                 <div><label className={labelClass}>Nacionalidade</label><input name="nacionalidade" value={formData.nacionalidade} onChange={handleChange} className={inputClass} /></div>
                 
                 <div className="flex gap-2 pt-2">
                    <button onClick={handleClear} className="flex-1 bg-slate-100 py-3 rounded-xl font-bold text-sm">Limpar</button>
                    <button onClick={handleAdd} disabled={isSaving} className="flex-1 bg-amber-500 text-white py-3 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2">
                        {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} 
                        {isSaving ? 'Salvando...' : 'Adicionar'}
                    </button>
                 </div>
             </div>
          )}
        </div>

        {/* List */}
        {people.length > 0 && (
          <div className="border-t border-slate-100 bg-slate-50/50 p-6">
             <div className="space-y-2">
              {people.map(person => (
                <div key={person.id} className="bg-white border border-slate-200 p-3 rounded-xl flex items-center justify-between shadow-sm">
                   <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{person.nome}</p>
                      <p className="text-[10px] text-slate-400">CPF: {person.cpf || '-'}</p>
                   </div>
                   <button onClick={() => onRemovePerson(person.id)} className="p-2 text-slate-400 hover:text-red-500"><X size={16} /></button>
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
