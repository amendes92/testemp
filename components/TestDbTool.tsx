
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../database.types';
import { Database as DatabaseIcon, Play, RefreshCw, AlertCircle, CheckCircle2, Table, Server } from 'lucide-react';

const TestDbTool: React.FC = () => {
    const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [message, setMessage] = useState('Pronto para testar a conexão.');
    const [results, setResults] = useState<any[] | null>(null);
    const [tableName, setTableName] = useState<keyof Database['public']['Tables']>('profiles');

    const testConnection = async () => {
        setStatus('LOADING');
        setMessage('Iniciando teste de conexão...');
        setResults(null);
        try {
            // 1. Check Session
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) throw new Error(`Erro de Sessão: ${sessionError.message}`);
            
            const userStatus = session ? `Usuário autenticado (${session.user.email})` : 'Usuário não autenticado (Anônimo/Offline)';
            setMessage(`${userStatus}. Consultando tabela '${tableName}'...`);

            // 2. Query Table
            const { data, error, count } = await supabase
                .from(tableName)
                .select('*', { count: 'exact' })
                .limit(10);

            if (error) throw new Error(`Erro na Query (${error.code}): ${error.message}`);

            setStatus('SUCCESS');
            setMessage(`Sucesso! Conexão estabelecida. Encontrados ${count} registros no total (Exibindo ${data.length}).`);
            setResults(data);

        } catch (err: any) {
            console.error(err);
            setStatus('ERROR');
            setMessage(`Falha: ${err.message || 'Erro desconhecido'}`);
        }
    };

    return (
        <div className="flex-1 bg-slate-100 p-8 overflow-y-auto">
            <div className="max-w-5xl mx-auto space-y-6">
                
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-600 rounded-xl text-white">
                            <DatabaseIcon size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Diagnóstico de Banco de Dados</h1>
                            <p className="text-slate-500">Ferramenta técnica para verificar conectividade e integridade dos dados.</p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 items-end bg-slate-50 p-6 rounded-xl border border-slate-200">
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tabela Alvo</label>
                            <div className="relative">
                                <Table className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <select 
                                    value={tableName} 
                                    onChange={(e) => setTableName(e.target.value as any)}
                                    className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                                >
                                    <option value="activities">activities</option>
                                    <option value="anpp_requests">anpp_requests</option>
                                    <option value="cases">cases</option>
                                    <option value="case_participants">case_participants</option>
                                    <option value="global_people">global_people</option>
                                    <option value="master_cargos">master_cargos</option>
                                    <option value="master_promotores">master_promotores</option>
                                    <option value="mentor_chats">mentor_chats</option>
                                    <option value="oficios">oficios</option>
                                    <option value="profiles">profiles</option>
                                    <option value="tb_cargos_acumulacoes">tb_cargos_acumulacoes</option>
                                    <option value="tb_escala_analistas">tb_escala_analistas</option>
                                    <option value="tb_escala_varas">tb_escala_varas</option>
                                </select>
                            </div>
                        </div>
                        <button 
                            onClick={testConnection}
                            disabled={status === 'LOADING'}
                            className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            {status === 'LOADING' ? <RefreshCw className="animate-spin" size={20} /> : <Play size={20} />}
                            Executar Teste
                        </button>
                    </div>
                </div>

                {/* Status Panel */}
                <div className={`rounded-2xl border p-6 flex items-start gap-4 transition-all ${
                    status === 'IDLE' ? 'bg-white border-slate-200' :
                    status === 'LOADING' ? 'bg-blue-50 border-blue-200' :
                    status === 'SUCCESS' ? 'bg-green-50 border-green-200' :
                    'bg-red-50 border-red-200'
                }`}>
                    <div className={`p-2 rounded-full mt-0.5 shrink-0 ${
                         status === 'IDLE' ? 'bg-slate-100 text-slate-400' :
                         status === 'LOADING' ? 'bg-blue-100 text-blue-600' :
                         status === 'SUCCESS' ? 'bg-green-100 text-green-600' :
                         'bg-red-100 text-red-600'
                    }`}>
                        {status === 'IDLE' ? <Server size={20} /> :
                         status === 'LOADING' ? <RefreshCw className="animate-spin" size={20} /> :
                         status === 'SUCCESS' ? <CheckCircle2 size={20} /> :
                         <AlertCircle size={20} />}
                    </div>
                    <div>
                        <h3 className={`font-bold uppercase tracking-wide text-sm mb-1 ${
                             status === 'IDLE' ? 'text-slate-500' :
                             status === 'LOADING' ? 'text-blue-700' :
                             status === 'SUCCESS' ? 'text-green-700' :
                             'text-red-700'
                        }`}>
                            {status === 'IDLE' ? 'Aguardando' : 
                             status === 'LOADING' ? 'Processando' : 
                             status === 'SUCCESS' ? 'Sucesso' : 'Erro'}
                        </h3>
                        <p className="text-slate-600 text-sm font-medium">{message}</p>
                    </div>
                </div>

                {/* Results Table */}
                {results && (
                    <div className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-700">
                        <div className="bg-slate-800 px-6 py-3 border-b border-slate-700 flex justify-between items-center">
                            <span className="text-slate-300 font-mono text-xs font-bold uppercase tracking-wider">JSON Result Output</span>
                            <span className="text-slate-500 text-xs">{results.length} registros</span>
                        </div>
                        <div className="p-0 overflow-x-auto">
                            {results.length === 0 ? (
                                <div className="p-8 text-center text-slate-500 italic">Tabela vazia ou sem resultados para a consulta.</div>
                            ) : (
                                <pre className="p-6 text-xs font-mono text-green-400 leading-relaxed custom-scrollbar max-h-[500px] overflow-y-auto">
                                    {JSON.stringify(results, null, 2)}
                                </pre>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TestDbTool;
