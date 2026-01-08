
import React, { useState, useMemo } from 'react';
import { PROMOTORIAS } from '../types';
import { FileText, Copy, CheckCircle, MessageSquare, FilePlus } from 'lucide-react';

const SisDigitalTool: React.FC = () => {
  const [cargo, setCargo] = useState('');
  const [docId, setDocId] = useState('');
  const [tipoDoc, setTipoDoc] = useState<'NF' | 'ATENDIMENTO'>('NF');
  const [termoType, setTermoType] = useState<'CONCLUSAO' | 'JUNTADA'>('CONCLUSAO');
  
  // New state for Termo de Juntada
  const [docJuntado, setDocJuntado] = useState('');
  const [folhas, setFolhas] = useState('');

  const [copiedTermo, setCopiedTermo] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);

  const selectedPromotoria = useMemo(() => 
    PROMOTORIAS.find(p => p.label === cargo), [cargo]);

  const promotorName = useMemo(() => {
    if (!selectedPromotoria) return "";
    return selectedPromotoria.schedule[0].name;
  }, [selectedPromotoria]);

  const cortesia = useMemo(() => {
    if (!selectedPromotoria) return "Dr(a).";
    return selectedPromotoria.schedule[0].gender === 'F' ? 'Dra.' : 'Dr.';
  }, [selectedPromotoria]);

  const cargoNumero = useMemo(() => {
    const match = cargo.match(/\d+/);
    return match ? match[0] : "";
  }, [cargo]);

  const docLabel = tipoDoc === 'NF' ? 'Notícia de Fato' : 'Atendimento';
  const docAbbr = tipoDoc === 'NF' ? 'N.F' : 'Atendimento';

  const termoConclusaoContent = useMemo(() => `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.5; color: #000;">
      <p style="text-align: center; font-weight: bold; text-decoration: underline; margin-bottom: 20px;">TERMO DE CONCLUSÃO</p>
      <p>${docLabel} n° ${docId || '____._______/____'}.</p>
      <p>Cargo: ${cargoNumero || '____'}° Promotor de Justiça Criminal da Capital</p>
      <br>
      <p>Na data infra, eu, Alex Santana Mendes (assinatura eletrônica), Oficial de Promotoria, Matrícula 012078, faço estes autos conclusos ao(à) ${cortesia} <b>${promotorName || '________________'}</b>.</p>
    </div>
  `, [docId, cargoNumero, cortesia, promotorName, docLabel]);
  
  const termoJuntadaContent = useMemo(() => `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.5; color: #000;">
      <p style="text-align: center; font-weight: bold; text-decoration: underline; margin-bottom: 20px;">TERMO DE JUNTADA</p>
      <p>${docLabel} n° ${docId || '____._______/____'}.</p>
      <p>Cargo: ${cargoNumero || '____'}° Promotor de Justiça Criminal da Capital</p>
      <br>
      <p>Nesta data, procedo à juntada do(a) <b>${docJuntado || '________________'}</b>, referente às fls. <b>${folhas || '____'}</b>.</p>
      <br>
      <p>São Paulo, data infra.</p>
      <br><br>
      <p>Alex Santana Mendes (assinatura eletrônica)<br>Oficial de Promotoria<br>Matrícula 012078</p>
    </div>
  `, [docId, cargoNumero, docLabel, docJuntado, folhas]);

  const prosecutorMsg = useMemo(() => {
    const firstName = promotorName ? promotorName.split(' ')[0] : 'Promotor(a)';
    return `${cortesia} ${firstName}, apenas para informar que foi aberto conclusão para análise na ${docAbbr} ${docId || '____._______/____'}`;
  }, [promotorName, cortesia, docAbbr, docId]);

  const handleCopyTermo = () => {
    const contentToCopy = termoType === 'CONCLUSAO' ? termoConclusaoContent : termoJuntadaContent;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = contentToCopy;
    const plainText = tempDiv.innerText;
    
    const htmlBlob = new Blob([contentToCopy], { type: 'text/html' });
    const textBlob = new Blob([plainText], { type: 'text/plain' });
    
    navigator.clipboard.write([
      new ClipboardItem({ 'text/html': htmlBlob, 'text/plain': textBlob })
    ]).then(() => {
      setCopiedTermo(true);
      setTimeout(() => setCopiedTermo(false), 2000);
    });
  };

  const handleCopyMsg = () => {
    navigator.clipboard.writeText(prosecutorMsg).then(() => {
      setCopiedMsg(true);
      setTimeout(() => setCopiedMsg(false), 2000);
    });
  };

  return (
    <div className="flex flex-1 overflow-hidden animate-in fade-in duration-500">
      <div className="w-[380px] bg-white border-r border-slate-200 p-6 flex flex-col gap-6 shadow-xl z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500 rounded-lg text-white"><FileText size={20} /></div>
          <div>
            <h2 className="font-bold uppercase tracking-tight">SISDIGITAL</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Gerador de Termos</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Tipo de Termo</label>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setTermoType('CONCLUSAO')}
                className={`flex items-center justify-center gap-2 flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all ${termoType === 'CONCLUSAO' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
              >
                <FileText size={12}/> Conclusão
              </button>
              <button 
                onClick={() => setTermoType('JUNTADA')}
                className={`flex items-center justify-center gap-2 flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all ${termoType === 'JUNTADA' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
              >
                <FilePlus size={12}/> Juntada
              </button>
            </div>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setTipoDoc('NF')}
              className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all ${tipoDoc === 'NF' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
            >
              Notícia de Fato
            </button>
            <button 
              onClick={() => setTipoDoc('ATENDIMENTO')}
              className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all ${tipoDoc === 'ATENDIMENTO' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
            >
              Atendimento
            </button>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{tipoDoc === 'NF' ? 'Notícia de Fato nº' : 'Atendimento nº'}</label>
            <input 
              type="text" 
              value={docId} 
              onChange={(e) => setDocId(e.target.value)}
              placeholder="0000.0000000/0000"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-blue-400 font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cargo</label>
            <select 
              value={cargo} 
              onChange={(e) => setCargo(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Selecione o Cargo</option>
              {PROMOTORIAS.map(p => <option key={p.label} value={p.label}>{p.label}</option>)}
            </select>
          </div>
          
          {termoType === 'JUNTADA' && (
            <div className="space-y-4 pt-2 border-t border-slate-100 animate-in fade-in duration-300">
               <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Documento Juntado</label>
                <input 
                  type="text" 
                  value={docJuntado} 
                  onChange={(e) => setDocJuntado(e.target.value)}
                  placeholder="Ex: Ofício da Polícia Civil, E-mail..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
               <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Folhas</label>
                <input 
                  type="text" 
                  value={folhas} 
                  onChange={(e) => setFolhas(e.target.value)}
                  placeholder="Ex: 25-27"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
          )}

          {termoType === 'CONCLUSAO' && (
            <div className="pt-4 animate-in fade-in duration-300">
               <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">Destinatário</p>
                  <p className="text-sm font-bold text-slate-700">{promotorName || "Selecione um cargo..."}</p>
               </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 bg-slate-100 p-10 overflow-y-auto flex flex-col items-center gap-8">
        {/* Document Card */}
        <div className="w-full max-w-[800px] bg-white shadow-2xl border border-slate-200 rounded-sm p-16 min-h-[500px] relative">
          <div dangerouslySetInnerHTML={{ __html: termoType === 'CONCLUSAO' ? termoConclusaoContent : termoJuntadaContent }} />
          
          <button 
            onClick={handleCopyTermo}
            className={`absolute top-6 right-6 px-6 py-2.5 rounded-lg shadow-md flex items-center gap-2 font-bold transition-all ${copiedTermo ? 'bg-green-600 text-white' : 'bg-slate-800 text-white hover:bg-slate-900'}`}
          >
            {copiedTermo ? <CheckCircle size={18} /> : <Copy size={18} />}
            {copiedTermo ? 'Copiado!' : 'Copiar Termo'}
          </button>
        </div>

        {/* Prosecutor Message Card */}
        <div className={`w-full max-w-[800px] bg-white shadow-lg border border-slate-200 rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300 ${termoType === 'JUNTADA' ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare size={18} className="text-blue-500" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Mensagem para o Promotor</span>
            </div>
            <button 
              onClick={handleCopyMsg}
              disabled={termoType === 'JUNTADA'}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${copiedMsg ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-300'}`}
            >
              {copiedMsg ? <CheckCircle size={14} /> : <Copy size={14} />}
              {copiedMsg ? 'Mensagem Copiada!' : 'Copiar Mensagem'}
            </button>
          </div>
          
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-700 text-sm leading-relaxed italic">
            "{prosecutorMsg}"
          </div>
        </div>
      </div>
    </div>
  );
};

export default SisDigitalTool;
