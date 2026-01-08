
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SidebarForm from './components/SidebarForm';
import CaseInfoBar from './components/CaseInfoBar';
import DocumentPreview from './components/DocumentPreview';
import WelcomeScreen from './components/WelcomeScreen';
import Dashboard from './components/Dashboard';
import SisDigitalTool from './components/SisDigitalTool';
import OficioTool from './components/OficioTool';
import AnppTool from './components/AnppTool';
import MultaPenalTool from './components/MultaPenalTool';
import ArchivingPromotionTool from './components/ArchivingPromotionTool';
import ActivityLogTool from './components/ActivityLogTool';
import MentorTool from './components/MentorTool';
import { Person, CaseData, AppScreen, Activity, DbPerson } from './types';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('DASHBOARD');
  const [people, setPeople] = useState<Person[]>([]);
  const [caseData, setCaseData] = useState<CaseData>({
    numeroProcesso: '',
    cargo: '',
    promotor: '',
    dataAudiencia: ''
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Effect to fetch people when case changes
  useEffect(() => {
    const fetchPeople = async () => {
      // If offline or missing data, skip fetch
      if (!caseData.numeroProcesso || !session || session.user.id === 'offline') return;
      
      try {
        // 1. Find the case ID
        const { data: cases, error: caseError } = await supabase
          .from('cases')
          .select('id')
          .eq('numero_processo', caseData.numeroProcesso)
          .single();

        if (caseError || !cases) {
            setPeople([]);
            return;
        }

        // 2. Fetch people for this case
        const { data: peopleData, error: peopleError } = await supabase
          .from('people')
          .select('*')
          .eq('case_id', cases.id);

        if (peopleError) throw peopleError;

        // Map snake_case to camelCase
        const mappedPeople: Person[] = (peopleData as DbPerson[]).map(p => ({
          id: p.id,
          case_id: p.case_id,
          nome: p.nome,
          folha: p.folha,
          nacionalidade: p.nacionalidade,
          cpf: p.cpf,
          rg: p.rg,
          pai: p.pai,
          mae: p.mae,
          dataNascimento: p.data_nascimento
        }));

        setPeople(mappedPeople);

      } catch (error) {
        console.error("Error fetching people:", error);
      }
    };

    fetchPeople();
  }, [caseData.numeroProcesso, session]);


  const handleAddPerson = (person: Person) => {
    setPeople(prev => [...prev, person]);
  };

  const handleRemovePerson = async (id: string) => {
    // Optimistic update
    const originalPeople = [...people];
    setPeople(prev => prev.filter(p => p.id !== id));

    if (session?.user?.id === 'offline') return;

    try {
      const { error } = await supabase.from('people').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error("Failed to delete person:", err);
      alert("Erro ao excluir pessoa do banco de dados.");
      setPeople(originalPeople); // Revert
    }
  };

  const handleLogin = (sessionData: any) => {
    setSession(sessionData);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setPeople([]);
    setCaseData({
        numeroProcesso: '',
        cargo: '',
        promotor: '',
        dataAudiencia: ''
    });
    setCurrentScreen('DASHBOARD');
  };

  const handleResetAll = () => {
    if (confirm("Tem certeza que deseja limpar os dados da tela? (Isso não apaga do banco de dados)")) {
        setPeople([]);
        setCaseData({
            numeroProcesso: '',
            cargo: '',
            promotor: '',
            dataAudiencia: ''
        });
    }
  };

  const handleOpenActivity = (activity: Activity) => {
    setCaseData(prev => ({
      ...prev,
      numeroProcesso: activity.numeroProcesso,
      cargo: activity.cargo,
      promotor: activity.promotor
    }));

    switch (activity.tipo) {
      case 'Pesquisa de NI': setCurrentScreen('PESQUISA_NI'); break;
      case 'Multa Penal': setCurrentScreen('MULTA_PENAL'); break;
      case 'ANPP - Execuções':
      case 'ANPP - Dados Bancários': setCurrentScreen('ANPP'); break;
      case 'Ofício': setCurrentScreen('OFICIO'); break;
      case 'Notícia de Fato':
      case 'Notificação - (Art. 28)':
      case 'Agendamento de Despacho': setCurrentScreen('SISDIGITAL'); break;
      default:
        if (activity.tipo.includes('Arquivamento')) {
           setCurrentScreen('PROMOCAO_ARQUIVAMENTO');
        } else {
           setCurrentScreen('DASHBOARD');
        }
    }
  };

  const renderScreen = () => {
    if (!session) return <WelcomeScreen onConfirm={handleLogin} />;

    switch (currentScreen) {
      case 'DASHBOARD':
        return <Dashboard onSelectScreen={setCurrentScreen} />;
      
      case 'PESQUISA_NI':
        return (
          <main className="flex flex-1 overflow-hidden animate-in fade-in duration-700">
            <SidebarForm 
                onAddPerson={handleAddPerson} 
                people={people}
                onRemovePerson={handleRemovePerson}
                caseData={caseData} // Passing caseData so SidebarForm can check/create case in DB
                userId={session.user.id}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
              <CaseInfoBar caseData={caseData} setCaseData={setCaseData} />
              <div className="flex-1 p-6 lg:p-10 overflow-hidden bg-slate-200/50 relative">
                 <div className="h-full w-full max-w-[1400px] mx-auto">
                    <DocumentPreview 
                        caseData={caseData} 
                        people={people} 
                        onReset={handleResetAll}
                    />
                 </div>
              </div>
            </div>
          </main>
        );

      case 'SISDIGITAL': return <SisDigitalTool />;
      case 'OFICIO': return <OficioTool userId={session.user.id} caseData={caseData} />;
      case 'ANPP': return <AnppTool userId={session.user.id} caseData={caseData} />;
      case 'MULTA_PENAL': return <MultaPenalTool />;
      case 'PROMOCAO_ARQUIVAMENTO': return <ArchivingPromotionTool />;
      case 'ACTIVITIES': return <ActivityLogTool onOpenActivity={handleOpenActivity} userId={session.user.id} />;
      case 'MENTOR': return <MentorTool userId={session.user.id} />;

      default:
        return (
          <div className="flex-1 flex items-center justify-center bg-slate-100">
             <div className="text-center p-12 bg-white rounded-3xl shadow-xl border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Em Manutenção</h2>
                <button 
                  onClick={() => setCurrentScreen('DASHBOARD')}
                  className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold"
                >
                  Voltar ao Dashboard
                </button>
             </div>
          </div>
        );
    }
  };

  if (!session) {
    return <WelcomeScreen onConfirm={handleLogin} />;
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-100 text-slate-900 selection:bg-red-100">
      <Header 
        userName={session.user.id === 'offline' ? 'Modo Offline' : session.user.email} 
        showBackButton={currentScreen !== 'DASHBOARD'} 
        onBack={() => setCurrentScreen('DASHBOARD')}
        onLogout={handleLogout}
      />
      {renderScreen()}
    </div>
  );
};

export default App;
