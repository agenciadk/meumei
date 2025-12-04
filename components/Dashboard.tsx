
import React from 'react';
import { 
  TrendingUp, 
  Wallet, 
  CreditCard, 
  BarChart3, 
  Home, 
  ShoppingCart, 
  User,
  ArrowUpCircle,
  ArrowDownCircle,
  Eye,
  Calendar,
  Plus
} from 'lucide-react';
import { CreditCard as CreditCardType } from '../types';

interface FinancialData {
    balance: number;
    income: number;
    expenses: number;
    pending: number;
}

interface ExpenseBreakdown {
    fixed: number;
    variable: number;
    personal: number;
}

interface DashboardProps {
  onOpenAccounts: () => void;
  onOpenVariableExpenses: () => void;
  onOpenFixedExpenses?: () => void;
  onOpenPersonalExpenses?: () => void;
  onOpenIncomes?: () => void;
  onOpenYields?: () => void; // Added prop
  financialData: FinancialData;
  creditCards: CreditCardType[];
  expenseBreakdown?: ExpenseBreakdown;
}

const Dashboard: React.FC<DashboardProps> = ({ 
    onOpenAccounts, 
    onOpenVariableExpenses,
    onOpenFixedExpenses,
    onOpenPersonalExpenses,
    onOpenIncomes,
    onOpenYields,
    financialData,
    creditCards,
    expenseBreakdown = { fixed: 0, variable: 0, personal: 0 }
}) => {
  
  // Helper to get card colors based on brand or default
  const getCardStyle = (brand: string) => {
      const b = brand.toLowerCase();
      if (b.includes('nubank')) return { light: 'from-purple-600 to-indigo-600', dark: 'from-purple-900 to-indigo-900', icon: 'https://img.icons8.com/color/48/mastercard.png' };
      if (b.includes('sicredi')) return { light: 'from-emerald-600 to-green-600', dark: 'from-emerald-800 to-green-900', icon: 'https://img.icons8.com/color/48/visa.png' };
      if (b.includes('visa')) return { light: 'from-blue-600 to-cyan-600', dark: 'from-blue-900 to-cyan-900', icon: 'https://img.icons8.com/color/48/visa.png' };
      if (b.includes('master')) return { light: 'from-orange-500 to-red-500', dark: 'from-orange-900 to-red-900', icon: 'https://img.icons8.com/color/48/mastercard.png' };
      if (b.includes('elo')) return { light: 'from-yellow-500 to-red-500', dark: 'from-yellow-900/50 to-red-900/50', icon: 'https://img.icons8.com/color/48/elo.png' };
      if (b.includes('amex')) return { light: 'from-blue-400 to-blue-600', dark: 'from-slate-800 to-slate-900', icon: 'https://img.icons8.com/color/48/amex.png' };
      return { light: 'from-zinc-600 to-zinc-800', dark: 'from-zinc-800 to-zinc-900', icon: 'https://img.icons8.com/color/48/bank-card-back-side.png' };
  };

  const totalBreakdown = expenseBreakdown.fixed + expenseBreakdown.variable + expenseBreakdown.personal;
  // Prevent division by zero if total is 0
  const breakdownTotalForCalc = totalBreakdown === 0 ? 1 : totalBreakdown;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-8">
        
        {/* Quick Access Modules */}
        <section>
            <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4">Acesso Rápido</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <QuickAction 
                    icon={<Wallet />} 
                    label="Contas" 
                    color="text-blue-500 dark:text-blue-400" 
                    bg="bg-blue-50 dark:bg-blue-500/10" 
                    border="border-blue-100 dark:border-blue-500/20" 
                    onClick={onOpenAccounts}
                />
                <QuickAction 
                    icon={<ArrowUpCircle />} 
                    label="Entradas" 
                    color="text-emerald-500 dark:text-emerald-400" 
                    bg="bg-emerald-50 dark:bg-emerald-500/10" 
                    border="border-emerald-100 dark:border-emerald-500/20" 
                    onClick={onOpenIncomes}
                />
                <QuickAction 
                    icon={<Home />} 
                    label="Despesas Fixas" 
                    color="text-amber-500 dark:text-amber-400" 
                    bg="bg-amber-50 dark:bg-amber-500/10" 
                    border="border-amber-100 dark:border-amber-500/20" 
                    onClick={onOpenFixedExpenses}
                />
                <QuickAction 
                    icon={<ShoppingCart />} 
                    label="Despesas Variáveis" 
                    color="text-pink-500 dark:text-pink-400" 
                    bg="bg-pink-50 dark:bg-pink-500/10" 
                    border="border-pink-100 dark:border-pink-500/20" 
                    onClick={onOpenVariableExpenses}
                />
                <QuickAction 
                    icon={<User />} 
                    label="Despesas Pessoais" 
                    color="text-cyan-500 dark:text-cyan-400" 
                    bg="bg-cyan-50 dark:bg-cyan-500/10" 
                    border="border-cyan-100 dark:border-cyan-500/20" 
                    onClick={onOpenPersonalExpenses}
                />
                <QuickAction 
                    icon={<TrendingUp />} 
                    label="Rendimentos" 
                    color="text-violet-500 dark:text-violet-400" 
                    bg="bg-violet-50 dark:bg-violet-500/10" 
                    border="border-violet-100 dark:border-violet-500/20"
                    onClick={onOpenYields} 
                />
                <QuickAction icon={<CreditCard />} label="Faturas" color="text-rose-500 dark:text-rose-400" bg="bg-rose-50 dark:bg-rose-500/10" border="border-rose-100 dark:border-rose-500/20" />
                <QuickAction icon={<BarChart3 />} label="Relatórios" color="text-zinc-500 dark:text-zinc-400" bg="bg-zinc-100 dark:bg-zinc-500/10" border="border-zinc-200 dark:border-zinc-500/20" />
            </div>
        </section>

        {/* Financial X-Ray (Summary) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Balance Card */}
            <div className="md:col-span-1 bg-white dark:bg-gradient-to-br dark:from-[#1a1a1a] dark:to-[#111111] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 relative overflow-hidden group shadow-sm transition-colors duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-indigo-500/10 dark:group-hover:bg-indigo-500/20"></div>
                
                <div className="flex items-center justify-between mb-6 relative z-10">
                    <span className="text-zinc-500 dark:text-zinc-400 text-sm font-medium flex items-center gap-2">
                        <Wallet size={16} /> Saldo Atual
                    </span>
                    <span className="text-xs font-semibold bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-1 rounded-full border dark:border-emerald-500/20">
                        +12% vs Nov
                    </span>
                </div>
                
                <div className="relative z-10">
                     <h3 className={`text-4xl font-bold tracking-tight mb-1 ${financialData.balance < 0 ? 'text-red-500' : 'text-zinc-900 dark:text-white'}`}>
                        R$ {financialData.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                     </h3>
                     <p className="text-sm text-zinc-500">Disponível em contas</p>
                </div>
            </div>

            {/* Income & Expense Breakdown */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <SummaryCard 
                    title="Entradas do Mês" 
                    value={financialData.income} 
                    icon={<ArrowUpCircle size={20} />}
                    colorClass="text-emerald-600 dark:text-emerald-400"
                    bgClass="bg-white dark:bg-[#151517]"
                    subtext="R$ 1.200,00 a receber"
                 />
                 <SummaryCard 
                    title="Saídas do Mês" 
                    value={financialData.expenses} 
                    icon={<ArrowDownCircle size={20} />}
                    colorClass="text-rose-600 dark:text-rose-400"
                    bgClass="bg-white dark:bg-[#151517]"
                    subtext={`R$ ${financialData.pending.toLocaleString('pt-BR', {minimumFractionDigits: 2})} pendentes`}
                    isExpense
                 />
            </div>
        </section>

        {/* Credit Cards Section */}
        <section>
             <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <CreditCard className="text-purple-600 dark:text-purple-500" size={20} />
                    Faturas dos Cartões
                </h2>
                <button className="text-xs text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-white transition-colors">Ver todos</button>
            </div>

            {creditCards.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {creditCards.map((card, idx) => {
                        const style = getCardStyle(card.name); // Using Name to detect 'Sicredi' or 'Nubank' if brand is not set perfectly
                        return (
                            <div key={card.id} className={`rounded-2xl p-6 bg-gradient-to-r ${style.light} dark:${style.dark} border border-white/5 relative overflow-hidden shadow-xl shadow-indigo-900/5 dark:shadow-none`}>
                                <div className="absolute top-0 left-0 w-full h-full opacity-10 dark:opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                                
                                <div className="relative z-10 flex flex-col h-full justify-between">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg text-white mb-1">{card.name}</h3>
                                            <p className="text-xs text-white/70 font-medium">Limite: {card.limit ? `R$ ${card.limit.toLocaleString('pt-BR')}` : 'Não informado'}</p>
                                        </div>
                                        <div className="bg-white/20 backdrop-blur-md p-2 rounded-lg">
                                            <img src={style.icon} className="w-8 h-8 opacity-90" alt="Card Brand" />
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <div className="flex justify-between items-end mb-4">
                                            <div>
                                                <p className="text-xs text-white/80 mb-1 uppercase tracking-wider">Fatura Atual</p>
                                                <div className="text-2xl font-bold text-white">
                                                    R$ 0,00
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-white/80 mb-1">Vence em</p>
                                                <p className="text-sm font-bold text-white bg-white/20 px-3 py-1 rounded-md backdrop-blur-sm">
                                                    Dia {card.dueDay}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="pt-4 border-t border-white/20 flex justify-between items-center">
                                            <span className={`text-xs font-semibold px-2 py-1 rounded bg-blue-500/20 text-white`}>
                                                Fatura Aberta
                                            </span>
                                            <button className="flex items-center gap-2 text-xs font-semibold text-white hover:bg-white/20 px-3 py-2 rounded-lg transition-colors">
                                                Ver Fatura <Eye size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white dark:bg-[#151517] rounded-2xl p-10 text-center border border-zinc-200 dark:border-zinc-800 border-dashed">
                    <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400">
                        <CreditCard size={32} />
                    </div>
                    <h3 className="text-zinc-900 dark:text-white font-bold mb-1">Nenhum cartão cadastrado</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Adicione seus cartões de crédito nas configurações.</p>
                </div>
            )}
        </section>

        {/* Categorized Expense Breakdown - REAL DATA */}
        <section className="bg-white dark:bg-[#151517] rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors duration-300">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">Para onde foi seu dinheiro?</h2>
            
            <div className="space-y-4">
                <ExpenseCategoryRow 
                    label="Despesas Fixas" 
                    amount={expenseBreakdown.fixed} 
                    total={breakdownTotalForCalc} 
                    color="bg-amber-500" 
                    icon={<Home size={16} className="text-amber-500" />}
                />
                <ExpenseCategoryRow 
                    label="Despesas Variáveis" 
                    amount={expenseBreakdown.variable} 
                    total={breakdownTotalForCalc} 
                    color="bg-pink-500" 
                    icon={<ShoppingCart size={16} className="text-pink-500" />}
                />
                <ExpenseCategoryRow 
                    label="Despesas Pessoais" 
                    amount={expenseBreakdown.personal} 
                    total={breakdownTotalForCalc} 
                    color="bg-cyan-500" 
                    icon={<User size={16} className="text-cyan-500" />}
                />
            </div>
        </section>
    </div>
  );
};

// --- Subcomponents ---

const QuickAction: React.FC<{ icon: React.ReactNode, label: string, color: string, bg: string, border: string, onClick?: () => void }> = ({ icon, label, color, bg, border, onClick }) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center justify-center p-4 rounded-xl border bg-white dark:bg-[#1a1a1a] hover:bg-gray-50 dark:hover:bg-[#202022] transition-all group active:scale-95 ${border} shadow-sm dark:shadow-none h-full`}
    >
        <div className={`p-3 rounded-full mb-3 ${bg} ${color} group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white text-center">{label}</span>
    </button>
);

const SummaryCard: React.FC<{ 
    title: string, 
    value: number, 
    icon: React.ReactNode, 
    colorClass: string,
    bgClass: string,
    subtext?: string,
    isExpense?: boolean
}> = ({ title, value, icon, colorClass, bgClass, subtext, isExpense }) => (
    <div className={`${bgClass} rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between shadow-sm transition-colors duration-300`}>
        <div className="flex justify-between items-start mb-4">
            <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400">
                {icon}
            </div>
            {subtext && (
                 <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 bg-zinc-100 dark:bg-zinc-800/50 px-2 py-1 rounded">
                    Mês Atual
                 </span>
            )}
        </div>
        <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mb-1">{title}</p>
            <h3 className={`text-2xl font-bold ${colorClass}`}>
                {isExpense ? '-' : '+'} R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
            {subtext && (
                <p className="text-xs text-zinc-500 mt-2 font-medium flex items-center gap-1">
                    <Calendar size={12} />
                    {subtext}
                </p>
            )}
        </div>
    </div>
);

const ExpenseCategoryRow: React.FC<{ label: string, amount: number, total: number, color: string, icon: React.ReactNode }> = ({ label, amount, total, color, icon }) => {
    const percentage = total === 0 ? 0 : Math.round((amount / total) * 100);
    
    return (
        <div>
            <div className="flex justify-between items-end mb-2">
                <div className="flex items-center gap-2">
                    <div className="bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-md transition-colors">
                        {icon}
                    </div>
                    <span className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">{label}</span>
                </div>
                <div className="text-right">
                    <span className="text-sm font-bold text-zinc-900 dark:text-white block">R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    <span className="text-xs text-zinc-500">{percentage}% do total</span>
                </div>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 transition-colors">
                <div 
                    className={`h-2 rounded-full ${color}`} 
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
}

export default Dashboard;
