
import React, { useMemo } from 'react';
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
  Plus,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Tag,
  PieChart,
  Cat,
  Lock
} from 'lucide-react';
import { CreditCard as CreditCardType, Expense, UserPermissions } from '../types';

interface FinancialData {
    balance: number;
    income: number;
    expenses: number;
    pendingExpenses: number;
    pendingIncome: number;
    annualMeiRevenue?: number; 
}

interface ExpenseBreakdown {
    fixed: number;
    variable: number;
    personal: number;
}

interface CategoryBreakdownItem {
    name: string;
    value: number;
}

interface DashboardProps {
  onOpenAccounts: () => void;
  onOpenVariableExpenses: () => void;
  onOpenFixedExpenses?: () => void;
  onOpenPersonalExpenses?: () => void;
  onOpenIncomes?: () => void;
  onOpenYields?: () => void; 
  onOpenInvoices?: () => void;
  onOpenReports?: () => void; // New Prop
  financialData: FinancialData;
  creditCards: CreditCardType[];
  expenseBreakdown?: ExpenseBreakdown;
  categoryBreakdown?: CategoryBreakdownItem[];
  expenses: Expense[];
  viewDate: Date;
  permissions?: UserPermissions;
}

const MEI_LIMIT = 81000;

const Dashboard: React.FC<DashboardProps> = ({ 
    onOpenAccounts, 
    onOpenVariableExpenses,
    onOpenFixedExpenses,
    onOpenPersonalExpenses,
    onOpenIncomes,
    onOpenYields,
    onOpenInvoices,
    onOpenReports,
    financialData,
    creditCards,
    expenseBreakdown = { fixed: 0, variable: 0, personal: 0 },
    categoryBreakdown = [],
    expenses,
    viewDate,
    permissions
}) => {
  
  // Default to full access if permissions prop is missing (e.g. legacy admin)
  // Or handle safe defaults. Assuming passed correctly from App.tsx
  const canViewBalances = permissions?.canViewBalances ?? true;
  const canViewMeiLimit = permissions?.canViewMeiLimit ?? true;
  const canViewInvoices = permissions?.canViewInvoices ?? true;
  const canViewReports = permissions?.canViewReports ?? true;
  const canManageIncomes = permissions?.canManageIncomes ?? true;
  const canManageExpenses = permissions?.canManageExpenses ?? true;

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
  const breakdownTotalForCalc = totalBreakdown === 0 ? 1 : totalBreakdown;

  // --- MEI Logic ---
  const meiRevenue = financialData.annualMeiRevenue || 0;
  const rawPercentage = (meiRevenue / MEI_LIMIT) * 100;
  const displayPercentage = Math.min(rawPercentage, 100);
  const meiRemaining = Math.max(MEI_LIMIT - meiRevenue, 0);
  const meiExcess = Math.max(meiRevenue - MEI_LIMIT, 0);
  const isWarning = rawPercentage >= 80 && rawPercentage <= 100;
  const isExceeded = rawPercentage > 100;

  // --- Visual Logic for Gamification ---
  const getProgressColor = () => {
      if (isExceeded) return 'bg-red-500';
      if (isWarning) return 'bg-amber-500';
      return 'bg-emerald-500';
  };

  const getLionColor = () => {
      if (isExceeded) return 'text-red-500';
      if (isWarning) return 'text-amber-500';
      return 'text-emerald-500';
  };

  const getLionBorder = () => {
      if (isExceeded) return 'border-red-500';
      if (isWarning) return 'border-amber-500';
      return 'border-emerald-500';
  };

  // --- Category Visualization (BAR CHART LOGIC) ---
  const topCategories = categoryBreakdown.slice(0, 10); // Take top 10
  const maxCategoryValue = topCategories.length > 0 ? topCategories[0].value : 0; // Max value for 100% width

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-8">
        
        {/* Quick Access */}
        <section>
            <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4">Acesso Rápido</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {canViewBalances && (
                    <QuickAction 
                        icon={<Wallet />} 
                        label="Contas Bancárias" 
                        color="text-blue-500 dark:text-blue-400" 
                        bg="bg-blue-50 dark:bg-blue-500/10" 
                        border="border-blue-100 dark:border-blue-500/20" 
                        onClick={onOpenAccounts}
                    />
                )}
                {canManageIncomes && (
                    <QuickAction 
                        icon={<ArrowUpCircle />} 
                        label="Entradas" 
                        color="text-emerald-500 dark:text-emerald-400" 
                        bg="bg-emerald-50 dark:bg-emerald-500/10" 
                        border="border-emerald-100 dark:border-emerald-500/20" 
                        onClick={onOpenIncomes}
                    />
                )}
                {canManageExpenses && (
                    <>
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
                    </>
                )}
                {canViewBalances && (
                    <QuickAction 
                        icon={<TrendingUp />} 
                        label="Rendimentos" 
                        color="text-violet-500 dark:text-violet-400" 
                        bg="bg-violet-50 dark:bg-violet-500/10" 
                        border="border-violet-100 dark:border-violet-500/20"
                        onClick={onOpenYields} 
                    />
                )}
                {canViewInvoices && (
                    <QuickAction 
                        icon={<CreditCard />} 
                        label="Faturas" 
                        color="text-rose-500 dark:text-rose-400" 
                        bg="bg-rose-50 dark:bg-rose-500/10" 
                        border="border-rose-100 dark:border-rose-500/20" 
                        onClick={onOpenInvoices}
                    />
                )}
                {canViewReports && (
                    <QuickAction 
                        icon={<BarChart3 />} 
                        label="Relatórios" 
                        color="text-zinc-500 dark:text-zinc-400" 
                        bg="bg-zinc-100 dark:bg-zinc-500/10" 
                        border="border-zinc-200 dark:border-zinc-500/20" 
                        onClick={onOpenReports}
                    />
                )}
            </div>
        </section>

        {/* MEI Limit Monitor (GAMIFIED) - Conditionally Rendered */}
        {canViewMeiLimit && (
            <section>
                <div className={`bg-white dark:bg-[#151517] rounded-2xl p-6 border ${isExceeded ? 'border-red-200 dark:border-red-900/50' : 'border-zinc-200 dark:border-zinc-800'} shadow-sm relative overflow-visible transition-colors duration-300`}>
                    <div className={`absolute top-0 right-0 p-4 opacity-5 ${isExceeded ? 'text-red-500' : ''}`}>
                        <Building2 size={100} />
                    </div>
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`p-1.5 rounded ${isExceeded ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'}`}>
                                    <Building2 size={18} />
                                </div>
                                <h3 className="font-bold text-zinc-900 dark:text-white">Faturamento Fiscal MEI (PJ)</h3>
                            </div>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-lg">
                                Cuidado para o Leão não te pegar! Mantenha seu faturamento abaixo de 81 mil.
                            </p>
                            
                            {/* GAMIFIED PROGRESS BAR */}
                            <div className="relative h-16 w-full mt-4 mb-4 select-none">
                                {/* Track Line */}
                                <div className="absolute top-1/2 left-0 w-full h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full -translate-y-1/2"></div>

                                {/* Colored Progress Line */}
                                <div 
                                    className={`absolute top-1/2 left-0 h-3 rounded-full -translate-y-1/2 transition-all duration-1000 ${getProgressColor()}`}
                                    style={{ width: `${displayPercentage}%` }}
                                ></div>

                                {/* The Lion (Moving Avatar) */}
                                <div 
                                    className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 z-20 flex flex-col items-center"
                                    style={{ left: `calc(${displayPercentage}% - 20px)` }} // Center the 40px wrapper
                                >
                                    <div className={`w-10 h-10 bg-white dark:bg-[#1a1a1a] rounded-full border-2 ${getLionBorder()} flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform`}>
                                        <Cat size={20} className={getLionColor()} strokeWidth={2.5} />
                                    </div>
                                    <div className={`mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm ${isExceeded ? 'bg-red-100 text-red-600' : isWarning ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                        {rawPercentage.toFixed(1)}%
                                    </div>
                                </div>

                                {/* The Entrepreneur (Goal/Limit) */}
                                <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/3 z-10 flex flex-col items-center">
                                    <div className={`w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-full border-2 border-zinc-300 dark:border-zinc-700 flex items-center justify-center shadow-sm ${isExceeded ? 'opacity-50 grayscale' : ''}`}>
                                        <User size={20} className="text-zinc-500 dark:text-zinc-400" />
                                    </div>
                                    <div className="mt-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                                        81k
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 mt-4">
                                <div className="flex justify-between text-xs font-medium">
                                    <span className={`${isExceeded ? 'text-red-600 font-bold' : isWarning ? 'text-amber-600 font-bold' : 'text-indigo-600 dark:text-indigo-400'}`}>
                                        Faturado: R$ {meiRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                    {!isExceeded && (
                                        <span className="text-emerald-600 dark:text-emerald-400">
                                            Restam R$ {meiRemaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Status & Alerts Box */}
                        {isExceeded ? (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 p-4 rounded-xl flex gap-3 max-w-md animate-pulse">
                                <AlertTriangle className="text-red-600 shrink-0" size={24} />
                                <div>
                                    <p className="text-sm font-bold text-red-700 dark:text-red-400">LIMITE ULTRAPASSADO!</p>
                                    <p className="text-xs text-red-600 dark:text-red-300 mt-1 leading-relaxed">
                                        O Leão te pegou! Você faturou <strong>R$ {meiExcess.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> a mais que o limite. Consulte seu contador.
                                    </p>
                                </div>
                            </div>
                        ) : isWarning ? (
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/50 p-4 rounded-xl flex gap-3 max-w-md">
                                <AlertTriangle className="text-amber-500 shrink-0" size={24} />
                                <div>
                                    <p className="text-sm font-bold text-amber-700 dark:text-amber-400">O Leão está perto!</p>
                                    <p className="text-xs text-amber-600 dark:text-amber-300 mt-1 leading-relaxed">
                                        Atenção! Você já utilizou <strong>{rawPercentage.toFixed(1)}%</strong> do limite anual.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center gap-3 px-6 py-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl">
                                <CheckCircle2 className="text-emerald-500" size={24} />
                                <div>
                                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Distância Segura</p>
                                    <p className="text-xs text-emerald-600 dark:text-emerald-500/70">Faturamento dentro do limite</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        )}

        {/* Financial X-Ray */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Balance Card - Conditional */}
            {canViewBalances ? (
                <div className="bg-white dark:bg-[#151517] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 relative overflow-hidden group shadow-sm transition-all duration-300 hover:border-zinc-300 dark:hover:border-zinc-700">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400">
                            <Wallet size={20} />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mb-1">Saldo Atual</p>
                        <h3 className={`text-3xl font-bold tracking-tight mb-2 ${financialData.balance < 0 ? 'text-red-500' : 'text-zinc-900 dark:text-white'}`}>
                            R$ {financialData.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </h3>
                        <p className="text-xs text-zinc-500 font-medium flex items-center gap-1">
                            <Calendar size={12} />
                            Disponível em contas
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-6 border border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-zinc-400">
                    <Lock size={24} className="mb-2" />
                    <p className="text-xs">Saldo Oculto</p>
                </div>
            )}

            {canManageIncomes && (
                <SummaryCard 
                title="Entradas do Mês" 
                value={financialData.income} 
                icon={<ArrowUpCircle size={20} />}
                colorClass="text-emerald-600 dark:text-emerald-400"
                bgClass="bg-white dark:bg-[#151517]"
                subtext={`R$ ${financialData.pendingIncome.toLocaleString('pt-BR', {minimumFractionDigits: 2})} a receber`}
                />
            )}

            {canManageExpenses && (
                <SummaryCard 
                title="Saídas do Mês" 
                value={financialData.expenses} 
                icon={<ArrowDownCircle size={20} />}
                colorClass="text-rose-600 dark:text-rose-400"
                bgClass="bg-white dark:bg-[#151517]"
                subtext={`R$ ${financialData.pendingExpenses.toLocaleString('pt-BR', {minimumFractionDigits: 2})} pendentes`}
                isExpense
                />
            )}
        </section>

        {/* Credit Cards Section */}
        {canViewInvoices && (
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                        <CreditCard className="text-purple-600 dark:text-purple-500" size={20} />
                        Faturas dos Cartões
                    </h2>
                    <button onClick={onOpenInvoices} className="text-xs text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-white transition-colors">
                        Gerenciar Faturas
                    </button>
                </div>

                {creditCards.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {creditCards.map((card, idx) => {
                            const style = getCardStyle(card.name); 
                            
                            // ... (Card calculation logic remains the same) ...
                            const closingDay = card.closingDay;
                            
                            const invoiceTotal = expenses.reduce((sum, exp) => {
                                if (exp.cardId !== card.id || exp.paymentMethod !== 'Crédito' || exp.status === 'paid') return sum;
                                
                                const purchaseDate = new Date(exp.date + 'T12:00:00');
                                const pDay = purchaseDate.getDate();
                                const pMonth = purchaseDate.getMonth();
                                const pYear = purchaseDate.getFullYear();
                                const vMonth = viewDate.getMonth();
                                const vYear = viewDate.getFullYear();
                                const isSameMonthBeforeClose = (pMonth === vMonth && pYear === vYear && pDay < closingDay);
                                const prevDate = new Date(viewDate);
                                prevDate.setMonth(prevDate.getMonth() - 1);
                                const prevMonthIndex = prevDate.getMonth();
                                const prevYearIndex = prevDate.getFullYear();
                                const isPrevMonthAfterClose = (pMonth === prevMonthIndex && pYear === prevYearIndex && pDay >= closingDay);
                                
                                if (isSameMonthBeforeClose || isPrevMonthAfterClose) {
                                    return sum + exp.amount;
                                }
                                return sum;
                            }, 0);

                            const dueDateObj = new Date(viewDate.getFullYear(), viewDate.getMonth(), card.dueDay);
                            if (card.dueDay < card.closingDay) {
                                dueDateObj.setMonth(dueDateObj.getMonth() + 1);
                            }
                            const formattedDueDate = dueDateObj.toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'});

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
                                                    <p className="text-xs text-white/80 mb-1 uppercase tracking-wider">Fatura Atual (Ref. {viewDate.toLocaleDateString('pt-BR', {month: 'long'})})</p>
                                                    <div className="text-2xl font-bold text-white">
                                                        R$ {invoiceTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-white/80 mb-1">Vence em</p>
                                                    <p className="text-sm font-bold text-white bg-white/20 px-3 py-1 rounded-md backdrop-blur-sm">
                                                        {formattedDueDate}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="pt-4 border-t border-white/20 flex justify-between items-center">
                                                <span className={`text-xs font-semibold px-2 py-1 rounded bg-blue-500/20 text-white`}>
                                                    Fatura Aberta
                                                </span>
                                                <button 
                                                    onClick={onOpenInvoices}
                                                    className="flex items-center gap-2 text-xs font-semibold text-white hover:bg-white/20 px-3 py-2 rounded-lg transition-colors"
                                                >
                                                    Ver Detalhes <Eye size={14} />
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
        )}

        {/* Categorized Expense Breakdown - BAR CHART */}
        {canManageExpenses && (
            <section className="bg-white dark:bg-[#151517] rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors duration-300">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
                    <PieChart size={20} className="text-indigo-500" />
                    Onde foi parar seu dinheiro? <span className="text-xs font-normal text-zinc-500">(Top 10 Categorias)</span>
                </h2>
                
                {topCategories.length > 0 ? (
                    <div className="w-full space-y-5">
                        {topCategories.map((item, index) => {
                            const percentage = breakdownTotalForCalc > 0 ? (item.value / breakdownTotalForCalc) * 100 : 0;
                            // Width relative to the max item for visual scaling (the largest bar is 100% width of the chart area)
                            const widthPercentage = maxCategoryValue > 0 ? (item.value / maxCategoryValue) * 100 : 0;
                            
                            return (
                                <div key={index} className="relative group">
                                    <div className="flex justify-between items-end mb-1.5 relative z-10">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 w-6 text-center">{index + 1}</span>
                                            <span className="text-sm font-semibold text-zinc-800 dark:text-white">{item.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-bold text-zinc-900 dark:text-white block">
                                                R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="w-full bg-zinc-100 dark:bg-zinc-800/50 rounded-lg h-3 overflow-hidden relative">
                                        <div 
                                            className="h-full rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 relative group-hover:from-indigo-400 group-hover:to-purple-500 transition-all duration-500"
                                            style={{ width: `${widthPercentage}%` }}
                                        >
                                            {/* Glow effect on hover */}
                                            <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/20 blur-[2px]"></div>
                                        </div>
                                    </div>
                                    <div className="mt-1 text-right">
                                        <span className="text-[10px] text-zinc-400 font-medium">{percentage.toFixed(1)}% do total</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
                        <PieChart size={40} className="mb-3 opacity-20" />
                        <p className="text-sm">Nenhuma despesa registrada neste mês.</p>
                    </div>
                )}
            </section>
        )}
    </div>
  );
};

// ... existing subcomponents ...
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
    <div className={`${bgClass} rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between shadow-sm transition-all duration-300 hover:border-zinc-300 dark:hover:border-zinc-700`}>
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
            {/* Standardized Font Size: text-3xl */}
            <h3 className={`text-3xl font-bold tracking-tight mb-2 ${colorClass}`}>
                {isExpense ? '-' : '+'} R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
            {subtext && (
                <p className="text-xs text-zinc-500 font-medium flex items-center gap-1">
                    <Calendar size={12} />
                    {subtext}
                </p>
            )}
        </div>
    </div>
);

export default Dashboard;
