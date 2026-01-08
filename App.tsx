
import React, { useState } from 'react';
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
import MentorTool from './components/MentorTool'; // New import
import { Person, CaseData, AppScreen, Activity } from './types';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('DASHBOARD');
  const [people, setPeople] = useState<Person[]>([]);
  const [caseData, setCaseData] = useState<CaseData>({
    numeroProcesso: '',
    cargo: '',
    promotor: '',
    dataAudiencia: ''
  });

  const handleAddPerson = (person: Person) => {
    setPeople(prev => [...prev, person]);
  };

  const handleRemovePerson = (id: string) => {
    setPeople(prev => prev.filter(p => p.id !== id));
  };

  const handleLogin = (name: string) => {
    setUserName(name);
    setIsLoggedIn(true);
  };

  const handleResetAll = () => {
    if (confirm("Tem certeza que deseja limpar todos os dados e começar um novo processo?")) {
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
    // 1. Pre-fill global case data
    setCaseData(prev => ({
      ...prev,
      numeroProcesso: activity.numeroProcesso,
      cargo: activity.cargo,
      promotor: activity.promotor
    }));

    // 2. Navigate to appropriate screen based on activity type
    switch (activity.tipo) {
      case 'Pesquisa de NI':
        setCurrentScreen('PESQUISA_NI');
        break;
      case 'Multa Penal':
        setCurrentScreen('MULTA_PENAL');
        break;
      case 'ANPP - Execuções':
      case 'ANPP - Dados Bancários':
        setCurrentScreen('ANPP');
        break;
      case 'Ofício':
        setCurrentScreen('OFICIO');
        break;
      case 'Notícia de Fato':
      case 'Notificação - (Art. 28)':
      case 'Agendamento de Despacho':
        setCurrentScreen('SISDIGITAL');
        break;
      case 'Outros':
        // Stay on dashboard or go to a generic screen if exists
        setCurrentScreen('DASHBOARD');
        break;
      default:
        // Default fallback logic
        if (activity.tipo.includes('Arquivamento')) {
           setCurrentScreen('PROMOCAO_ARQUIVAMENTO');
        } else {
           setCurrentScreen('DASHBOARD');
        }
    }
  };

  const renderScreen = () => {
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

      case 'SISDIGITAL':
        return <SisDigitalTool />;

      case 'OFICIO':
        return <OficioTool />;

      case 'ANPP':
        return <AnppTool />;
        
      case 'MULTA_PENAL':
        return <MultaPenalTool />;

      case 'PROMOCAO_ARQUIVAMENTO':
        return <ArchivingPromotionTool />;

      case 'ACTIVITIES': 
        return <ActivityLogTool onOpenActivity={handleOpenActivity} />;
      
      case 'MENTOR':
        return <MentorTool />;

      default:
        return (
          <div className="flex-1 flex items-center justify-center bg-slate-100">
             <div className="text-center p-12 bg-white rounded-3xl shadow-xl border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Ferramenta em Desenvolvimento</h2>
                <p className="text-slate-500 mb-8">A ferramenta {currentScreen} está sendo integrada ao novo painel.</p>
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

  if (!isLoggedIn) {
    return <WelcomeScreen onConfirm={handleLogin} />;
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-100 text-slate-900 selection:bg-red-100">
      <Header 
        userName={userName} 
        showBackButton={currentScreen !== 'DASHBOARD'} 
        onBack={() => setCurrentScreen('DASHBOARD')} 
      />
      {renderScreen()}
    </div>
  );
};

export default App;