
import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Filter, 
  Printer, 
  BarChart3, 
  Calendar, 
  Briefcase, 
  User, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Scale
} from 'lucide-react';
import { Expense, Income } from '../types';

interface ReportsViewProps {
  onBack: () => void;
  incomes: Income[];
  expenses: Expense[];
  viewDate: Date;
  companyName: string;
}

type TaxFilter = 'all' | 'PJ' | 'PF';
type ViewMode = 'caixa' | 'competencia';

const ReportsView: React.FC<ReportsViewProps> = ({ 
  onBack, 
  incomes, 
  expenses, 
  viewDate,
  companyName
}) => {
  const [taxFilter, setTaxFilter] = useState<TaxFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('caixa');

  const monthLabel = viewDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  // --- FILTERING LOGIC ---
  const filteredData = useMemo(() => {
      const targetMonth = viewDate.getMonth();
      const targetYear = viewDate.getFullYear();

      const filterByDateAndTax = (items: (Income | Expense)[], isIncome: boolean) => {
          return items.filter(item => {
              // 1. Tax Filter
              if (taxFilter !== 'all') {
                  const itemTax = item.taxStatus || 'PJ'; // Default legacy to PJ
                  if (itemTax !== taxFilter) return false;
              }

              // 2. Date Filter (Caixa vs Competencia)
              let itemDate: Date;
              
              if (viewMode === 'competencia') {
                  // Competência: Use 'competenceDate' for Income, 'date' (launch) for Expense
                  // Fallback to primary date if competence date missing
                  if (isIncome) {
                      const inc = item as Income;
                      itemDate = new Date((inc.competenceDate || inc.date) + 'T12:00:00');
                  } else {
                      const exp = item as Expense;
                      itemDate = new Date(exp.date + 'T12:00:00');
                  }
              } else {
                  // Caixa: Use 'date' (receipt) for Income, 'dueDate' for Expense
                  // Note: 'Caixa' strictly means when money moves.
                  if (isIncome) {
                      const inc = item as Income;
                      itemDate = new Date(inc.date + 'T12:00:00');
                  } else {
                      const exp = item as Expense;
                      // Expenses usually impact cash flow on due date or payment date
                      itemDate = new Date(exp.dueDate + 'T12:00:00');
                  }
              }

              return itemDate.getMonth() === targetMonth && itemDate.getFullYear() === targetYear;
          });
      };

      const filteredIncomes = filterByDateAndTax(incomes, true) as Income[];
      const filteredExpenses = filterByDateAndTax(expenses, false) as Expense[];

      return { filteredIncomes, filteredExpenses };
  }, [incomes, expenses, viewDate, taxFilter, viewMode]);

  // --- CALCULATIONS ---
  const totalIncome = filteredData.filteredIncomes.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = filteredData.filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const result = totalIncome - totalExpense;
  const margin = totalIncome > 0 ? (result / totalIncome) * 100 : 0;

  const handlePrint = () => {
      window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] text-zinc-900 dark:text-white font-inter pb-20 transition-colors duration-300 print:bg-white print:text-black">
        
        {/* Header - Hidden on Print */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-6 relative z-10 print:hidden">
            <button 
                onClick={onBack}
                className="mb-6 flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
            >
                <ArrowLeft size={16} /> Voltar ao Dashboard
            </button>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-3">
                        <BarChart3 className="text-indigo-600 dark:text-indigo-400" />
                        Relatório Gerencial
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Análise detalhada de resultados
                    </p>
                </div>
                
                <button 
                    onClick={handlePrint}
                    className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-lg transition-all active:scale-95"
                >
                    <Printer size={18} />
                    Exportar / Imprimir
                </button>
            </div>
        </div>

        {/* Filters Toolbar - Hidden on Print */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-8 print:hidden">
            <div className="bg-white dark:bg-[#151517] border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-6 items-center">
                
                <div className="flex items-center gap-2 text-sm font-semibold text-zinc-500 w-full md:w-auto">
                    <Filter size={16} /> Filtros:
                </div>

                {/* Natureza Filter */}
                <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg w-full md:w-auto">
                    <button 
                        onClick={() => setTaxFilter('all')}
                        className={`flex-1 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${taxFilter === 'all' ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                    >
                        Tudo
                    </button>
                    <button 
                        onClick={() => setTaxFilter('PJ')}
                        className={`flex-1 px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-1 ${taxFilter === 'PJ' ? 'bg-white dark:bg-zinc-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                    >
                        <Briefcase size={14} /> PJ (MEI)
                    </button>
                    <button 
                        onClick={() => setTaxFilter('PF')}
                        className={`flex-1 px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-1 ${taxFilter === 'PF' ? 'bg-white dark:bg-zinc-700 shadow-sm text-cyan-600 dark:text-cyan-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                    >
                        <User size={14} /> PF (Pessoal)
                    </button>
                </div>

                {/* View Mode Filter */}
                <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg w-full md:w-auto ml-auto">
                    <button 
                        onClick={() => setViewMode('caixa')}
                        className={`flex-1 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'caixa' ? 'bg-white dark:bg-zinc-700 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                    >
                        Visão Caixa
                    </button>
                    <button 
                        onClick={() => setViewMode('competencia')}
                        className={`flex-1 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'competencia' ? 'bg-white dark:bg-zinc-700 shadow-sm text-purple-600 dark:text-purple-400' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                    >
                        Visão Competência
                    </button>
                </div>
            </div>
        </div>

        {/* REPORT CONTENT (Printable Area) */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8 print:p-0 print:max-w-none">
            
            {/* Print Header */}
            <div className="hidden print:flex flex-col items-center mb-8 border-b pb-4">
                <h1 className="text-2xl font-bold uppercase tracking-widest mb-1">{companyName}</h1>
                <p className="text-sm text-gray-500">Relatório de Resultados - {monthLabel}</p>
                <div className="flex gap-4 mt-2 text-xs font-mono bg-gray-100 px-4 py-2 rounded">
                    <span>Filtro: {taxFilter === 'all' ? 'Consolidado' : taxFilter}</span>
                    <span>•</span>
                    <span>Visão: {viewMode === 'caixa' ? 'Regime de Caixa' : 'Regime de Competência'}</span>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3">
                <div className="bg-white dark:bg-[#151517] p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 print:border-gray-300">
                    <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400">
                        <ArrowUpCircle size={20} />
                        <span className="text-sm font-bold uppercase tracking-wide">Receitas Totais</span>
                    </div>
                    <div className="text-3xl font-bold text-zinc-900 dark:text-white print:text-black">
                        R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                </div>

                <div className="bg-white dark:bg-[#151517] p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 print:border-gray-300">
                    <div className="flex items-center gap-2 mb-2 text-rose-600 dark:text-rose-400">
                        <ArrowDownCircle size={20} />
                        <span className="text-sm font-bold uppercase tracking-wide">Despesas Totais</span>
                    </div>
                    <div className="text-3xl font-bold text-zinc-900 dark:text-white print:text-black">
                        R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                </div>

                <div className={`bg-white dark:bg-[#151517] p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 print:border-gray-300 ${result >= 0 ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : 'bg-red-50/50 dark:bg-red-900/10'}`}>
                    <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400">
                        <Scale size={20} />
                        <span className="text-sm font-bold uppercase tracking-wide">Resultado (L/P)</span>
                    </div>
                    <div className={`text-3xl font-bold ${result >= 0 ? 'text-indigo-700 dark:text-indigo-300' : 'text-red-600 dark:text-red-400'} print:text-black`}>
                        R$ {result.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs font-medium text-zinc-500 mt-1">
                        Margem: {margin.toFixed(1)}%
                    </div>
                </div>
            </div>

            {/* Visual Charts (Simple CSS Bars for print compatibility) */}
            <div className="bg-white dark:bg-[#151517] p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 print:border-gray-300">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6 print:text-black">Comparativo Financeiro</h3>
                
                <div className="space-y-6">
                    {/* Revenue Bar */}
                    <div>
                        <div className="flex justify-between text-sm mb-2 font-medium">
                            <span className="text-emerald-600 dark:text-emerald-400 print:text-black">Entradas</span>
                            <span className="text-zinc-900 dark:text-white print:text-black">{((totalIncome / (totalIncome + totalExpense || 1)) * 100).toFixed(0)}%</span>
                        </div>
                        <div className="h-4 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden print:bg-gray-100">
                            <div 
                                className="h-full bg-emerald-500 print:bg-gray-800 print:border print:border-black" 
                                style={{ width: `${(totalIncome / (totalIncome + totalExpense || 1)) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Expense Bar */}
                    <div>
                        <div className="flex justify-between text-sm mb-2 font-medium">
                            <span className="text-rose-600 dark:text-rose-400 print:text-black">Saídas</span>
                            <span className="text-zinc-900 dark:text-white print:text-black">{((totalExpense / (totalIncome + totalExpense || 1)) * 100).toFixed(0)}%</span>
                        </div>
                        <div className="h-4 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden print:bg-gray-100">
                            <div 
                                className="h-full bg-rose-500 print:bg-gray-400 print:border print:border-black" 
                                style={{ width: `${(totalExpense / (totalIncome + totalExpense || 1)) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* DRE Simplificado / Table */}
            <div className="bg-white dark:bg-[#151517] rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden print:border-gray-300">
                <table className="w-full text-sm text-left">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 print:bg-gray-100 print:border-gray-300">
                        <tr>
                            <th className="px-6 py-4 font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider print:text-black">Resumo Operacional</th>
                            <th className="px-6 py-4 font-bold text-right text-zinc-600 dark:text-zinc-300 uppercase tracking-wider print:text-black">Valor</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 print:divide-gray-200">
                        <tr>
                            <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 print:text-black">Total de Receitas</td>
                            <td className="px-6 py-4 text-right font-bold text-emerald-600 dark:text-emerald-400 print:text-black">
                                + R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 print:text-black">Total de Despesas</td>
                            <td className="px-6 py-4 text-right font-bold text-rose-600 dark:text-rose-400 print:text-black">
                                - R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                        </tr>
                        <tr className="bg-zinc-50/50 dark:bg-zinc-800/20 print:bg-gray-50 font-bold text-base">
                            <td className="px-6 py-4 text-zinc-900 dark:text-white print:text-black">Resultado Líquido</td>
                            <td className={`px-6 py-4 text-right ${result >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-red-600'} print:text-black`}>
                                R$ {result.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Footer Print Info */}
            <div className="hidden print:block text-center text-xs text-gray-400 mt-8 pt-8 border-t">
                <p>Relatório gerado pelo sistema <strong>meumei</strong> em {new Date().toLocaleString('pt-BR')}</p>
                <p>www.meumei.com.br</p>
            </div>

        </main>
    </div>
  );
};

export default ReportsView;
