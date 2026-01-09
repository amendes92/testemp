
import React from 'react';
import { Search, FileText, Mail, FileCheck, ArrowRight, Gavel, Archive, ListTodo, BrainCircuit, Users, Database } from 'lucide-react';
import { AppScreen } from '../types';

interface DashboardProps {
  onSelectScreen: (screen: AppScreen) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onSelectScreen }) => {
  const tools = [
    {
      id: 'MENTOR' as AppScreen,
      title: 'Mentor Jurídico',
      description: 'Análise avançada de peças e orientação jurídica via IA.',
      icon: <BrainCircuit className="text-violet-500" size={32} />,
      color: 'bg-violet-50',
      borderColor: 'border-violet-200'
    },
    {
      id: 'ACTIVITIES' as AppScreen,
      title: 'Minhas Atividades',
      description: 'Gerencie e acompanhe suas atividades e processos pessoais.',
      icon: <ListTodo className="text-teal-500" size={32} />,
      color: 'bg-teal-50',
      borderColor: 'border-teal-200'
    },
    {
      id: 'PESQUISA_NI' as AppScreen,
      title: 'Pesquisa de NI',
      description: 'Gere solicitações de localização de partes para o SIS/NI.',
      icon: <Search className="text-amber-500" size={32} />,
      color: 'bg-amber-50',
      borderColor: 'border-amber-200'
    },
    {
      id: 'SISDIGITAL' as AppScreen,
      title: 'SISDIGITAL',
      description: 'Termo de Conclusão para Notícia de Fato.',
      icon: <FileText className="text-blue-500" size={32} />,
      color: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'MULTA_PENAL' as AppScreen,
      title: 'Multa Penal',
      description: 'Extração automática de dados de certidões de multa.',
      icon: <Gavel className="text-purple-500" size={32} />,
      color: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      id: 'PROMOCAO_ARQUIVAMENTO' as AppScreen,
      title: 'Arquivamento',
      description: 'Limpeza e extração de texto de Promoções de Arquivamento.',
      icon: <Archive className="text-slate-600" size={32} />,
      color: 'bg-slate-100',
      borderColor: 'border-slate-300'
    },
    {
      id: 'OFICIO' as AppScreen,
      title: 'Ofício',
      description: 'Modelos de ofícios para DPs, GAESP, Corregedoria e outros.',
      icon: <Mail className="text-red-500" size={32} />,
      color: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      id: 'ANPP' as AppScreen,
      title: 'Formulário ANPP',
      description: 'Acordo de Não Persecução Penal (Minuta e Teams).',
      icon: <FileCheck className="text-green-500" size={32} />,
      color: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      id: 'CARGOS' as AppScreen,
      title: 'Cargos e Designações',
      description: 'Gerencie titulares, designações e períodos de acumulação.',
      icon: <Users className="text-slate-800" size={32} />,
      color: 'bg-slate-200',
      borderColor: 'border-slate-300'
    },
    {
      id: 'TEST_DB' as AppScreen,
      title: 'Teste de Banco',
      description: 'Diagnóstico de conexão e visualização de tabelas.',
      icon: <Database className="text-blue-800" size={32} />,
      color: 'bg-blue-100',
      borderColor: 'border-blue-300'
    }
  ];

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-slate-100 flex flex-col items-center">
      <div className="w-full max-w-6xl">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Painel de Ferramentas</h1>
          <p className="text-slate-500">Selecione a ferramenta que deseja utilizar para o seu processo.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onSelectScreen(tool.id)}
              className="group bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-transparent transition-all flex flex-col items-center text-center relative overflow-hidden active:scale-95"
            >
              <div className={`w-20 h-20 ${tool.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                {tool.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 uppercase tracking-tight">{tool.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                {tool.description}
              </p>
              <div className="mt-auto flex items-center gap-2 text-slate-400 group-hover:text-slate-900 font-bold text-[10px] uppercase tracking-widest transition-colors">
                Acessar Ferramenta <ArrowRight size={14} />
              </div>
              
              {/* Tool specific accent */}
              <div className={`absolute top-0 right-0 w-24 h-24 ${tool.color} opacity-20 rounded-full blur-2xl -mr-12 -mt-12`}></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
