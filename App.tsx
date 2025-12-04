
import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import AccountsView from './components/AccountsView';
// VariableExpensesView replaced by generic ExpensesView
import ExpensesView from './components/ExpensesView';
import IncomesView from './components/IncomesView';
import YieldsView from './components/YieldsView'; // New Import
import GlobalHeader from './components/GlobalHeader';
import CompanyDetailsView from './components/CompanyDetailsView';
import CompanySetup from './components/CompanySetup';
import { ViewState, Role, CompanyInfo, Account, CreditCard, Expense, ExpenseType, Income } from './types';
import { DEFAULT_COMPANY_INFO, DEFAULT_ACCOUNTS, DEFAULT_ACCOUNT_TYPES, DEFAULT_INCOME_CATEGORIES } from './constants';
import { api } from './services/api';

const App: React.FC = () => {
  
  // --- 1. Load Persisted Data ---

  const loadCompanyInfo = (): CompanyInfo => {
    try {
        const saved = localStorage.getItem('meumei_company_info');
        if (saved && saved !== 'undefined' && saved !== 'null') {
            const parsed = JSON.parse(saved);
            return { ...DEFAULT_COMPANY_INFO, ...parsed };
        }
        return DEFAULT_COMPANY_INFO;
    } catch (e) {
        return DEFAULT_COMPANY_INFO;
    }
  };

  const loadSession = () => {
      try {
          const saved = localStorage.getItem('meumei_active_session');
          return saved ? JSON.parse(saved) : null;
      } catch (e) {
          return null;
      }
  };

  // Load initial data
  const initialCompanyInfo = loadCompanyInfo();
  const initialSession = loadSession();

  // --- 2. Initialize State ---

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(initialCompanyInfo);
  const [username, setUsername] = useState(initialSession?.username || '');
  const [userRole, setUserRole] = useState<Role>(initialSession?.role || 'user');

  // Determine initial view based on session and configuration
  const [currentView, setCurrentView] = useState<ViewState>(() => {
      if (initialSession) {
          if (initialSession.role === 'admin' && !initialCompanyInfo.isConfigured) {
              return ViewState.COMPANY_SETUP;
          }
          return ViewState.DASHBOARD;
      }
      return ViewState.LOGIN;
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    try {
        const saved = localStorage.getItem('meumei_accounts');
        // NOTE: For development/demo purposes, we want to ensure the NEW default accounts are loaded
        // if the user has the old "default" accounts. In production, we wouldn't overwrite user data this easily.
        // For now, if "MP - Nati" isn't present, we merge defaults.
        const parsed = saved ? JSON.parse(saved) : DEFAULT_ACCOUNTS;
        const hasNati = parsed.some((a: Account) => a.id === 'acc_mp_nati');
        
        if (!hasNati && !saved) {
            return DEFAULT_ACCOUNTS;
        }
        // Return parsed saved data (or defaults if nothing saved)
        return parsed.length > 0 ? parsed : DEFAULT_ACCOUNTS;
    } catch (e) {
        return DEFAULT_ACCOUNTS;
    }
  });

  const [accountTypes, setAccountTypes] = useState<string[]>(() => {
    try {
        const saved = localStorage.getItem('meumei_account_types');
        return saved ? JSON.parse(saved) : DEFAULT_ACCOUNT_TYPES;
    } catch (e) {
        return DEFAULT_ACCOUNT_TYPES;
    }
  });

  const [creditCards, setCreditCards] = useState<CreditCard[]>(() => {
      try {
          const saved = localStorage.getItem('meumei_credit_cards');
          return saved ? JSON.parse(saved) : [];
      } catch (e) {
          return [];
      }
  });

  // EXPENSES STATE with Migration for old data (missing 'type')
  const [expenses, setExpenses] = useState<Expense[]>(() => {
      try {
          const saved = localStorage.getItem('meumei_expenses');
          if (saved) {
              const parsed = JSON.parse(saved);
              // Migration: if type is missing, assume 'variable'
              return parsed.map((e: any) => ({
                  ...e,
                  type: e.type || 'variable'
              }));
          }
          return [];
      } catch (e) {
          return [];
      }
  });

  // INCOMES STATE
  const [incomes, setIncomes] = useState<Income[]>(() => {
      try {
          const saved = localStorage.getItem('meumei_incomes');
          return saved ? JSON.parse(saved) : [];
      } catch (e) {
          return [];
      }
  });

  // INCOME CATEGORIES STATE
  const [incomeCategories, setIncomeCategories] = useState<string[]>(() => {
      try {
          const saved = localStorage.getItem('meumei_income_categories');
          return saved ? JSON.parse(saved) : DEFAULT_INCOME_CATEGORIES;
      } catch (e) {
          return DEFAULT_INCOME_CATEGORIES;
      }
  });

  const [viewDate, setViewDate] = useState(new Date());
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // --- 3. Persistence Effects ---

  useEffect(() => {
    if (companyInfo) {
        localStorage.setItem('meumei_company_info', JSON.stringify(companyInfo));
    }
  }, [companyInfo]);

  useEffect(() => {
      localStorage.setItem('meumei_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
      localStorage.setItem('meumei_account_types', JSON.stringify(accountTypes));
  }, [accountTypes]);

  useEffect(() => {
      localStorage.setItem('meumei_credit_cards', JSON.stringify(creditCards));
  }, [creditCards]);

  useEffect(() => {
      localStorage.setItem('meumei_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
      localStorage.setItem('meumei_incomes', JSON.stringify(incomes));
  }, [incomes]);

  useEffect(() => {
      localStorage.setItem('meumei_income_categories', JSON.stringify(incomeCategories));
  }, [incomeCategories]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(theme);
  }, [theme]);

  // --- Date Logic ---
  const [startYearStr, startMonthStr] = companyInfo.startDate.split('-');
  const startYear = parseInt(startYearStr, 10);
  const startMonthIndex = parseInt(startMonthStr, 10) - 1; 
  const limitTotalMonths = (startYear * 12) + startMonthIndex;

  const handleMonthChange = (increment: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + increment, 1);
    const newTotalMonths = (newDate.getFullYear() * 12) + newDate.getMonth();
    
    if (newTotalMonths < limitTotalMonths) {
        return;
    }
    setViewDate(newDate);
  };

  const currentViewTotalMonths = (viewDate.getFullYear() * 12) + viewDate.getMonth();
  const canGoBack = currentViewTotalMonths > limitTotalMonths;

  // --- Financial Calculations ---
  
  const totalAccountsBalance = accounts.reduce((acc, curr) => acc + curr.currentBalance, 0);
  
  // Calculate REAL Income for Dashboard (based on current view month)
  const currentMonthIncomes = incomes.filter(inc => {
      const targetDate = new Date(inc.date);
      return targetDate.getMonth() === viewDate.getMonth() && targetDate.getFullYear() === viewDate.getFullYear();
  });
  const totalIncome = currentMonthIncomes.reduce((acc, curr) => acc + curr.amount, 0);

  // Filter expenses for current month view
  const currentMonthExpenses = expenses.filter(exp => {
      const targetDate = new Date(exp.dueDate); 
      return targetDate.getMonth() === viewDate.getMonth() && targetDate.getFullYear() === viewDate.getFullYear();
  });
  
  const totalExpenses = currentMonthExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const pendingExpenses = currentMonthExpenses.filter(e => e.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0);
  const dashboardBalance = totalAccountsBalance; 

  // Expense Breakdown by Type
  const expenseBreakdown = {
      fixed: currentMonthExpenses.filter(e => e.type === 'fixed').reduce((acc, curr) => acc + curr.amount, 0),
      variable: currentMonthExpenses.filter(e => e.type === 'variable').reduce((acc, curr) => acc + curr.amount, 0),
      personal: currentMonthExpenses.filter(e => e.type === 'personal').reduce((acc, curr) => acc + curr.amount, 0),
  };

  // --- Handlers ---

  const handleLoginSuccess = (data: { username: string; role: Role }) => {
    console.log('Login successful:', data);
    
    // Save session
    localStorage.setItem('meumei_active_session', JSON.stringify(data));
    setUsername(data.username);
    setUserRole(data.role);
    
    // Determine next view
    if (data.role === 'admin' && !companyInfo.isConfigured) {
        console.log('Redirecting to Company Setup');
        setCurrentView(ViewState.COMPANY_SETUP);
    } else {
        console.log('Redirecting to Dashboard');
        setCurrentView(ViewState.DASHBOARD);
    }
    
    // Reset date
    setViewDate(new Date());
  };

  const handleSetupConfirm = (data: { companyName: string; startDate: string }) => {
      const newInfo = { 
          ...companyInfo, 
          name: data.companyName, 
          startDate: data.startDate,
          isConfigured: true 
      };
      setCompanyInfo(newInfo);
      const [year, month] = data.startDate.split('-');
      setViewDate(new Date(parseInt(year), parseInt(month) - 1, 1));
      setCurrentView(ViewState.DASHBOARD);
  };

  const handleLogout = () => {
    localStorage.removeItem('meumei_active_session');
    setUsername('');
    setUserRole('user');
    setCurrentView(ViewState.LOGIN);
  };

  const handleUpdateCompany = (newInfo: CompanyInfo) => setCompanyInfo(newInfo);
  const handleUpdateAccounts = (updatedAccounts: Account[]) => setAccounts(updatedAccounts);
  const handleUpdateAccountTypes = (types: string[]) => setAccountTypes(types);
  const handleUpdateCreditCards = (cards: CreditCard[]) => setCreditCards(cards);
  
  const handleUpdateExpenses = (updatedExpenses: Expense[]) => setExpenses(updatedExpenses);
  const handleUpdateIncomes = (updatedIncomes: Income[]) => setIncomes(updatedIncomes);
  const handleUpdateIncomeCategories = (updatedCategories: string[]) => setIncomeCategories(updatedCategories);

  // --- DELETE HANDLERS (Com Reversão de Saldo) ---

  const handleDeleteExpense = (id: string) => {
      const expenseToDelete = expenses.find(e => e.id === id);
      if (!expenseToDelete) return;

      // Se a despesa estava PAGA e foi debitada de uma CONTA (não cartão de crédito)
      // Precisamos DEVOLVER o dinheiro para o saldo da conta
      if (expenseToDelete.status === 'paid' && expenseToDelete.accountId) {
          const accIndex = accounts.findIndex(a => a.id === expenseToDelete.accountId);
          if (accIndex > -1) {
              const updatedAccounts = [...accounts];
              updatedAccounts[accIndex] = {
                  ...updatedAccounts[accIndex],
                  currentBalance: updatedAccounts[accIndex].currentBalance + expenseToDelete.amount
              };
              setAccounts(updatedAccounts);
          }
      }

      setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const handleDeleteIncome = (id: string) => {
      const incomeToDelete = incomes.find(i => i.id === id);
      if (!incomeToDelete) return;

      // Se a entrada estava RECEBIDA, precisamos SUBTRAIR o dinheiro do saldo da conta
      if (incomeToDelete.status === 'received' && incomeToDelete.accountId) {
          const accIndex = accounts.findIndex(a => a.id === incomeToDelete.accountId);
          if (accIndex > -1) {
              const updatedAccounts = [...accounts];
              updatedAccounts[accIndex] = {
                  ...updatedAccounts[accIndex],
                  currentBalance: updatedAccounts[accIndex].currentBalance - incomeToDelete.amount
              };
              setAccounts(updatedAccounts);
          }
      }

      setIncomes(prev => prev.filter(i => i.id !== id));
  };

  const handleDeleteAccount = (id: string) => {
      // Ao deletar conta, apenas removemos a conta. 
      // Transações antigas ficarão com referência a um ID inexistente, o que o sistema trata visualmente.
      setAccounts(prev => prev.filter(a => a.id !== id));
  };

  const handleSystemReset = () => {
    localStorage.removeItem('meumei_company_info');
    localStorage.removeItem('meumei_users');
    localStorage.removeItem('meumei_accounts');
    localStorage.removeItem('meumei_account_types');
    localStorage.removeItem('meumei_credit_cards');
    localStorage.removeItem('meumei_expenses');
    localStorage.removeItem('meumei_incomes');
    localStorage.removeItem('meumei_income_categories');
    localStorage.removeItem('meumei_active_session');
    
    setCompanyInfo(DEFAULT_COMPANY_INFO);
    setAccounts(DEFAULT_ACCOUNTS);
    setAccountTypes(DEFAULT_ACCOUNT_TYPES);
    setCreditCards([]);
    setExpenses([]);
    setIncomes([]);
    setIncomeCategories(DEFAULT_INCOME_CATEGORIES);
    setUsername('');
    setUserRole('user');
    setCurrentView(ViewState.LOGIN);
    window.location.reload();
  };

  // --- Layout Helper ---
  const renderLayout = (title: string, subtitle: string, content: React.ReactNode) => (
      <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] text-zinc-900 dark:text-white font-inter transition-colors duration-300 pb-20">
          <GlobalHeader 
              companyName={companyInfo.name}
              username={username}
              role={userRole}
              viewDate={viewDate}
              onMonthChange={handleMonthChange}
              canGoBack={canGoBack}
              onOpenSettings={() => setCurrentView(ViewState.SETTINGS)}
              onLogout={handleLogout}
              onCompanyClick={() => setCurrentView(ViewState.COMPANY_DETAILS)}
          />
          {content}
      </div>
  );

  return (
    <>
      {currentView === ViewState.LOGIN && <Login onLoginSuccess={handleLoginSuccess} />}
      {currentView === ViewState.COMPANY_SETUP && <CompanySetup onConfirm={handleSetupConfirm} />}

      {currentView === ViewState.DASHBOARD && renderLayout(
          "Visão Geral",
          `Aqui está seu resumo de ${viewDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
          <Dashboard 
              onOpenAccounts={() => setCurrentView(ViewState.ACCOUNTS)}
              onOpenVariableExpenses={() => setCurrentView(ViewState.VARIABLE_EXPENSES)}
              onOpenFixedExpenses={() => setCurrentView(ViewState.FIXED_EXPENSES)}
              onOpenPersonalExpenses={() => setCurrentView(ViewState.PERSONAL_EXPENSES)}
              onOpenIncomes={() => setCurrentView(ViewState.INCOMES)}
              onOpenYields={() => setCurrentView(ViewState.YIELDS)}
              financialData={{
                  balance: dashboardBalance,
                  income: totalIncome,
                  expenses: totalExpenses,
                  pending: pendingExpenses
              }}
              creditCards={creditCards}
              expenseBreakdown={expenseBreakdown}
          />
      )}

      {currentView === ViewState.ACCOUNTS && renderLayout(
          "Minhas Contas",
          "Gerencie seus saldos e contas bancárias",
          <AccountsView 
             accounts={accounts}
             onUpdateAccounts={handleUpdateAccounts}
             onDeleteAccount={handleDeleteAccount}
             accountTypes={accountTypes}
             onUpdateAccountTypes={handleUpdateAccountTypes}
             onBack={() => setCurrentView(ViewState.DASHBOARD)}
          />
      )}

      {currentView === ViewState.INCOMES && renderLayout(
          "Entradas",
          "Gerencie suas receitas e entradas de valores",
          <IncomesView 
             incomes={incomes}
             onUpdateIncomes={handleUpdateIncomes}
             onDeleteIncome={handleDeleteIncome}
             accounts={accounts}
             onUpdateAccounts={handleUpdateAccounts}
             viewDate={viewDate}
             categories={incomeCategories}
             onUpdateCategories={handleUpdateIncomeCategories}
             onBack={() => setCurrentView(ViewState.DASHBOARD)}
          />
      )}

      {currentView === ViewState.YIELDS && renderLayout(
          "Rendimentos",
          "Acompanhe seus investimentos e aplicações",
          <YieldsView 
             accounts={accounts}
             onUpdateAccounts={handleUpdateAccounts}
             selicRate={companyInfo.selicRate}
             onBack={() => setCurrentView(ViewState.DASHBOARD)}
          />
      )}

      {/* VIEW: VARIABLE EXPENSES */}
      {currentView === ViewState.VARIABLE_EXPENSES && renderLayout(
          "Despesas Variáveis",
          "Gerencie seus gastos variáveis do mês",
          <ExpensesView 
             title="Despesas Variáveis"
             subtitle="Gerencie seus gastos variáveis"
             expenseType="variable"
             themeColor="pink"
             expenses={expenses}
             onUpdateExpenses={handleUpdateExpenses}
             onDeleteExpense={handleDeleteExpense}
             accounts={accounts}
             onUpdateAccounts={handleUpdateAccounts}
             creditCards={creditCards}
             viewDate={viewDate}
             onBack={() => setCurrentView(ViewState.DASHBOARD)}
          />
      )}

      {/* VIEW: FIXED EXPENSES */}
      {currentView === ViewState.FIXED_EXPENSES && renderLayout(
          "Despesas Fixas",
          "Contas recorrentes e fixas",
          <ExpensesView 
             title="Despesas Fixas"
             subtitle="Gerencie suas contas fixas"
             expenseType="fixed"
             themeColor="amber"
             expenses={expenses}
             onUpdateExpenses={handleUpdateExpenses}
             onDeleteExpense={handleDeleteExpense}
             accounts={accounts}
             onUpdateAccounts={handleUpdateAccounts}
             creditCards={creditCards}
             viewDate={viewDate}
             onBack={() => setCurrentView(ViewState.DASHBOARD)}
          />
      )}

      {/* VIEW: PERSONAL EXPENSES */}
      {currentView === ViewState.PERSONAL_EXPENSES && renderLayout(
          "Despesas Pessoais",
          "Gastos pessoais e retiradas",
          <ExpensesView 
             title="Despesas Pessoais"
             subtitle="Controle suas retiradas pessoais"
             expenseType="personal"
             themeColor="cyan"
             expenses={expenses}
             onUpdateExpenses={handleUpdateExpenses}
             onDeleteExpense={handleDeleteExpense}
             accounts={accounts}
             onUpdateAccounts={handleUpdateAccounts}
             creditCards={creditCards}
             viewDate={viewDate}
             onBack={() => setCurrentView(ViewState.DASHBOARD)}
          />
      )}

      {currentView === ViewState.COMPANY_DETAILS && renderLayout(
          "Dados da Empresa",
          "Informações cadastrais",
          <CompanyDetailsView
              company={companyInfo}
              onBack={() => setCurrentView(ViewState.DASHBOARD)}
          />
      )}

      {currentView === ViewState.SETTINGS && (
        <Settings 
          onBack={() => setCurrentView(ViewState.DASHBOARD)}
          currentTheme={theme}
          onThemeChange={setTheme}
          isAdmin={userRole === 'admin'}
          companyInfo={companyInfo}
          onUpdateCompany={handleUpdateCompany}
          onSystemReset={handleSystemReset}
          creditCards={creditCards}
          onUpdateCreditCards={handleUpdateCreditCards}
        />
      )}
    </>
  );
};

export default App;
