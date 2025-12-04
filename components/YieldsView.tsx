
import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  TrendingUp, 
  Wallet,
  Calendar,
  PlayCircle,
  Percent,
  ShieldCheck,
  Info
} from 'lucide-react';
import { Account } from '../types';
import NewYieldModal from './NewYieldModal';

interface YieldsViewProps {
  onBack: () => void;
  accounts: Account[];
  onUpdateAccounts: (accounts: Account[]) => void;
  selicRate: number; // Mantido apenas para info visual
}

const YieldsView: React.FC<YieldsViewProps> = ({ 
  onBack, 
  accounts,
  onUpdateAccounts,
  selicRate
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredAccountId, setHoveredAccountId] = useState<string | null>(null);

  // Filtra apenas contas de investimento
  const investmentAccounts = accounts.filter(acc => {
      const isYieldType = acc.type.toLowerCase().includes('rendimento') || acc.type.toLowerCase().includes('investimento');
      return isYieldType || (acc.yieldRate !== undefined && acc.yieldRate > 0);
  });

  const totalInvested = investmentAccounts.reduce((acc, curr) => acc + curr.currentBalance, 0);

  // Calcula o total rendido "Hoje" (baseado nos lançamentos manuais com data de hoje)
  const todayStr = new Date().toISOString().split('T')[0];
  const yieldsToday = investmentAccounts.reduce((acc, curr) => {
      if (curr.lastYieldDate === todayStr && curr.lastYield) {
          return acc + curr.lastYield;
      }
      return acc;
  }, 0);

  const handleSaveYield = (data: { accountId: string, amount: number, date: string, notes: string }) => {
      const updatedAccounts = accounts.map(acc => {
          if (acc.id === data.accountId) {
              const newBalance = acc.currentBalance + data.amount;
              
              // Atualiza histórico
              const history = acc.balanceHistory ? [...acc.balanceHistory] : [];
              
              // Verifica se já existe entrada para esta data e atualiza/adiciona
              const entryIndex = history.findIndex(h => h.date === data.date);
              if (entryIndex >= 0) {
                  // Se for lançamento manual retroativo, a lógica de histórico pode ser complexa.
                  // Aqui assumimos que o histórico guarda o saldo final do dia.
                  // Se estamos adicionando rendimento, o saldo daquele dia aumenta.
                  history[entryIndex].value += data.amount; 
              } else {
                  history.push({ date: data.date, value: newBalance });
                  // Ordena por data
                  history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
              }

              return {
                  ...acc,
                  currentBalance: newBalance,
                  lastYield: data.amount,
                  lastYieldDate: data.date,
                  lastYieldNote: data.notes,
                  balanceHistory: history
              };
          }
          return acc;
      });

      onUpdateAccounts(updatedAccounts);
      setIsModalOpen(false);
  };

  // --- CHART COMPONENT ---
  const ChartComponent = useMemo(() => {
    if (investmentAccounts.length === 0) return null;

    const allPoints: { date: string, value: number, accId: string }[] = [];
    investmentAccounts.forEach(acc => {
        if (acc.balanceHistory && acc.balanceHistory.length > 0) {
            acc.balanceHistory.forEach(h => allPoints.push({ ...h, accId: acc.id }));
        } else {
            allPoints.push({ date: new Date().toISOString(), value: acc.currentBalance, accId: acc.id });
        }
    });

    if (allPoints.length < 2) return (
        <div className="h-64 flex flex-col items-center justify-center text-zinc-400 text-sm italic bg-zinc-50 dark:bg-black/20 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
            <TrendingUp size={32} className="mb-2 opacity-50" />
            <p>Lance rendimentos para gerar o gráfico de evolução.</p>
        </div>
    );

    const width = 800;
    const height = 300;
    const padding = 40;

    const baseHistory = investmentAccounts[0].balanceHistory || [];
    if (baseHistory.length < 2) return null; 

    const xStep = (width - padding * 2) / (baseHistory.length - 1);

    const allValues = allPoints.map(p => p.value);
    const minVal = Math.min(...allValues) * 0.9995; 
    const maxVal = Math.max(...allValues) * 1.0005;
    const range = maxVal - minVal;

    const getY = (val: number) => height - padding - ((val - minVal) / range) * (height - padding * 2);

    const getStrokeColor = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes('nati')) return '#ec4899'; // Pink
        if (n.includes('ale')) return '#8b5cf6'; // Violet
        if (n.includes('dk')) return '#06b6d4'; // Cyan
        return '#71717a'; 
    };

    return (
        <div className="w-full overflow-hidden">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
                {/* Linhas de Grade */}
                {[0, 0.25, 0.5, 0.75, 1].map(t => {
                    const y = height - padding - (t * (height - padding * 2));
                    return <line key={t} x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e4e4e7" strokeWidth="1" strokeDasharray="4" className="dark:stroke-zinc-800" />;
                })}

                {investmentAccounts.map(acc => {
                    const history = acc.balanceHistory || [];
                    if (history.length < 2) return null;

                    const points = history.map((point, i) => {
                        return `${padding + (i * xStep)},${getY(point.value)}`;
                    }).join(' ');

                    return (
                        <g key={acc.id}>
                            <polyline 
                                points={points}
                                fill="none" 
                                stroke={getStrokeColor(acc.name)} 
                                strokeWidth="3" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                                className="drop-shadow-md"
                            />
                            {history.map((point, i) => (
                                <circle 
                                    key={i} 
                                    cx={padding + (i * xStep)} 
                                    cy={getY(point.value)} 
                                    r="4" 
                                    fill={getStrokeColor(acc.name)} 
                                    stroke="#fff"
                                    strokeWidth="2"
                                    className="dark:stroke-[#1a1a1a]"
                                >
                                    <title>R$ {point.value.toFixed(2)}</title>
                                </circle>
                            ))}
                        </g>
                    );
                })}
            </svg>
            
            <div className="flex justify-center gap-4 mt-4 flex-wrap">
                {investmentAccounts.map(acc => (
                    <div key={acc.id} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getStrokeColor(acc.name) }}></div>
                        <span className="text-xs text-zinc-600 dark:text-zinc-300 font-bold">{acc.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
  }, [investmentAccounts]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] text-zinc-900 dark:text-white font-inter pb-20 transition-colors duration-300">
      
      {/* Header Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-6 relative z-10 -mt-2">
          <button 
             onClick={onBack}
             className="mb-6 flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
          >
              <ArrowLeft size={16} /> Voltar ao Dashboard
          </button>

          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
              <div>
                  <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-3">
                      <TrendingUp className="text-purple-600 dark:text-purple-500" />
                      Carteira de Rendimentos
                  </h1>
                  <p className="text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                      <ShieldCheck size={14} className="text-emerald-500" />
                      Acompanhamento manual de rentabilidade
                  </p>
              </div>

              {/* Selic Indicator (Mantido como referência informativa) */}
              <div className="flex items-center gap-4 bg-white dark:bg-[#151517] p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-xl text-indigo-700 dark:text-indigo-500">
                      <Percent size={20} />
                  </div>
                  <div>
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Referência</p>
                      <p className="text-xl font-bold text-zinc-900 dark:text-white">CDI / Selic</p>
                      <p className="text-[10px] text-zinc-400">Selic atual: {selicRate.toFixed(2)}%</p>
                  </div>
              </div>
          </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Top Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Balance Card */}
              <div className="md:col-span-2 bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-900/20">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                  
                  <div className="relative z-10 flex flex-col justify-between h-full">
                      <div className="flex items-start justify-between">
                          <div>
                              <p className="text-indigo-200 font-medium mb-1">Patrimônio em Aplicações</p>
                              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                                  R$ {totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </h2>
                          </div>
                          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
                              <Wallet size={24} className="text-indigo-100" />
                          </div>
                      </div>

                      <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="flex items-center gap-2 text-indigo-200 text-sm">
                              <Calendar size={16} />
                              <span>Hoje, {new Date().toLocaleDateString('pt-BR')}</span>
                          </div>
                          <button 
                            onClick={() => setIsModalOpen(true)}
                            className="w-full sm:w-auto bg-white text-indigo-900 hover:bg-indigo-50 font-bold py-3 px-6 rounded-lg shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
                          >
                            <PlayCircle size={18} fill="currentColor" className="text-indigo-900" />
                            Adicionar Rendimento Diário
                          </button>
                      </div>
                  </div>
              </div>

              {/* Status Card (Manual Summary) */}
              <div className="bg-white dark:bg-[#151517] rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 text-emerald-500/5">
                      <TrendingUp size={150} />
                  </div>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-4 flex items-center gap-2 relative z-10">
                      <TrendingUp size={16} className="text-emerald-500" />
                      Rendimentos Lançados (Hoje)
                  </p>
                  <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2 relative z-10">
                      + R$ {yieldsToday.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-[10px] text-zinc-400 relative z-10 leading-relaxed">
                     Soma dos valores adicionados manualmente na data de hoje.
                  </p>
              </div>
          </div>

          {/* Chart Section */}
          <div className="bg-white dark:bg-[#151517] rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
               <div className="flex items-center justify-between mb-6">
                   <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Curva de Crescimento (Histórico)</h3>
               </div>
               <div className="w-full">
                  {ChartComponent}
               </div>
          </div>

          {/* Individual Accounts Grid */}
          <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 ml-1">Detalhamento por Conta</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {investmentAccounts.map(account => {
                      const displayYield = account.lastYield || 0;
                      
                      return (
                      <div 
                          key={account.id} 
                          className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-violet-500/30 transition-all duration-300 relative group"
                      >
                          <div className="flex justify-between items-start mb-4">
                              <div>
                                  <h4 className="font-bold text-zinc-900 dark:text-white text-lg">{account.name}</h4>
                                  <div className="flex items-center gap-1.5 mt-1">
                                      <span className="text-[10px] font-bold bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded-md border border-violet-200 dark:border-violet-800">
                                          {account.yieldRate}% do CDI
                                      </span>
                                  </div>
                              </div>
                              
                              {/* INFO TOOLTIP TRIGGER */}
                              <div className="relative">
                                  <button
                                    onMouseEnter={() => setHoveredAccountId(account.id)}
                                    onMouseLeave={() => setHoveredAccountId(null)}
                                    className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-zinc-400 hover:text-blue-500 transition-colors cursor-help"
                                  >
                                      <Info size={20} />
                                  </button>

                                  {/* TOOLTIP CONTENT */}
                                  {hoveredAccountId === account.id && (
                                      <div className="absolute right-0 top-10 w-64 bg-white dark:bg-[#202020] border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                                          <div className="flex items-center gap-2 mb-3 border-b border-zinc-100 dark:border-zinc-700 pb-2">
                                              <ShieldCheck size={14} className="text-emerald-500" />
                                              <span className="text-xs font-bold text-zinc-900 dark:text-white uppercase">Detalhes do Lançamento</span>
                                          </div>
                                          <div className="space-y-2 text-xs">
                                              <div className="flex justify-between">
                                                  <span className="text-zinc-500">Data:</span>
                                                  <span className="text-zinc-900 dark:text-zinc-200">
                                                      {account.lastYieldDate ? new Date(account.lastYieldDate).toLocaleDateString('pt-BR') : '-'}
                                                  </span>
                                              </div>
                                              <div className="flex justify-between">
                                                  <span className="text-zinc-500">Valor Lançado:</span>
                                                  <span className="text-emerald-500 font-bold">+ R$ {displayYield.toFixed(2)}</span>
                                              </div>
                                              {account.lastYieldNote && (
                                                  <div className="pt-2 mt-1 border-t border-zinc-100 dark:border-zinc-700">
                                                      <span className="text-zinc-500 block mb-1">Obs:</span>
                                                      <p className="text-zinc-400 italic leading-snug">{account.lastYieldNote}</p>
                                                  </div>
                                              )}
                                          </div>
                                          {/* Seta do tooltip */}
                                          <div className="absolute -top-1.5 right-3 w-3 h-3 bg-white dark:bg-[#202020] border-l border-t border-zinc-200 dark:border-zinc-700 transform rotate-45"></div>
                                      </div>
                                  )}
                              </div>
                          </div>

                          <div className="space-y-4">
                              <div>
                                  <p className="text-xs text-zinc-500 uppercase font-semibold">Saldo Atual</p>
                                  <p className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
                                      R$ {account.currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </p>
                              </div>

                              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                  <div className="flex justify-between items-center mb-1">
                                      <span className="text-xs text-zinc-500">Último Rendimento (Liq)</span>
                                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded">
                                          + R$ {displayYield.toFixed(2)}
                                      </span>
                                  </div>
                                  
                                  <div className="mt-2 text-[10px] text-zinc-400">
                                      Passe o mouse no ícone ℹ️ para detalhes.
                                  </div>
                              </div>
                          </div>
                      </div>
                  )})}
              </div>
          </div>
          
          <NewYieldModal 
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSave={handleSaveYield}
              accounts={investmentAccounts}
          />

      </main>
    </div>
  );
};

export default YieldsView;
