
import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import AccountsView from './components/AccountsView';
// VariableExpensesView replaced by generic ExpensesView
import ExpensesView from './components/ExpensesView';
import IncomesView from './components/IncomesView';
import YieldsView from './components/YieldsView'; 
import InvoicesView from './components/InvoicesView'; 
import ReportsView from './components/ReportsView'; // New Import
import GlobalHeader from './components/GlobalHeader';
import CompanyDetailsView from './components/CompanyDetailsView';
import { ViewState, Role, CompanyInfo, Account, CreditCard, Expense, ExpenseType, Income, User } from './types';
import { DEFAULT_COMPANY_INFO, DEFAULT_ACCOUNTS, DEFAULT_ACCOUNT_TYPES, DEFAULT_INCOME_CATEGORIES, DEFAULT_EXPENSE_CATEGORIES } from './constants';
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

  const loadSession = (): User | null => {
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
  
  // CURRENT USER STATE
  const [currentUser, setCurrentUser] = useState<User | null>(initialSession);

  // Determine initial view based on session
  const [currentView, setCurrentView] = useState<ViewState>(() => {
      if (initialSession) {
          return ViewState.DASHBOARD;
      }
      return ViewState.LOGIN;
  });

  // ARCHITECTURE NOTE:
  // Data loading here retrieves ALL data in local storage.
  // In a Multi-tenant logic, this equates to loading all data for the valid License Key on this device.
  // The LicenseID is stored in CompanyInfo.

  const [accounts, setAccounts] = useState<Account[]>(() => {
    try {
        const saved = localStorage.getItem('meumei_accounts');
        if (saved) {
            const parsed = JSON.parse(saved);
            const hasLegacyDemo = parsed.some((a: Account) => a.id === 'acc_mp_nati' || a.id === 'acc_nubank');
            if (hasLegacyDemo) {
                return DEFAULT_ACCOUNTS; // Returns []
            }
            return parsed;
        }
        return DEFAULT_ACCOUNTS;
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
                  type: e.type || 'variable',
                  taxStatus: e.taxStatus || (e.type === 'personal' ? 'PF' : 'PJ'), // Auto-migrate old expenses
                  licenseId: e.licenseId || initialCompanyInfo.licenseId // Ensure License Binding
              }));
          }
          return [];
      } catch (e) {
          return [];
      }
  });

  // EXPENSE CATEGORIES STATE
  const [expenseCategories, setExpenseCategories] = useState<string[]>(() => {
      try {
          const saved = localStorage.getItem('meumei_expense_categories');
          return saved ? JSON.parse(saved) : DEFAULT_EXPENSE_CATEGORIES;
      } catch (e) {
          return DEFAULT_EXPENSE_CATEGORIES;
      }
  });

  // INCOMES STATE
  const [incomes, setIncomes] = useState<Income[]>(() => {
      try {
          const saved = localStorage.getItem('meumei_incomes');
          if (saved) {
              const parsed = JSON.parse(saved);
              return parsed.map((i: any) => ({
                  ...i,
                  taxStatus: i.taxStatus || 'PJ', // Default old incomes to PJ
                  licenseId: i.licenseId || initialCompanyInfo.licenseId // Ensure License Binding
              }));
          }
          return [];
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

  // Date Logic - Use company start date or default to current date if not set correctly
  const [viewDate, setViewDate] = useState(() => {
    if(companyInfo.startDate) {
        const [year, month] = companyInfo.startDate.split('-');
        return new Date(parseInt(year), parseInt(month) - 1, 1);
    }
    return new Date();
  });

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
      localStorage.setItem('meumei_expense_categories', JSON.stringify(expenseCategories));
  }, [expenseCategories]);

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
  const pendingIncome = currentMonthIncomes.filter(i => i.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0);

  // Filter expenses for current month view
  const currentMonthExpenses = expenses.filter(exp => {
      const targetDate = new Date(exp.dueDate); 
      return targetDate.getMonth() === viewDate.getMonth() && targetDate.getFullYear() === viewDate.getFullYear();
  });
  
  const totalExpenses = currentMonthExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const pendingExpenses = currentMonthExpenses.filter(e => e.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0);
  const dashboardBalance = totalAccountsBalance; 

  // Expense Breakdown by Type (Keep for logic if needed, but we focus on Category now)
  const expenseBreakdown = {
      fixed: currentMonthExpenses.filter(e => e.type === 'fixed').reduce((acc, curr) => acc + curr.amount, 0),
      variable: currentMonthExpenses.filter(e => e.type === 'variable').reduce((acc, curr) => acc + curr.amount, 0),
      personal: currentMonthExpenses.filter(e => e.type === 'personal').reduce((acc, curr) => acc + curr.amount, 0),
  };

  // --- NEW: Expense Breakdown by Category ---
  const expenseCategoryMap = currentMonthExpenses.reduce((acc, curr) => {
      const cat = curr.category || 'Sem Categoria';
      acc[cat] = (acc[cat] || 0) + curr.amount;
      return acc;
  }, {} as Record<string, number>);

  // Convert to array and sort by amount desc
  const categoryBreakdown = Object.entries(expenseCategoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

  // --- MEI REVENUE CALCULATION ---
  // Calculates total revenue for the current year where taxStatus is 'PJ'
  const annualMeiRevenue = incomes
      .filter(inc => {
          const incDate = new Date(inc.date);
          const isSameYear = incDate.getFullYear() === viewDate.getFullYear();
          const isPJ = inc.taxStatus !== 'PF'; // Default to PJ if undefined (legacy data) or explicitly PJ
          return isSameYear && isPJ;
      })
      .reduce((acc, curr) => acc + curr.amount, 0);

  // --- Handlers ---

  const handleLoginSuccess = (user: any) => {
    // The Login component passes partial user data, we need to ensure permissions are loaded
    // However, the Login component now loads permissions from localStorage correctly.
    // We expect `user` to have { username, role, name, permissions }
    console.log('Login successful:', user);
    
    // ARCHITECTURE FIX: Reload Company Info to ensure License Key is in memory
    const updatedCompanyInfo = loadCompanyInfo();
    setCompanyInfo(updatedCompanyInfo);

    // Save session
    localStorage.setItem('meumei_active_session', JSON.stringify(user));
    setCurrentUser(user);
    
    // Direct to Dashboard as Setup is now in Settings
    setCurrentView(ViewState.DASHBOARD);
    
    // Reset date view if needed
    if (updatedCompanyInfo.startDate) {
        const [year, month] = updatedCompanyInfo.startDate.split('-');
        setViewDate(new Date(parseInt(year), parseInt(month) - 1, 1));
    } else {
        setViewDate(new Date());
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('meumei_active_session');
    setCurrentUser(null);
    setCurrentView(ViewState.LOGIN);
  };

  const handleUpdateCompany = (newInfo: CompanyInfo) => {
      // ARCHITECTURE FIX: Ensure licenseId is preserved during updates
      const safeInfo = {
          ...newInfo,
          licenseId: newInfo.licenseId || companyInfo.licenseId
      };
      setCompanyInfo(safeInfo);
      
      // Update view date logic if start date changed
      if (newInfo.startDate !== companyInfo.startDate) {
           const [year, month] = newInfo.startDate.split('-');
           setViewDate(new Date(parseInt(year), parseInt(month) - 1, 1));
      }
  };

  const handleUpdateAccounts = (updatedAccounts: Account[]) => {
      // ARCHITECTURE FIX: Inject License ID into accounts
      const boundAccounts = updatedAccounts.map(acc => ({
          ...acc,
          licenseId: acc.licenseId || companyInfo.licenseId
      }));
      setAccounts(boundAccounts);
  };

  const handleUpdateAccountTypes = (types: string[]) => setAccountTypes(types);
  
  const handleUpdateCreditCards = (cards: CreditCard[]) => {
      // ARCHITECTURE FIX: Inject License ID into cards
      const boundCards = cards.map(card => ({
          ...card,
          licenseId: card.licenseId || companyInfo.licenseId
      }));
      setCreditCards(boundCards);
  };
  
  // --- INJECT CREATED BY & LICENSE ID INTO EXPENSES ---
  const handleUpdateExpenses = (updatedExpenses: Expense[]) => {
      const expensesWithAudit = updatedExpenses.map(exp => {
          let modified = { ...exp };
          
          // Inject Audit Trail
          if (!modified.createdBy && currentUser) {
              modified.createdBy = currentUser.name || currentUser.username;
          }
          
          // ARCHITECTURE FIX: Inject License ID (Tenant Binding)
          if (!modified.licenseId && companyInfo.licenseId) {
              modified.licenseId = companyInfo.licenseId;
          }
          
          return modified;
      });
      setExpenses(expensesWithAudit);
  };
  
  const handleUpdateExpenseCategories = (updatedCategories: string[]) => setExpenseCategories(updatedCategories);

  // --- INJECT CREATED BY & LICENSE ID INTO INCOMES ---
  const handleUpdateIncomes = (updatedIncomes: Income[]) => {
      const incomesWithAudit = updatedIncomes.map(inc => {
          let modified = { ...inc };

          // Inject Audit Trail
          if (!modified.createdBy && currentUser) {
              modified.createdBy = currentUser.name || currentUser.username;
          }

          // ARCHITECTURE FIX: Inject License ID (Tenant Binding)
          if (!modified.licenseId && companyInfo.licenseId) {
              modified.licenseId = companyInfo.licenseId;
          }

          return modified;
      });
      setIncomes(incomesWithAudit);
  };
  
  const handleUpdateIncomeCategories = (updatedCategories: string[]) => setIncomeCategories(updatedCategories);

  // --- INVOICE PAYMENT HANDLER ---
  const handlePayInvoice = (expenseIds: string[], sourceAccountId: string, totalAmount: number) => {
    // 1. Debit from Account
    const newAccounts = [...accounts];
    const accIdx = newAccounts.findIndex(a => a.id === sourceAccountId);
    
    if (accIdx > -1) {
        newAccounts[accIdx].currentBalance -= totalAmount;
        // The handleUpdateAccounts will re-inject licenseId if needed
        handleUpdateAccounts(newAccounts); 
    }

    // 2. Mark Expenses as Paid
    const newExpenses = expenses.map(exp => {
        if (expenseIds.includes(exp.id)) {
            return { ...exp, status: 'paid' as const };
        }
        return exp;
    });
    // The handleUpdateExpenses will re-inject licenseId if needed
    handleUpdateExpenses(newExpenses);
  };

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
      setAccounts(prev => prev.filter(a => a.id !== id));
  };

  const handleSystemReset = () => {
    localStorage.removeItem('meumei_company_info');
    localStorage.removeItem('meumei_users');
    localStorage.removeItem('meumei_accounts');
    localStorage.removeItem('meumei_account_types');
    localStorage.removeItem('meumei_credit_cards');
    localStorage.removeItem('meumei_expenses');
    localStorage.removeItem('meumei_expense_categories');
    localStorage.removeItem('meumei_incomes');
    localStorage.removeItem('meumei_income_categories');
    localStorage.removeItem('meumei_active_session');
    
    setCompanyInfo(DEFAULT_COMPANY_INFO);
    setAccounts(DEFAULT_ACCOUNTS);
    setAccountTypes(DEFAULT_ACCOUNT_TYPES);
    setCreditCards([]);
    setExpenses([]);
    setExpenseCategories(DEFAULT_EXPENSE_CATEGORIES);
    setIncomes([]);
    setIncomeCategories(DEFAULT_INCOME_CATEGORIES);
    setCurrentUser(null);
    setCurrentView(ViewState.LOGIN);
    window.location.reload();
  };

  // --- Layout Helper ---
  const renderLayout = (title: string, subtitle: string, content: React.ReactNode) => (
      <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] text-zinc-900 dark:text-white font-inter transition-colors duration-300 pb-20">
          <GlobalHeader 
              companyName={companyInfo.name}
              username={currentUser?.username || ''}
              role={currentUser?.role || 'user'}
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
              onOpenInvoices={() => setCurrentView(ViewState.INVOICES)}
              onOpenReports={() => setCurrentView(ViewState.REPORTS)}
              financialData={{
                  balance: dashboardBalance,
                  income: totalIncome,
                  expenses: totalExpenses,
                  pendingExpenses: pendingExpenses,
                  pendingIncome: pendingIncome,
                  annualMeiRevenue: annualMeiRevenue
              }}
              creditCards={creditCards}
              expenseBreakdown={expenseBreakdown} 
              categoryBreakdown={categoryBreakdown}
              expenses={expenses}
              viewDate={viewDate}
              permissions={currentUser?.permissions} // Pass granular permissions
          />
      )}

      {currentView === ViewState.REPORTS && renderLayout(
          "Relatórios Gerenciais",
          "Análise detalhada de resultados",
          <ReportsView 
             onBack={() => setCurrentView(ViewState.DASHBOARD)}
             incomes={incomes}
             expenses={expenses}
             viewDate={viewDate}
             companyName={companyInfo.name}
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

      {currentView === ViewState.INVOICES && renderLayout(
          "Faturas de Cartão",
          "Conciliação e pagamento de faturas",
          <InvoicesView 
             onBack={() => setCurrentView(ViewState.DASHBOARD)}
             expenses={expenses}
             creditCards={creditCards}
             accounts={accounts}
             onPayInvoice={handlePayInvoice}
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
             categories={expenseCategories}
             onUpdateCategories={handleUpdateExpenseCategories}
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
             categories={expenseCategories}
             onUpdateCategories={handleUpdateExpenseCategories}
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
             categories={expenseCategories}
             onUpdateCategories={handleUpdateExpenseCategories}
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
          isAdmin={currentUser?.role === 'admin'}
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
