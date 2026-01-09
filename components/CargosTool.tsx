
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DbCargoAcumulacao, DbMasterPromotor, PROMOTORIAS } from '../types';
import { Loader2, Plus, Trash2, Save, User, Briefcase, Calendar, Users, X, AlertCircle, WifiOff } from 'lucide-react';

interface CargosToolProps {
  userId?: string;
}

const CargosTool: React.FC<CargosToolProps> = ({ userId }) => {
  const [cargos, setCargos] = useState<DbCargoAcumulacao[]>([]);
  const [promotores, setPromotores] = useState<DbMasterPromotor[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPromotores, setLoadingPromotores] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<DbCargoAcumulacao>>({
    cargo_nome: '',
    eh_acumulacao: false,
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim: ''
  });

  const fetchPromotores = async () => {
    if (userId === 'offline') return;
    
    setLoadingPromotores(true);
    try {
      const { data, error } = await supabase.from('master_promotores').select('*').order('nome');
      if (error) throw error;
      setPromotores(data || []);
    } catch (err: any) {
      console.error("Erro ao buscar promotores:", err);
      // Optional: don't block main UI if this fails, just show empty dropdown
    } finally {
      setLoadingPromotores(false);
    }
  };

  const fetchCargos = async () => {
    if (userId === 'offline') return;

    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('tb_cargos_acumulacoes')
        .select(`
          *,
          promotor_titular:master_promotores!promotor_titular_id(nome),
          promotor_designado:master_promotores!promotor_designado_id(nome)
        `)
        .order('cargo_nome');

      if (error) throw error;
      
      // Transform join data to flatten structure for display if needed, or keep as is.
      // Supabase returns nested objects for relationships.
      setCargos(data as any);
    } catch (err: any) {
      console.error("Erro ao buscar cargos:", err);
      setError("Erro ao carregar dados. Verifique a conexão.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCargos();
    fetchPromotores();
  }, [userId]);

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este registro?")) return;
    
    if (userId === 'offline') {
        setCargos(prev => prev.filter(c => c.id !== id));
        return;
    }

    try {
      const { error } = await supabase.from('tb_cargos_acumulacoes').delete().eq('id', id);
      if (error) throw error;
      setCargos(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      alert(`Erro ao excluir: ${err.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cargo_nome) return;

    // Offline Mock Save
    if (userId === 'offline') {
         const mock: any = {
            id: Date.now(),
            cargo_nome: formData.cargo_nome!,
            eh_acumulacao: formData.eh_acumulacao,
            data_inicio: formData.data_inicio,
            data_fim: formData.data_fim,
            promotor_titular_id: formData.promotor_titular_id,
            promotor_designado_id: formData.promotor_designado_id,
            promotor_titular: { nome: 'Offline Promotor' },
            promotor_designado: { nome: 'Offline Promotor' }
         };
         setCargos(prev => [...prev, mock]);
         setIsFormOpen(false);
         setFormData({
            cargo_nome: '',
            eh_acumulacao: false,
            data_inicio: new Date().toISOString().split('T')[0],
            data_fim: ''
          });
         return;
    }

    try {
      const payload = {
          cargo_nome: formData.cargo_nome,
          data_inicio: formData.data_inicio || null,
          data_fim: formData.data_fim || null,
          eh_acumulacao: formData.eh_acumulacao,
          promotor_titular_id: formData.promotor_titular_id || null,
          promotor_designado_id: formData.promotor_designado_id || null
      };

      const { data, error } = await supabase
        .from('tb_cargos_acumulacoes')
        .insert([payload])
        .select();

      if (error) throw error;
      
      await fetchCargos();
      setIsFormOpen(false);
      setFormData({
        cargo_nome: '',
        eh_acumulacao: false,
        data_inicio: new Date().toISOString().split('T')[0],
        data_fim: ''
      });
    } catch (err: any) {
      alert(`Erro ao salvar: ${err.message}`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="flex flex-1 overflow-hidden animate-in fade-in duration-500">
      <div className="w-[350px] bg-white border-r border-slate-200 p-6 flex flex-col gap-6 shadow-xl z-10 overflow-y-auto custom-scrollbar">
         <div className="flex items-center gap-3">
             <div className="p-2 bg-slate-800 rounded-lg text-white"><Briefcase size={20} /></div>
             <div>
                <h2 className="font-bold uppercase tracking-tight">Cargos</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Gestão de Acumulações</p>
             </div>
         </div>

         <button 
           onClick={() => setIsFormOpen(!isFormOpen)}
           className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isFormOpen ? 'bg-red-50 text-red-600' : 'bg-slate-900 text-white'}`}
         >
             {isFormOpen ? <X size={18}/> : <Plus size={18} />}
             {isFormOpen ? 'Cancelar' : 'Novo Registro'}
         </button>

         {isFormOpen && (
             <form onSubmit={handleSubmit} className="space-y-4 animate-in slide-in-from-left">
                 <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cargo</label>
                    <input 
                        name="cargo_nome" 
                        list="cargos-suggestions"
                        value={formData.cargo_nome} 
                        onChange={handleChange} 
                        placeholder="Ex: 61º Promotor Criminal"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs outline-none focus:ring-2 focus:ring-slate-400" 
                        required
                    />
                    <datalist id="cargos-suggestions">
                        {PROMOTORIAS.map(p => <option key={p.label} value={p.label} />)}
                    </datalist>
                 </div>

                 <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Promotor Titular</label>
                    <select 
                        name="promotor_titular_id" 
                        value={formData.promotor_titular_id || ''} 
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs outline-none focus:ring-2 focus:ring-slate-400"
                        disabled={userId === 'offline'}
                    >
                        <option value="">{userId === 'offline' ? 'Indisponível (Offline)' : 'Selecione...'}</option>
                        {promotores.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                    </select>
                 </div>

                 <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Designado / Acumulando</label>
                    <select 
                        name="promotor_designado_id" 
                        value={formData.promotor_designado_id || ''} 
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs outline-none focus:ring-2 focus:ring-slate-400"
                        disabled={userId === 'offline'}
                    >
                        <option value="">{userId === 'offline' ? 'Indisponível (Offline)' : 'Selecione...'}</option>
                        {promotores.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                    </select>
                 </div>

                 <div className="grid grid-cols-2 gap-2">
                     <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Início</label>
                        <input type="date" name="data_inicio" value={formData.data_inicio} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs" />
                     </div>
                     <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Fim</label>
                        <input type="date" name="data_fim" value={formData.data_fim || ''} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs" />
                     </div>
                 </div>

                 <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                    <input type="checkbox" name="eh_acumulacao" checked={formData.eh_acumulacao} onChange={handleChange} id="checkAcum" className="w-4 h-4 text-slate-900 rounded focus:ring-0" />
                    <label htmlFor="checkAcum" className="text-xs font-bold text-slate-700">É Acumulação?</label>
                 </div>

                 <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2">
                     <Save size={16} /> Salvar
                 </button>
             </form>
         )}
         
         <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
             <div className="flex items-start gap-2">
                 <AlertCircle size={16} className="text-amber-500 mt-0.5" />
                 <p className="text-[10px] text-amber-700 leading-relaxed">
                     Certifique-se que os promotores já estão cadastrados na tabela Mestra antes de vincular a um cargo.
                 </p>
             </div>
         </div>
      </div>

      <div className="flex-1 bg-slate-100 p-8 overflow-y-auto custom-scrollbar">
          <div className="max-w-5xl mx-auto">
             <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                 <Users size={24} className="text-slate-400" />
                 Registros Ativos
             </h3>

             {userId === 'offline' && (
               <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-amber-700 text-xs font-bold">
                   <WifiOff size={16} />
                   <span>Modo Offline: Registros apenas locais.</span>
               </div>
             )}

             {loading ? (
                 <div className="flex justify-center p-12"><Loader2 size={32} className="animate-spin text-slate-400" /></div>
             ) : error ? (
                 <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-bold">{error}</div>
             ) : (
                 <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                     {cargos.length === 0 ? (
                         <div className="col-span-full text-center p-12 text-slate-400">Nenhum registro encontrado.</div>
                     ) : (
                         cargos.map(c => (
                             <div key={c.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all relative group">
                                 <button 
                                    onClick={() => handleDelete(c.id)}
                                    className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                 >
                                     <Trash2 size={16} />
                                 </button>

                                 <div className="mb-4">
                                     <h4 className="font-bold text-slate-800 text-sm mb-1">{c.cargo_nome}</h4>
                                     {c.eh_acumulacao && (
                                         <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-bold uppercase rounded-full">Acumulação</span>
                                     )}
                                 </div>

                                 <div className="space-y-3">
                                     <div className="flex items-start gap-3">
                                         <div className="mt-0.5"><User size={14} className="text-slate-400" /></div>
                                         <div>
                                             <p className="text-[10px] font-bold text-slate-400 uppercase">Titular</p>
                                             <p className="text-xs font-semibold text-slate-700">{c.promotor_titular?.nome || '-'}</p>
                                         </div>
                                     </div>

                                     <div className="flex items-start gap-3">
                                         <div className="mt-0.5"><User size={14} className="text-slate-400" /></div>
                                         <div>
                                             <p className="text-[10px] font-bold text-slate-400 uppercase">Designado</p>
                                             <p className="text-xs font-semibold text-slate-700">{c.promotor_designado?.nome || '-'}</p>
                                         </div>
                                     </div>

                                     {(c.data_inicio || c.data_fim) && (
                                         <div className="flex items-start gap-3 pt-2 border-t border-slate-50">
                                             <div className="mt-0.5"><Calendar size={14} className="text-slate-400" /></div>
                                             <div>
                                                 <p className="text-[10px] font-bold text-slate-400 uppercase">Vigência</p>
                                                 <p className="text-xs text-slate-500">
                                                     {c.data_inicio ? new Date(c.data_inicio).toLocaleDateString() : '...'} 
                                                     {' até '} 
                                                     {c.data_fim ? new Date(c.data_fim).toLocaleDateString() : '...'}
                                                 </p>
                                             </div>
                                         </div>
                                     )}
                                 </div>
                             </div>
                         ))
                     )}
                 </div>
             )}
          </div>
      </div>
    </div>
  );
};

export default CargosTool;
