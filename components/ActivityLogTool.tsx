
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Activity, PROMOTORIAS, ACTIVITY_TYPES, ACTIVITY_STATUSES, ActivityStatus } from '../types';
import { ListTodo, Plus, Trash2, LayoutList, Search, Pencil, Check, X, Save, RotateCcw, ExternalLink, MessageSquareText, MessageSquare, Loader2, Sparkles, Upload, FileText, Image as ImageIcon, LayoutGrid, CheckCircle2, Clock, AlertCircle, BarChart3, Gavel, AlertTriangle, ClipboardPaste } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

const LOCAL_STORAGE_KEY = 'user_activities';

interface ActivityLogToolProps {
  onOpenActivity: (activity: Activity) => void;
}

const ActivityLogTool: React.FC<ActivityLogToolProps> = ({ onOpenActivity }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [formData, setFormData] = useState<Omit<Activity, 'id' | 'promotor'>>({
    numeroProcesso: '',
    data: new Date().toISOString().split('T')[0], // Default to today
    status: 'NAO_VERIFICADO',
    tipo: '',
    cargo: '',
    observacao: ''
  });
  const [promotorNamePreview, setPromotorNamePreview] = useState('');
  
  // New States for Search, Edit and View Mode
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'LIST' | 'GRID'>('LIST');

  // Delete Confirmation State
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);

  // Chat Import States
  const [isChatMode, setIsChatMode] = useState(false);
  const [chatText, setChatText] = useState('');
  const [chatFile, setChatFile] = useState<File | null>(null);
  const [isProcessingChat, setIsProcessingChat] = useState(false);

  // Load activities from local storage on component mount
  useEffect(() => {
    try {
      const storedActivities = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedActivities) {
        setActivities(JSON.parse(storedActivities));
      }
    } catch (error) {
      console.error("Failed to load activities from local storage:", error);
    }
  }, []);

  // Save activities to local storage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(activities));
    } catch (error) {
      console.error("Failed to save activities to local storage:", error);
    }
  }, [activities]);

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

  const handleSaveActivity = () => {
    if (!formData.numeroProcesso || !formData.data || !formData.status || !formData.tipo || !formData.cargo) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (editingId) {
      // Update existing activity
      setActivities(prev => prev.map(act => 
        act.id === editingId 
          ? { ...act, ...formData, promotor: promotorNamePreview || 'Não identificado' }
          : act
      ));
    } else {
      // Create new activity
      const newActivity: Activity = {
        id: crypto.randomUUID(),
        ...formData,
        promotor: promotorNamePreview || 'Não identificado'
      };
      setActivities(prev => [...prev, newActivity]);
    }

    handleResetForm();
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

  const confirmDeleteActivity = () => {
    if (deleteConfirmationId) {
      setActivities(prev => prev.filter(activity => activity.id !== deleteConfirmationId));
      if (editingId === deleteConfirmationId) handleResetForm();
      setDeleteConfirmationId(null);
    }
  };

  const handleClearCompleted = () => {
     const completedCount = activities.filter(a => a.status === 'CONCLUIDO' || a.status === 'FINALIZADO').length;
     if (completedCount === 0) {
        alert("Não há atividades concluídas para limpar.");
        return;
     }

     if (confirm(`Tem certeza que deseja excluir ${completedCount} atividades concluídas?`)) {
        setActivities(prev => prev.filter(a => a.status !== 'CONCLUIDO' && a.status !== 'FINALIZADO'));
     }
  };

  const handleQuickStatus = (id: string, newStatus: ActivityStatus) => {
    setActivities(prev => prev.map(act => 
      act.id === id ? { ...act, status: newStatus } : act
    ));
  };

  const handleOpenEsaj = (numeroProcesso: string) => {
    if (!numeroProcesso) return;
    const url = `https://esaj.tjsp.jus.br/cpopg/search.do?conversationId=&cbPesquisa=NUMPROC&numeroDigitoAnoUnificado=&foroNumeroUnificado=&dadosConsulta.valorConsultaNuUnificado=&dadosConsulta.valorConsultaNuUnificado=UNIFICADO&dadosConsulta.valorConsulta=${encodeURIComponent(numeroProcesso)}&dadosConsulta.tipoNuProcesso=SAJ`;
    window.open(url, '_blank');
  };

  const handleChatFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setChatFile(e.target.files[0]);
    }
  };

  // Allow pasting images directly (Ctrl+V)
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    let foundImage = false;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
            const blob = items[i].getAsFile();
            if (blob) {
                setChatFile(blob);
                foundImage = true;
            }
        }
    }
    // Only prevent default if we actually found and handled an image, 
    // otherwise let text paste normally into the textarea
    if (foundImage) e.preventDefault();
  };

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
      
      const promptText = `
        DATA DE HOJE: ${today}

        Analise o conteúdo do chat fornecido (que pode ser texto, imagem de screenshot ou PDF).
        O usuário principal (dono do celular/print) é "Alex Santana Mendes" (ou "Alex"). 
        O interlocutor é o Promotor de Justiça.
        
        REGRAS DE EXTRAÇÃO:
        1. IGNORE mensagens enviadas pelo "Alex" (lado direito ou identificado como remetente), EXCETO se ele estiver confirmando uma tarefa pendente que ele mesmo anotou.
        2. FOQUE nas solicitações do Promotor (ex: "Peça tal coisa", "Verifique o processo X").
        3. IGNORE trechos de "Iniciar referência" ou citações de mensagens antigas. Foque na solicitação atual.
        
        DATAS:
        O chat contém cabeçalhos de data (ex: "quinta-feira", "11/11").
        Use a DATA DE HOJE (${today}) como referência para termos como "hoje", "ontem", "segunda-feira".
        Associe cada tarefa à data provável da solicitação. Formato YYYY-MM-DD.
        
        Extraia as tarefas solicitadas como uma lista de atividades.
        
        Para cada tarefa, extraia:
        1. numeroProcesso: O número do processo formato CNJ (0000000-00.0000.0.00.0000) se presente no texto ou na imagem.
        2. tipo: Tente classificar em: 'Multa Penal', 'Pesquisa de NI', 'Notificação - (Art. 28)', 'ANPP - Execuções', 'Ofício', 'Agendamento de Despacho', 'Notícia de Fato', 'Outros'.
        3. observacao: O resumo do que deve ser feito (Ex: "Pedir NI para testemunha Felipe", "Enviar cópias para DENARC").
        4. data: A data da solicitação (YYYY-MM-DD).
        
        ${chatText ? `Texto Complementar fornecido pelo usuário: "${chatText}"` : ''}
      `;

      const parts: any[] = [{ text: promptText }];

      if (chatFile) {
        const base64Data = await fileToBase64(chatFile);
        parts.push({
          inlineData: {
            mimeType: chatFile.type,
            data: base64Data
          }
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                numeroProcesso: { type: Type.STRING },
                tipo: { type: Type.STRING },
                observacao: { type: Type.STRING },
                data: { type: Type.STRING, description: "Data da solicitação YYYY-MM-DD" }
              },
              required: ["tipo", "observacao"]
            }
          }
        }
      });

      const extractedTasks = JSON.parse(response.text || "[]");

      if (extractedTasks.length === 0) {
        alert("Nenhuma atividade encontrada na conversa.");
      } else {
        const newActivities: Activity[] = extractedTasks.map((task: any) => ({
          id: crypto.randomUUID(),
          numeroProcesso: task.numeroProcesso || '',
          data: task.data || new Date().toISOString().split('T')[0],
          status: 'PENDENTE',
          tipo: task.tipo || 'Outros',
          cargo: formData.cargo,
          promotor: getPromotorForDate(formData.cargo, task.data || new Date().toISOString().split('T')[0]) || promotorNamePreview || 'Não identificado',
          observacao: task.observacao
        }));

        setActivities(prev => [...prev, ...newActivities]);
        alert(`${newActivities.length} atividades importadas com sucesso!`);
        setChatText('');
        setChatFile(null);
        setIsChatMode(false);
      }
    } catch (error) {
      console.error("Erro ao processar chat:", error);
      alert("Erro ao processar a conversa. Verifique se o arquivo é válido e tente novamente.");
    } finally {
      setIsProcessingChat(false);
    }
  };

  // Metrics Calculation
  const metrics = useMemo(() => {
    const total = activities.length;
    const completed = activities.filter(a => a.status === 'CONCLUIDO' || a.status === 'FINALIZADO').length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Find top type
    const typeCounts: Record<string, number> = {};
    activities.forEach(a => { typeCounts[a.tipo] = (typeCounts[a.tipo] || 0) + 1; });
    const topType = Object.entries(typeCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return { total, completed, pending, completionRate, topType };
  }, [activities]);

  // Filter Logic
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
      .sort((a, b) => {
        return new Date(b.data).getTime() - new Date(a.data).getTime();
      });
  }, [activities, searchTerm]);

  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none transition-all placeholder-slate-400 text-slate-700";
  const labelClass = "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1";

  const getStatusClasses = (statusValue: ActivityStatus) => {
    const statusDef = ACTIVITY_STATUSES.find(s => s.value === statusValue);
    return statusDef ? statusDef.colorClass : { bg: 'bg-gray-400', text: 'text-white' };
  };

  const getStatusLabel = (statusValue: ActivityStatus) => {
    const statusDef = ACTIVITY_STATUSES.find(s => s.value === statusValue);
    return statusDef ? statusDef.label : 'Desconhecido';
  }

  return (
    <div className="flex flex-1 overflow-hidden animate-in fade-in duration-500 relative">
      {/* Left Sidebar - Form */}
      <div className="w-full md:w-[420px] bg-white border-r border-slate-200 p-6 flex flex-col gap-6 shadow-xl z-10 overflow-y-auto custom-scrollbar transition-all">
        
        {/* Header with Toggle */}
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
              <button 
                onClick={() => setIsChatMode(!isChatMode)}
                className={`p-2 rounded-lg border transition-all ${isChatMode ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200'}`}
                title={isChatMode ? "Voltar ao Formulário" : "Importar Conversa"}
              >
                {isChatMode ? <ListTodo size={18} /> : <MessageSquare size={18} />}
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Content: Chat Mode vs Form Mode */}
        {isChatMode ? (
          <div className="space-y-4 animate-in slide-in-from-left duration-300">
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 mb-2">
              <p className="text-xs text-indigo-800 leading-relaxed">
                <Sparkles size={12} className="inline mr-1" />
                Cole a conversa ou carregue um <b>PDF / Print</b>. A IA identificará as tarefas solicitadas pelo Promotor.
              </p>
            </div>

            <div>
              <label className={labelClass}>Selecione o Cargo (Para atribuição)</label>
              <select
                name="cargo"
                value={formData.cargo}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Selecione o Cargo</option>
                {PROMOTORIAS.map(p => (
                  <option key={p.label} value={p.label}>{p.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Promotor Responsável</label>
              <input
                type="text"
                value={promotorNamePreview || 'Selecione um Cargo'}
                disabled
                className={`${inputClass} bg-slate-100 text-slate-500`}
              />
            </div>

            {/* File Upload Area */}
            <div>
              <label className={labelClass}>Arquivo da Conversa (PDF ou Imagem)</label>
              {!chatFile ? (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-indigo-200 border-dashed rounded-xl cursor-pointer bg-indigo-50/50 hover:bg-indigo-50 transition-all group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload size={24} className="text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-xs text-indigo-500 font-bold">Clique para carregar</p>
                    <p className="text-[10px] text-indigo-400">PDF, JPG, PNG (ou Cole com Ctrl+V)</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleChatFileUpload} />
                </label>
              ) : (
                <div className="flex items-center justify-between w-full p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-white rounded-lg text-indigo-600">
                       {chatFile.type.includes('pdf') ? <FileText size={20} /> : <ImageIcon size={20} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-indigo-900 truncate">{chatFile.name}</p>
                      <p className="text-[10px] text-indigo-500">{(chatFile.size / 1024).toFixed(0)} KB</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setChatFile(null)}
                    className="p-1.5 text-indigo-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className={labelClass}>Texto Complementar (Ou cole aqui com Ctrl+V)</label>
              <div className="relative">
                <textarea
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                  onPaste={handlePaste}
                  placeholder="Cole texto ou clique aqui e aperte Ctrl+V para colar uma imagem..."
                  className={`${inputClass} h-24 resize-none font-mono text-xs`}
                />
                <ClipboardPaste size={14} className="absolute right-3 bottom-3 text-slate-300 pointer-events-none" />
              </div>
            </div>

            <button
              onClick={handleProcessChat}
              disabled={isProcessingChat || (!chatText.trim() && !chatFile) || !formData.cargo}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
            >
              {isProcessingChat ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} 
              {isProcessingChat ? 'Processando Arquivo...' : 'Extrair Atividades'}
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-in slide-in-from-left duration-300">
            <div>
              <label className={labelClass}>Número do Processo</label>
              <input
                type="text"
                name="numeroProcesso"
                placeholder="0000000-00.0000.0.00.0000"
                value={formData.numeroProcesso}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Data da Atividade</label>
              <input
                type="date"
                name="data"
                value={formData.data}
                onChange={handleChange}
                className={inputClass}
                max={new Date().toISOString().split('T')[0]} // Prevents future dates
              />
            </div>

            <div>
              <label className={labelClass}>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={inputClass}
              >
                {ACTIVITY_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Tipo de Atividade</label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Selecione o Tipo</option>
                {ACTIVITY_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Cargo da Promotoria</label>
              <select
                name="cargo"
                value={formData.cargo}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Selecione o Cargo</option>
                {PROMOTORIAS.map(p => (
                  <option key={p.label} value={p.label}>{p.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Nome do Promotor (Preenchido Automaticamente)</label>
              <input
                type="text"
                name="promotor"
                value={promotorNamePreview || 'Selecione um Cargo e Data'}
                disabled
                className={`${inputClass} bg-slate-100 text-slate-500 cursor-not-allowed`}
              />
            </div>
            
            <div>
              <label className={labelClass}>Observações</label>
              <textarea
                name="observacao"
                value={formData.observacao}
                onChange={handleChange}
                placeholder="Detalhes adicionais, lembretes ou notas sobre o processo..."
                className={`${inputClass} h-24 resize-none`}
              />
            </div>

            <div className="pt-4 flex gap-2">
              {editingId && (
                <button
                  onClick={handleResetForm}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                >
                  <X size={16} /> Cancelar
                </button>
              )}
              <button
                onClick={handleSaveActivity}
                className={`flex-1 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 transform active:scale-95 ${editingId ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/20'}`}
              >
                {editingId ? <Save size={16} /> : <Plus size={16} />} 
                {editingId ? 'Salvar Alterações' : 'Adicionar Atividade'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Content - Activity Dashboard */}
      <div className="flex-1 bg-slate-100 p-8 overflow-y-auto flex flex-col custom-scrollbar">
        <div className="max-w-6xl w-full mx-auto space-y-8">
          
          {/* Dashboard Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
               <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
                  <div className="p-1.5 bg-blue-50 text-blue-500 rounded-lg"><BarChart3 size={16} /></div>
               </div>
               <span className="text-3xl font-black text-slate-800">{metrics.total}</span>
               <span className="text-xs text-slate-400 mt-1">Atividades registradas</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden">
               <div className="flex items-center justify-between mb-2 z-10">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Eficiência</span>
                  <div className="p-1.5 bg-green-50 text-green-500 rounded-lg"><CheckCircle2 size={16} /></div>
               </div>
               <span className="text-3xl font-black text-slate-800 z-10">{metrics.completionRate}%</span>
               <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden z-10">
                  <div className="bg-green-500 h-full rounded-full transition-all duration-1000" style={{ width: `${metrics.completionRate}%` }}></div>
               </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
               <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pendentes</span>
                  <div className="p-1.5 bg-amber-50 text-amber-500 rounded-lg"><Clock size={16} /></div>
               </div>
               <span className="text-3xl font-black text-slate-800">{metrics.pending}</span>
               <span className="text-xs text-amber-600 font-bold mt-1">Aguardando ação</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
               <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Principal Demanda</span>
                  <div className="p-1.5 bg-purple-50 text-purple-500 rounded-lg"><AlertCircle size={16} /></div>
               </div>
               <span className="text-lg font-bold text-slate-800 truncate" title={metrics.topType}>{metrics.topType}</span>
               <span className="text-xs text-slate-400 mt-1">Tipo mais frequente</span>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20 bg-slate-100/90 backdrop-blur-sm py-2">
            <div className="flex items-center gap-3">
              <LayoutList size={24} className="text-teal-600" />
              <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight">
                Minhas Tarefas
              </h3>
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              {/* Search */}
              <div className="relative group flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={16} />
                <input 
                  type="text" 
                  placeholder="Buscar atividades..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none transition-all shadow-sm"
                />
              </div>

              {/* View Toggle */}
              <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                <button 
                  onClick={() => setViewMode('LIST')} 
                  className={`p-2 rounded-lg transition-all ${viewMode === 'LIST' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                  title="Lista"
                >
                  <LayoutList size={18} />
                </button>
                <button 
                  onClick={() => setViewMode('GRID')} 
                  className={`p-2 rounded-lg transition-all ${viewMode === 'GRID' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                  title="Grade"
                >
                  <LayoutGrid size={18} />
                </button>
              </div>
              
              {/* Actions Dropdown / Buttons */}
              {metrics.completed > 0 && (
                <button
                  onClick={handleClearCompleted}
                  className="p-2.5 rounded-xl text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-700 transition-all shadow-sm"
                  title="Limpar Concluídos"
                >
                  <CheckCircle2 size={18} />
                </button>
              )}
              
              {activities.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm("Tem certeza que deseja limpar TODAS as atividades?")) {
                      setActivities([]);
                      handleResetForm();
                    }
                  }}
                  className="p-2.5 rounded-xl text-red-500 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 transition-all shadow-sm"
                  title="Limpar Tudo"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>

          {/* List/Grid Content */}
          {activities.length === 0 ? (
            <div className="text-center p-12 bg-white rounded-3xl shadow-sm border border-slate-200 mt-8">
              <ListTodo size={48} className="text-slate-300 mx-auto mb-4" />
              <p className="text-lg font-bold text-slate-600 mb-2">Tudo limpo por aqui!</p>
              <p className="text-slate-400 text-sm">Use o formulário ou importe um chat para começar.</p>
            </div>
          ) : filteredActivities.length === 0 ? (
             <div className="text-center p-12 bg-white rounded-3xl shadow-sm border border-slate-200 mt-8">
              <Search size={48} className="text-slate-300 mx-auto mb-4" />
              <p className="text-lg font-bold text-slate-600 mb-2">Nenhum resultado encontrado.</p>
              <p className="text-slate-400 text-sm">Tente buscar por outro termo.</p>
            </div>
          ) : (
            <div className={viewMode === 'GRID' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
              {filteredActivities.map(activity => {
                const statusClasses = getStatusClasses(activity.status);
                const statusLabel = getStatusLabel(activity.status);
                const isCompleted = activity.status === 'CONCLUIDO' || activity.status === 'FINALIZADO';
                const isEditing = editingId === activity.id;

                if (viewMode === 'GRID') {
                   // GRID VIEW CARD
                   return (
                     <div key={activity.id} className={`bg-white rounded-2xl border p-5 flex flex-col justify-between gap-4 shadow-sm hover:shadow-md transition-all ${isEditing ? 'border-amber-400 ring-2 ring-amber-100' : 'border-slate-200'}`}>
                        <div>
                           <div className="flex justify-between items-start mb-2">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusClasses.bg} ${statusClasses.text}`}>
                                {statusLabel}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400">{new Date(activity.data).toLocaleDateString('pt-BR')}</span>
                           </div>
                           <h4 className="font-bold text-slate-800 text-sm line-clamp-2 mb-1">{activity.tipo}</h4>
                           <p className="text-xs text-slate-500 mb-3">{activity.numeroProcesso || 'Sem processo'}</p>
                           {activity.observacao && (
                             <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                               <p className="text-[10px] text-slate-600 italic line-clamp-3">{activity.observacao}</p>
                             </div>
                           )}
                        </div>
                        
                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                           {activity.numeroProcesso && (
                             <button onClick={() => handleOpenEsaj(activity.numeroProcesso)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 bg-slate-50 rounded-lg transition-colors" title="Consultar no ESAJ"><Gavel size={14}/></button>
                           )}
                           <button onClick={() => onOpenActivity(activity)} className="p-1.5 text-slate-400 hover:text-teal-600 bg-slate-50 rounded-lg"><ExternalLink size={14}/></button>
                           <button onClick={() => handleEdit(activity)} className="p-1.5 text-slate-400 hover:text-amber-600 bg-slate-50 rounded-lg"><Pencil size={14}/></button>
                           {!isCompleted && (
                             <button onClick={() => handleQuickStatus(activity.id, 'CONCLUIDO')} className="p-1.5 text-slate-400 hover:text-green-600 bg-slate-50 rounded-lg"><Check size={14}/></button>
                           )}
                           <button onClick={() => handleRequestDelete(activity.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14}/></button>
                        </div>
                     </div>
                   );
                }

                // LIST VIEW CARD
                return (
                  <div 
                    key={activity.id} 
                    className={`bg-white rounded-xl shadow-sm border p-4 flex flex-col md:flex-row items-start gap-4 transition-all ${isEditing ? 'border-amber-400 ring-2 ring-amber-100' : 'border-slate-200 hover:border-teal-200'}`}
                  >
                    <div className={`w-full md:w-1.5 h-1.5 md:h-full min-h-[40px] ${statusClasses.bg} rounded-full shrink-0`}></div>
                    
                    <div className="flex-1 min-w-0 w-full py-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusClasses.bg} ${statusClasses.text}`}>
                          {statusLabel}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                           {new Date(activity.data).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      
                      <div className="flex items-baseline gap-2">
                        <p className="text-base font-bold text-slate-800 truncate">{activity.tipo}</p>
                        <span className="text-xs text-slate-500 font-mono">{activity.numeroProcesso}</span>
                      </div>
                      
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">
                        {activity.cargo} {activity.promotor ? `• ${activity.promotor}` : ''}
                      </p>

                      {activity.observacao && (
                        <p className="text-xs text-slate-600 italic border-l-2 border-slate-200 pl-2 mt-1 line-clamp-2">
                          {activity.observacao}
                        </p>
                      )}
                    </div>

                    {/* List Actions */}
                    <div className="flex items-center gap-1 w-full md:w-auto justify-end border-t md:border-t-0 border-slate-100 pt-3 md:pt-0 mt-2 md:mt-0 self-center">
                      
                      {activity.numeroProcesso && (
                        <button
                          onClick={() => handleOpenEsaj(activity.numeroProcesso)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Consultar no ESAJ"
                        >
                          <Gavel size={16} />
                        </button>
                      )}

                      <button
                        onClick={() => onOpenActivity(activity)}
                        className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                        title="Abrir"
                      >
                        <ExternalLink size={16} />
                      </button>

                      {!isCompleted && (
                        <button
                          onClick={() => handleQuickStatus(activity.id, 'CONCLUIDO')}
                          className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                          title="Concluir"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleEdit(activity)}
                        className={`p-2 rounded-lg transition-all ${isEditing ? 'bg-amber-50 text-amber-600' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => handleRequestDelete(activity.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all group"
                        title="Excluir"
                      >
                        <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmationId && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-slate-200 animate-in zoom-in-95 duration-200">
              <div className="flex flex-col items-center text-center gap-3">
                 <div className="p-3 bg-red-50 rounded-full text-red-500">
                    <AlertTriangle size={32} />
                 </div>
                 <div>
                   <h3 className="text-lg font-bold text-slate-800">Excluir Atividade?</h3>
                   <p className="text-sm text-slate-500 mt-1">
                     Tem certeza que deseja remover este item? Esta ação não pode ser desfeita.
                   </p>
                 </div>
                 <div className="flex w-full gap-2 mt-4">
                    <button 
                      onClick={() => setDeleteConfirmationId(null)}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={confirmDeleteActivity}
                      className="flex-1 py-2.5 rounded-xl bg-red-600 font-bold text-sm text-white hover:bg-red-700 shadow-md shadow-red-500/20 transition-all"
                    >
                      Sim, Excluir
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default ActivityLogTool;
