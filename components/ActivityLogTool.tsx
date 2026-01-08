
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Activity, PROMOTORIAS, ACTIVITY_TYPES, ACTIVITY_STATUSES, ActivityStatus, DbActivity } from '../types';
import { ListTodo, Plus, Trash2, LayoutList, Search, Pencil, Check, X, Save, Sparkles, Upload, FileText, Image as ImageIcon, LayoutGrid, CheckCircle2, Clock, AlertCircle, BarChart3, Gavel, AlertTriangle, ClipboardPaste, MessageSquare, Loader2, ExternalLink, WifiOff } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { supabase } from '../lib/supabase';

interface ActivityLogToolProps {
  onOpenActivity: (activity: Activity) => void;
  userId: string;
}

const ActivityLogTool: React.FC<ActivityLogToolProps> = ({ onOpenActivity, userId }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [dbError, setDbError] = useState(false);

  const [formData, setFormData] = useState<Omit<Activity, 'id' | 'promotor'>>({
    numeroProcesso: '',
    data: new Date().toISOString().split('T')[0],
    status: 'NAO_VERIFICADO',
    tipo: '',
    cargo: '',
    observacao: ''
  });
  const [promotorNamePreview, setPromotorNamePreview] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);

  const [isChatMode, setIsChatMode] = useState(false);
  const [chatText, setChatText] = useState('');
  const [chatFile, setChatFile] = useState<File | null>(null);
  const [isProcessingChat, setIsProcessingChat] = useState(false);

  // Fetch activities from Supabase
  const fetchActivities = useCallback(async () => {
    if (userId === 'offline') return;
    
    setLoadingActivities(true);
    setDbError(false);
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('data_atividade', { ascending: false });

      if (error) throw error;

      const mappedActivities: Activity[] = (data as DbActivity[]).map(d => ({
        id: d.id,
        user_id: d.user_id,
        numeroProcesso: d.numero_processo_ref,
        data: d.data_atividade,
        status: d.status as ActivityStatus,
        tipo: d.tipo,
        cargo: d.cargo_ref,
        promotor: d.promotor_ref,
        observacao: d.observacao
      }));

      setActivities(mappedActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setDbError(true);
      // Fallback to empty, don't alert to avoid blocking user flow on load
    } finally {
      setLoadingActivities(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const getPromotorForDate = useCallback((cargoLabel: string, dateString: string) => {
    if (!cargoLabel || !dateString) return "";
    const promotoria = PROMOTORIAS.find(p => p.label === cargoLabel);
    if (!promotoria) return "";
    const [year, month, day] = dateString.split('-').map(Number);
    const entry = promotoria.schedule.find(s => day >= s.start && day <= s.end);
    return entry ? entry.name : "";
  }, []);

  useEffect(() => {
    const calculatedPromotor = getPromotorForDate(formData.cargo, formData.data);
    setPromotorNamePreview(calculatedPromotor);
  }, [formData.cargo, formData.data, getPromotorForDate]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value as any }));
  };

  const handleResetForm = () => {
    setFormData({
      numeroProcesso: '',
      data: new Date().toISOString().split('T')[0],
      status: 'NAO_VERIFICADO',
      tipo: '',
      cargo: '',
      observacao: ''
    });
    setPromotorNamePreview('');
    setEditingId(null);
  };

  const handleSaveActivity = async () => {
    if (!formData.numeroProcesso || !formData.data || !formData.status || !formData.tipo || !formData.cargo) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    // Force offline save if db connection is broken or user is offline
    if (userId === 'offline' || dbError) {
        const mockActivity: Activity = {
            id: Date.now().toString(),
            numeroProcesso: formData.numeroProcesso,
            data: formData.data,
            status: formData.status as ActivityStatus,
            tipo: formData.tipo,
            cargo: formData.cargo,
            promotor: promotorNamePreview || 'Não identificado',
            observacao: formData.observacao || ''
        };
        setActivities(prev => [mockActivity, ...prev]);
        handleResetForm();
        if (dbError) alert("Salvo localmente (Banco de dados indisponível).");
        return;
    }

    const activityData = {
      user_id: userId,
      numero_processo_ref: formData.numeroProcesso,
      tipo: formData.tipo,
      data_atividade: formData.data,
      status: formData.status,
      observacao: formData.observacao || '',
      cargo_ref: formData.cargo,
      promotor_ref: promotorNamePreview || 'Não identificado'
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from('activities')
          .update(activityData)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('activities')
          .insert([activityData]);
        if (error) throw error;
      }
      
      await fetchActivities();
      handleResetForm();
    } catch (error: any) {
      console.error('Error saving activity:', JSON.stringify(error, null, 2));
      alert('Erro ao salvar no banco. Tentando salvar localmente...');
      setDbError(true);
      // Fallback local save
      const mockActivity: Activity = {
            id: editingId || Date.now().toString(),
            numeroProcesso: formData.numeroProcesso,
            data: formData.data,
            status: formData.status as ActivityStatus,
            tipo: formData.tipo,
            cargo: formData.cargo,
            promotor: promotorNamePreview || 'Não identificado',
            observacao: formData.observacao || ''
      };
      setActivities(prev => editingId ? prev.map(a => a.id === editingId ? mockActivity : a) : [mockActivity, ...prev]);
      handleResetForm();
    }
  };

  const handleEdit = (activity: Activity) => {
    setIsChatMode(false);
    setFormData({
      numeroProcesso: activity.numeroProcesso,
      data: activity.data,
      status: activity.status,
      tipo: activity.tipo,
      cargo: activity.cargo,
      observacao: activity.observacao || ''
    });
    setEditingId(activity.id);
  };

  const handleRequestDelete = (id: string) => {
    setDeleteConfirmationId(id);
  };

  const confirmDeleteActivity = async () => {
    if (deleteConfirmationId) {
      if (userId === 'offline' || dbError) {
          setActivities(prev => prev.filter(a => a.id !== deleteConfirmationId));
          setDeleteConfirmationId(null);
          return;
      }
      try {
        const { error } = await supabase.from('activities').delete().eq('id', deleteConfirmationId);
        if (error) throw error;
        setActivities(prev => prev.filter(activity => activity.id !== deleteConfirmationId));
        if (editingId === deleteConfirmationId) handleResetForm();
      } catch (error) {
        console.error('Error deleting activity:', error);
        alert('Erro ao excluir do banco (excluindo visualmente apenas).');
        setActivities(prev => prev.filter(activity => activity.id !== deleteConfirmationId));
      }
      setDeleteConfirmationId(null);
    }
  };

  // ... (handleQuickStatus, handleOpenEsaj, fileToBase64 remain same) ...
  const getStatusClasses = (statusValue: ActivityStatus) => {
    const statusDef = ACTIVITY_STATUSES.find(s => s.value === statusValue);
    return statusDef ? statusDef.colorClass : { bg: 'bg-gray-400', text: 'text-white' };
  };
  const getStatusLabel = (statusValue: ActivityStatus) => {
    const statusDef = ACTIVITY_STATUSES.find(s => s.value === statusValue);
    return statusDef ? statusDef.label : 'Desconhecido';
  };
  
  // fileToBase64 helper
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

  const handleProcessChat = async () => {
     if (!chatText.trim() && !chatFile) {
      alert("Cole a conversa no campo de texto ou faça upload de um arquivo (Print/PDF).");
      return;
    }
    if (!formData.cargo) {
      alert("Selecione o Cargo para atribuir as atividades.");
      return;
    }

    setIsProcessingChat(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const today = new Date().toISOString().split('T')[0];
      const promptText = `DATA DE HOJE: ${today}. Analise o chat. Usuario principal: Alex. Interlocutor: Promotor. Extraia tarefas. JSON Array: [{numeroProcesso, tipo, observacao, data}]. Texto extra: "${chatText}"`;
      
      const parts: any[] = [{ text: promptText }];
      if (chatFile) {
        const base64Data = await fileToBase64(chatFile);
        parts.push({ inlineData: { mimeType: chatFile.type, data: base64Data } });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts }],
        config: { responseMimeType: "application/json" }
      });

      const extractedTasks = JSON.parse(response.text || "[]");

      if (extractedTasks.length === 0) {
        alert("Nenhuma atividade encontrada.");
      } else {
        const rowsToInsert = extractedTasks.map((task: any) => ({
          user_id: userId,
          numero_processo_ref: task.numeroProcesso || '',
          data_atividade: task.data || new Date().toISOString().split('T')[0],
          status: 'PENDENTE',
          tipo: task.tipo || 'Outros',
          cargo_ref: formData.cargo,
          promotor_ref: getPromotorForDate(formData.cargo, task.data || new Date().toISOString().split('T')[0]) || promotorNamePreview || 'Não identificado',
          observacao: task.observacao
        }));

        if (userId === 'offline' || dbError) {
            const offlineTasks = rowsToInsert.map((r: any, idx: number) => ({
                id: Date.now().toString() + idx,
                numeroProcesso: r.numero_processo_ref,
                data: r.data_atividade,
                status: r.status,
                tipo: r.tipo,
                cargo: r.cargo_ref,
                promotor: r.promotor_ref,
                observacao: r.observacao
            }));
            setActivities(prev => [...offlineTasks, ...prev]);
        } else {
            const { error } = await supabase.from('activities').insert(rowsToInsert);
            if (error) throw error;
            await fetchActivities();
        }

        alert(`${rowsToInsert.length} atividades importadas com sucesso!`);
        setIsChatMode(false);
      }
    } catch (error) {
      console.error("Erro processamento chat:", error);
      alert("Erro ao processar chat.");
    } finally {
      setIsProcessingChat(false);
    }
  };
  
  const metrics = useMemo(() => {
    const total = activities.length;
    const completed = activities.filter(a => a.status === 'CONCLUIDO' || a.status === 'FINALIZADO').length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const typeCounts: Record<string, number> = {};
    activities.forEach(a => { typeCounts[a.tipo] = (typeCounts[a.tipo] || 0) + 1; });
    const topType = Object.entries(typeCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A';
    return { total, completed, pending, completionRate, topType };
  }, [activities]);

  const filteredActivities = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return activities
      .filter(act => 
        act.numeroProcesso.toLowerCase().includes(term) ||
        act.tipo.toLowerCase().includes(term) ||
        act.cargo.toLowerCase().includes(term) ||
        act.promotor.toLowerCase().includes(term) ||
        (ACTIVITY_STATUSES.find(s => s.value === act.status)?.label.toLowerCase().includes(term)) ||
        (act.observacao && act.observacao.toLowerCase().includes(term))
      )
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [activities, searchTerm]);

  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none transition-all placeholder-slate-400 text-slate-700";

  return (
    <div className="flex flex-1 overflow-hidden animate-in fade-in duration-500 relative">
      <div className="w-full md:w-[420px] bg-white border-r border-slate-200 p-6 flex flex-col gap-6 shadow-xl z-10 overflow-y-auto custom-scrollbar transition-all">
         <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg text-white transition-colors ${editingId ? 'bg-amber-500' : isChatMode ? 'bg-indigo-600' : 'bg-teal-600'}`}>
                {editingId ? <Pencil size={20} /> : isChatMode ? <MessageSquare size={20} /> : <ListTodo size={20} />}
              </div>
              <div>
                <h2 className="font-bold uppercase tracking-tight">
                  {editingId ? 'EDITAR' : isChatMode ? 'IMPORTAR CHAT' : 'ATIVIDADES'}
                </h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  {editingId ? 'ALTERANDO REGISTRO' : isChatMode ? 'EXTRAÇÃO VIA IA' : 'NOVA TAREFA'}
                </p>
              </div>
            </div>
             {!editingId && (
              <button onClick={() => setIsChatMode(!isChatMode)} className={`p-2 rounded-lg border transition-all ${isChatMode ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-indigo-600'}`}>
                {isChatMode ? <ListTodo size={18} /> : <MessageSquare size={18} />}
              </button>
            )}
          </div>
        </div>

        {isChatMode ? (
            <div className="space-y-4 animate-in slide-in-from-left duration-300">
               <select name="cargo" value={formData.cargo} onChange={handleChange} className={inputClass}><option value="">Selecione o Cargo</option>{PROMOTORIAS.map(p => <option key={p.label} value={p.label}>{p.label}</option>)}</select>
               <input type="file" onChange={(e) => e.target.files && setChatFile(e.target.files[0])} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
               <textarea value={chatText} onChange={(e) => setChatText(e.target.value)} placeholder="Cole o texto aqui..." className={`${inputClass} h-24`} />
               <button onClick={handleProcessChat} disabled={isProcessingChat} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold">{isProcessingChat ? <Loader2 className="animate-spin inline" /> : 'Extrair'}</button>
            </div>
        ) : (
            <div className="space-y-4 animate-in slide-in-from-left duration-300">
                <input type="text" name="numeroProcesso" placeholder="Nº Processo" value={formData.numeroProcesso} onChange={handleChange} className={inputClass} />
                <input type="date" name="data" value={formData.data} onChange={handleChange} className={inputClass} />
                <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>{ACTIVITY_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select>
                <select name="tipo" value={formData.tipo} onChange={handleChange} className={inputClass}><option value="">Tipo</option>{ACTIVITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select>
                <select name="cargo" value={formData.cargo} onChange={handleChange} className={inputClass}><option value="">Cargo</option>{PROMOTORIAS.map(p => <option key={p.label} value={p.label}>{p.label}</option>)}</select>
                <textarea name="observacao" value={formData.observacao} onChange={handleChange} className={`${inputClass} h-24`} placeholder="Observações..." />
                <button onClick={handleSaveActivity} className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold">{editingId ? 'Salvar' : 'Adicionar'}</button>
                {editingId && <button onClick={handleResetForm} className="w-full bg-slate-100 text-slate-600 py-3 rounded-xl font-bold">Cancelar</button>}
            </div>
        )}
      </div>

      <div className="flex-1 bg-slate-100 p-8 overflow-y-auto flex flex-col custom-scrollbar">
           {(userId === 'offline' || dbError) && (
               <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-amber-700 text-xs font-bold">
                   <WifiOff size={16} />
                   <span>Você está operando em Modo Offline. As atividades não serão salvas no banco de dados.</span>
               </div>
           )}
           
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
             <div className="bg-white p-4 rounded-xl shadow-sm"><span className="text-xs font-bold text-slate-400 uppercase">Total</span><p className="text-2xl font-black">{metrics.total}</p></div>
             <div className="bg-white p-4 rounded-xl shadow-sm"><span className="text-xs font-bold text-slate-400 uppercase">Concluído</span><p className="text-2xl font-black">{metrics.completionRate}%</p></div>
             <div className="bg-white p-4 rounded-xl shadow-sm"><span className="text-xs font-bold text-slate-400 uppercase">Pendente</span><p className="text-2xl font-black">{metrics.pending}</p></div>
             <div className="bg-white p-4 rounded-xl shadow-sm"><span className="text-xs font-bold text-slate-400 uppercase">Top</span><p className="text-lg font-black truncate">{metrics.topType}</p></div>
           </div>
           
           <div className="flex gap-4 mb-4">
             <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 bg-white border rounded-xl px-4 py-2" />
           </div>

           {loadingActivities ? <div className="text-center p-10"><Loader2 className="animate-spin mx-auto text-teal-600" size={32} /></div> : (
              <div className="space-y-3">
                 {filteredActivities.length === 0 ? <p className="text-center text-slate-400 mt-10">Nenhuma atividade registrada.</p> : filteredActivities.map(act => (
                     <div key={act.id} className="bg-white rounded-xl shadow-sm border p-4 flex justify-between items-center hover:border-teal-300 transition-all">
                        <div>
                           <div className="flex gap-2 items-center mb-1">
                             <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getStatusClasses(act.status).bg} ${getStatusClasses(act.status).text}`}>{getStatusLabel(act.status)}</span>
                             <span className="text-xs font-bold text-slate-400">{new Date(act.data).toLocaleDateString()}</span>
                           </div>
                           <p className="font-bold text-slate-800">{act.tipo}</p>
                           <p className="text-xs text-slate-500">{act.numeroProcesso}</p>
                           <p className="text-[10px] text-slate-400 uppercase">{act.cargo}</p>
                        </div>
                        <div className="flex gap-1">
                           <button onClick={() => onOpenActivity(act)} className="p-2 text-slate-400 hover:text-teal-600"><ExternalLink size={16}/></button>
                           <button onClick={() => handleEdit(act)} className="p-2 text-slate-400 hover:text-amber-600"><Pencil size={16}/></button>
                           <button onClick={() => handleRequestDelete(act.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={16}/></button>
                        </div>
                     </div>
                 ))}
              </div>
           )}
      </div>

       {deleteConfirmationId && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
           <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
             <h3 className="text-lg font-bold">Excluir?</h3>
             <div className="flex gap-2 mt-4">
                <button onClick={() => setDeleteConfirmationId(null)} className="flex-1 py-2 border rounded-xl">Cancelar</button>
                <button onClick={confirmDeleteActivity} className="flex-1 py-2 bg-red-600 text-white rounded-xl">Excluir</button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLogTool;
