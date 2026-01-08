

export interface Person {
  id: string;
  nome: string;
  folha: string;
  nacionalidade: string;
  cpf: string;
  rg: string;
  pai: string;
  mae: string;
  dataNascimento: string;
}

export interface CaseData {
  numeroProcesso: string;
  cargo: string;
  promotor: string;
  dataAudiencia: string;
}

export type Gender = 'M' | 'F';

export type AppScreen = 'DASHBOARD' | 'PESQUISA_NI' | 'SISDIGITAL' | 'OFICIO' | 'ANPP' | 'MULTA_PENAL' | 'PROMOCAO_ARQUIVAMENTO' | 'ACTIVITIES' | 'MENTOR';

interface Schedule {
  name: string;
  gender: Gender;
  start: number;
  end: number;
}

export interface PromotoriaDef {
  label: string;
  schedule: Schedule[];
}

export const ACTIVITY_STATUSES = [
  { label: 'Não Verificado', value: 'NAO_VERIFICADO', colorClass: { bg: 'bg-slate-300', text: 'text-slate-800' } },
  { label: 'Pendente', value: 'PENDENTE', colorClass: { bg: 'bg-yellow-500', text: 'text-white' } },
  { label: 'Revisar', value: 'REVISAR', colorClass: { bg: 'bg-orange-500', text: 'text-white' } },
  { label: 'Em Andamento', value: 'EM_ANDAMENTO', colorClass: { bg: 'bg-indigo-500', text: 'text-white' } },
  { label: 'Aguardando', value: 'AGUARDANDO', colorClass: { bg: 'bg-red-500', text: 'text-white' } },
  { label: 'Finalizado / Não Concluído', value: 'FINALIZADO_NAO_CONCLUIDO', colorClass: { bg: 'bg-blue-300', text: 'text-blue-800' } },
  { label: 'Concluído', value: 'CONCLUIDO', colorClass: { bg: 'bg-green-500', text: 'text-white' } },
  { label: 'Finalizado', value: 'FINALIZADO', colorClass: { bg: 'bg-purple-500', text: 'text-white' } },
];

export type ActivityStatus = typeof ACTIVITY_STATUSES[number]['value'];

export interface Activity {
  id: string;
  numeroProcesso: string;
  data: string; // YYYY-MM-DD
  status: ActivityStatus;
  tipo: string;
  cargo: string;
  promotor: string;
  observacao?: string;
}

export const ACTIVITY_TYPES = [
  'Multa Penal',
  'Pesquisa de NI',
  'Notificação - (Art. 28)',
  'ANPP - Execuções',
  'Ofício',
  'Agendamento de Despacho',
  'Outros',
  'ANPP - Dados Bancários',
  'Notícia de Fato',
];

export const PROMOTORIAS: PromotoriaDef[] = [
  {
    label: "61º Promotor de Justiça Criminal",
    schedule: [
      { name: "Nina Pereira Malheiros", gender: 'F', start: 1, end: 31 }
    ]
  },
  {
    label: "62º Promotor de Justiça Criminal",
    schedule: [{ name: "Pedro Henrique da Silva Rosa", gender: 'M', start: 1, end: 31 }]
  },
  {
    label: "63º Promotor de Justiça Criminal",
    schedule: [{ name: "Michaela Carli Gomes", gender: 'F', start: 1, end: 31 }]
  },
  {
    label: "64º Promotor de Justiça Criminal",
    schedule: [
      { name: "Pedro Henrique Pavanelli Lima", gender: 'M', start: 7, end: 16 },
      { name: "Tânia Serra Azul Guimaraes Biazolli", gender: 'F', start: 17, end: 31 }
    ]
  },
  {
    label: "65º Promotor de Justiça Criminal",
    schedule: [
      { name: "Rafael Leme Cabello", gender: 'M', start: 7, end: 16 },
      { name: "Paulo Henrique Castex", gender: 'M', start: 17, end: 31 }
    ]
  },
  {
    label: "66º Promotor de Justiça Criminal",
    schedule: [
      { name: "Martha de Camargo Duarte Dias", gender: 'F', start: 1, end: 16 },
      { name: "Barbara da Cunha Defaveri", gender: 'F', start: 17, end: 31 }
    ]
  },
  {
    label: "67º Promotor de Justiça Criminal",
    schedule: [
      { name: "Vera Lorza Duarte", gender: 'F', start: 1, end: 31 }
    ]
  },
  {
    label: "68º Promotor de Justiça Criminal",
    schedule: [{ name: "Beatriz Lotufo Oliveira", gender: 'F', start: 1, end: 31 }]
  },
  {
    label: "69º Promotor de Justiça Criminal",
    schedule: [
      { name: "Laurani Assis de Figueiredo", gender: 'F', start: 7, end: 16 },
      { name: "Adriana Ribeiro Soares de Morais", gender: 'F', start: 17, end: 31 }
    ]
  },
  {
    label: "70º Promotor de Justiça Criminal",
    schedule: [
      { name: "Barbara da Cunha Defaveri", gender: 'F', start: 1, end: 31 }
    ]
  },
  {
    label: "71º Promotor de Justiça Criminal",
    schedule: [{ name: "Leonardo D'Angelo Vargas Pereira", gender: 'M', start: 1, end: 31 }]
  },
  {
    label: "72º Promotor de Justiça Criminal",
    schedule: [{ name: "Pedro Henrique da Silva Rosa", gender: 'M', start: 1, end: 31 }]
  },
  {
    label: "73º Promotor de Justiça Criminal",
    schedule: [{ name: "Daniel Fontana", gender: 'M', start: 1, end: 31 }]
  },
  {
    label: "74º Promotor de Justiça Criminal",
    schedule: [{ name: "Pedro de Andrade Khouri Santos", gender: 'M', start: 1, end: 31 }]
  },
  {
    label: "75º Promotor de Justiça Criminal",
    schedule: [
      { name: "Guilherme Carvalho da Silva", gender: 'M', start: 7, end: 16 },
      { name: "Fernanda Queiroz Karan Franco", gender: 'F', start: 17, end: 31 }
    ]
  },
  {
    label: "76º Promotor de Justiça Criminal",
    schedule: [{ name: "Laurani Assis de Figueiredo", gender: 'F', start: 1, end: 31 }]
  },
  {
    label: "77º Promotor de Justiça Criminal",
    schedule: [{ name: "Solange Aparecida Cruz", gender: 'F', start: 1, end: 31 }]
  },
  {
    label: "78º Promotor de Justiça Criminal",
    schedule: [{ name: "Claudio Henrique Bastos Giannini", gender: 'M', start: 1, end: 31 }]
  },
  {
    label: "79º Promotor de Justiça Criminal",
    schedule: [{ name: "Margareth Ferraz França", gender: 'F', start: 1, end: 31 }]
  },
  {
    label: "80º Promotor de Justiça Criminal",
    schedule: [{ name: "Tais Servilha Ferrari", gender: 'F', start: 1, end: 31 }]
  },
];