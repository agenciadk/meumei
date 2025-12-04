
// ... existing imports ...
import React, { useState } from 'react';
import { ArrowLeft, Plus, CreditCard as CardIcon, Wallet, Trash2, X, AlertTriangle, CheckSquare, Square, CheckCircle2, Circle, UserCircle } from 'lucide-react';
import { Expense, Account, CreditCard, ExpenseType } from '../types';
import NewExpenseModal from './NewExpenseModal';

interface ExpensesViewProps {
// ... existing props ...
  onBack: () => void;
  expenses: Expense[];
  onUpdateExpenses: (expenses: Expense[]) => void;
  onDeleteExpense: (id: string) => void;
  accounts: Account[];
  onUpdateAccounts?: (accounts: Account[]) => void;
  creditCards: CreditCard[];
  viewDate: Date;
  title: string;
  subtitle: string;
  expenseType: ExpenseType;
  themeColor: 'indigo' | 'amber' | 'cyan' | 'pink'; 
  categories: string[];
  onUpdateCategories: (categories: string[]) => void;
}

const ExpensesView: React.FC<ExpensesViewProps> = ({ 
  onBack, 
  expenses, 
  onUpdateExpenses, 
  onDeleteExpense,
  accounts,
  onUpdateAccounts,
  creditCards,
  viewDate,
  title,
  expenseType,
  themeColor,
  categories,
  onUpdateCategories
}) => {
  // ... existing state and logic ...
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Filter expenses by Type AND Date
  const filteredExpenses = expenses.filter(exp => {
      const targetDate = new Date(exp.dueDate + 'T12:00:00'); // Safe date parsing
      return exp.type === expenseType && 
             targetDate.getMonth() === viewDate.getMonth() && 
             targetDate.getFullYear() === viewDate.getFullYear();
  });

  const totalAmount = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPaid = filteredExpenses.filter(e => e.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);

  // --- SELECTION CALCULATIONS ---
  const selectedExpenses = filteredExpenses.filter(e => selectedIds.includes(e.id));
  const selectedTotalAmount = selectedExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  // Helper for colors based on theme
  const getThemeClasses = () => {
      switch(themeColor) {
          case 'amber': return { btn: 'bg-amber-600 hover:bg-amber-700 shadow-amber-900/20', text: 'text-amber-600', light: 'bg-amber-50 text-amber-700' };
          case 'cyan': return { btn: 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-900/20', text: 'text-cyan-600', light: 'bg-cyan-50 text-cyan-700' };
          case 'pink': return { btn: 'bg-pink-600 hover:bg-pink-700 shadow-pink-900/20', text: 'text-pink-600', light: 'bg-pink-50 text-pink-700' };
          default: return { btn: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-900/20', text: 'text-indigo-600', light: 'bg-indigo-50 text-indigo-700' };
      }
  };
  const theme = getThemeClasses();

  // ... rest of handlers ...
  const getSingularTitle = () => {
      switch(expenseType) {
          case 'fixed': return 'Despesa Fixa';
          case 'personal': return 'Despesa Pessoal';
          case 'variable': return 'Despesa Variável';
          default: return 'Despesa';
      }
  }

  const toggleSelection = (id: string) => {
      setSelectedIds(prev => 
          prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
  };

  const toggleSelectAll = () => {
      if (selectedIds.length === filteredExpenses.length && filteredExpenses.length > 0) {
          setSelectedIds([]);
      } else {
          setSelectedIds(filteredExpenses.map(e => e.id));
      }
  };

  const handleSaveExpense = (expenseData: any) => {
      let updatedList;
      let newItems: Expense[] = [];

      if (Array.isArray(expenseData)) {
          newItems = expenseData.map((e: any) => ({
              ...e,
              type: expenseType, 
              id: e.id || Math.random().toString(36).substr(2, 9)
          }));
          updatedList = [...expenses, ...newItems];
      } else {
          const newItem = { ...expenseData, type: expenseType, id: Math.random().toString(36).substr(2, 9) };
          newItems = [newItem];
          updatedList = [...expenses, newItem];
      }
      
      if (onUpdateAccounts) {
          const newAccounts = [...accounts];
          let accountsChanged = false;

          const processTransaction = (exp: any) => {
              if (exp.accountId && exp.status === 'paid') {
                  const accIdx = newAccounts.findIndex(a => a.id === exp.accountId);
                  if (accIdx > -1) {
                      newAccounts[accIdx].currentBalance -= exp.amount;
                      accountsChanged = true;
                  }
              }
          };

          newItems.forEach(item => {
              processTransaction(item);
          });

          if (accountsChanged) {
              onUpdateAccounts(newAccounts);
          }
      }

      onUpdateExpenses(updatedList);
      setIsModalOpen(false);
  };

  const handleBulkStatusChange = (newStatus: 'paid' | 'pending') => {
      if (selectedIds.length === 0) return;

      const newAccounts = [...accounts];
      let accountsChanged = false;

      const updatedExpenses = expenses.map(exp => {
          if (!selectedIds.includes(exp.id)) return exp;
          if (exp.status === newStatus) return exp;

          if (exp.accountId) {
              const accIdx = newAccounts.findIndex(a => a.id === exp.accountId);
              if (accIdx > -1) {
                  if (newStatus === 'paid') {
                      newAccounts[accIdx].currentBalance -= exp.amount;
                  } else {
                      newAccounts[accIdx].currentBalance += exp.amount;
                  }
                  accountsChanged = true;
              }
          }

          return { ...exp, status: newStatus };
      });

      onUpdateExpenses(updatedExpenses);
      if (accountsChanged && onUpdateAccounts) {
          onUpdateAccounts(newAccounts);
      }
  };

  const handleBulkDeleteConfirm = () => {
      const newAccounts = [...accounts];
      let accountsChanged = false;

      selectedExpenses.forEach(exp => {
          if (exp.status === 'paid' && exp.accountId) {
              const accIdx = newAccounts.findIndex(a => a.id === exp.accountId);
              if (accIdx > -1) {
                  newAccounts[accIdx].currentBalance += exp.amount;
                  accountsChanged = true;
              }
          }
      });

      const remainingExpenses = expenses.filter(exp => !selectedIds.includes(exp.id));

      onUpdateExpenses(remainingExpenses);
      if (accountsChanged && onUpdateAccounts) {
          onUpdateAccounts(newAccounts);
      }
      
      setSelectedIds([]);
      setIsBulkDeleteModalOpen(false);
  };

  const requestDelete = (expense: Expense) => {
      setExpenseToDelete(expense);
  };

  const confirmDelete = () => {
      if (expenseToDelete) {
          onDeleteExpense(expenseToDelete.id);
          setExpenseToDelete(null);
      }
  };

  const handleNew = () => {
      setIsModalOpen(true);
  };

  const getSourceInfo = (expense: Expense) => {
      if (expense.paymentMethod === 'Crédito' && expense.cardId) {
          const card = creditCards.find(c => c.id === expense.cardId);
          return { name: card?.name || 'Cartão Deletado', icon: <CardIcon size={14} className="text-purple-500" /> };
      }
      if (expense.accountId) {
          const acc = accounts.find(a => a.id === expense.accountId);
          return { name: acc?.name || 'Conta Deletada', icon: <Wallet size={14} className="text-emerald-500" /> };
      }
      return { name: expense.paymentMethod, icon: null };
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] text-zinc-900 dark:text-white font-inter pb-20 transition-colors duration-300">
        
        {/* ... Header Summary ... */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-6 relative z-10 -mt-6">
            <button 
                onClick={onBack}
                className="mb-6 flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
            >
                <ArrowLeft size={16} /> Voltar ao Dashboard
            </button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-[#151517] p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold mb-1">{title}</h1>
                    <p className="text-sm text-zinc-500">
                        {filteredExpenses.length} despesas • Total: <strong className="text-zinc-900 dark:text-white">R$ {totalAmount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong> • Pago: <span className="text-emerald-600">R$ {totalPaid.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                    </p>
                </div>
                <button 
                    onClick={handleNew}
                    className={`${theme.btn} text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg`}
                >
                    <Plus size={20} /> Nova {getSingularTitle()}
                </button>
            </div>
        </div>

        {/* ... Bulk Actions ... */}
        {selectedIds.length > 0 && (
             <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-4 animate-in fade-in slide-in-from-top-2">
                <div className="bg-indigo-600 dark:bg-indigo-900 text-white p-3 rounded-xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <span className="bg-white/20 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-2">
                             <CheckSquare size={16} /> {selectedIds.length} selecionados
                        </span>
                        <div className="h-6 w-px bg-white/20 hidden sm:block"></div>
                        <span className="text-sm font-medium">
                            Soma: <strong className="text-lg ml-1">R$ {selectedTotalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                        </span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button 
                            onClick={() => handleBulkStatusChange('paid')}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-xs font-bold transition-colors"
                        >
                            <CheckCircle2 size={14} /> Marcar Pagos
                        </button>
                        <button 
                            onClick={() => handleBulkStatusChange('pending')}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-white rounded-lg text-xs font-bold transition-colors"
                        >
                            <Circle size={14} /> Marcar Pendentes
                        </button>
                        <button 
                            onClick={() => setIsBulkDeleteModalOpen(true)}
                            className="flex-none p-1.5 bg-white/10 hover:bg-red-500 text-white rounded-lg transition-colors"
                            title="Excluir Selecionados"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
             </div>
        )}

        {/* Table List */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="bg-white dark:bg-[#151517] rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-[#1a1a1a] border-b border-zinc-200 dark:border-zinc-800">
                            <tr>
                                <th className="px-4 py-4 w-12 text-center">
                                    <button 
                                        onClick={toggleSelectAll}
                                        className="text-zinc-400 hover:text-indigo-600 transition-colors"
                                    >
                                        {selectedIds.length > 0 && selectedIds.length === filteredExpenses.length 
                                            ? <CheckSquare size={18} className="text-indigo-600" /> 
                                            : <Square size={18} />
                                        }
                                    </button>
                                </th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Data de Lançamento</th>
                                <th className="px-6 py-4 font-semibold">Descrição</th>
                                <th className="px-6 py-4 font-semibold">Conta / Cartão</th>
                                <th className="px-6 py-4 font-semibold">Categoria</th>
                                <th className="px-6 py-4 font-semibold">Vencimento</th>
                                <th className="px-6 py-4 font-semibold text-right">Valor</th>
                                <th className="px-6 py-4 font-semibold text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {filteredExpenses.length > 0 ? (
                                filteredExpenses.map(expense => {
                                    const source = getSourceInfo(expense);
                                    const isSelected = selectedIds.includes(expense.id);

                                    return (
                                    <tr 
                                        key={expense.id} 
                                        className={`transition-colors group ${isSelected ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : 'hover:bg-zinc-50 dark:hover:bg-[#1a1a1a]'}`}
                                    >
                                        <td className="px-4 py-4 text-center">
                                            <button 
                                                onClick={() => toggleSelection(expense.id)}
                                                className="text-zinc-400 hover:text-indigo-600 transition-colors"
                                            >
                                                {isSelected 
                                                    ? <CheckSquare size={18} className="text-indigo-600" /> 
                                                    : <Square size={18} />
                                                }
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                                expense.status === 'paid' 
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' 
                                                : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                                            }`}>
                                                {expense.status === 'paid' ? 'Pago' : 'Pendente'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">
                                            {new Date(expense.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">
                                            {expense.description}
                                            {expense.createdBy && (
                                                <span className="block text-[10px] text-zinc-400 font-normal mt-0.5 flex items-center gap-1">
                                                    <UserCircle size={10} /> Lançado por: {expense.createdBy}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">
                                            <div className="flex items-center gap-2">
                                                {source.icon}
                                                <span className="text-xs">{source.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">
                                            {expense.category}
                                        </td>
                                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">
                                            {new Date(expense.dueDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-red-600 dark:text-red-400">
                                            R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={() => requestDelete(expense)}
                                                className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Excluir Despesa"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                )})
                            ) : (
                                <tr>
                                    <td colSpan={9} className="px-6 py-12 text-center text-zinc-500">
                                        Nenhuma despesa encontrada para este mês.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>

        <NewExpenseModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveExpense}
            initialData={null}
            accounts={accounts}
            creditCards={creditCards}
            categories={categories}
            onUpdateCategories={onUpdateCategories}
            expenseType={expenseType}
            themeColor={themeColor}
            defaultDate={viewDate} // PASS VIEW DATE
        />

        {/* ... Modal Components ... */}
        {expenseToDelete && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 max-w-sm w-full p-6 relative animate-in zoom-in-95 duration-200">
                    <button 
                        onClick={() => setExpenseToDelete(null)}
                        className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4 text-red-600 dark:text-red-500">
                            <Trash2 size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Excluir Despesa?</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Você está prestes a excluir <strong>{expenseToDelete.description}</strong> no valor de <strong>R$ {expenseToDelete.amount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong>.
                        </p>
                    </div>

                    {expenseToDelete.status === 'paid' && expenseToDelete.accountId && (
                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-3 rounded-lg flex gap-3 items-start mb-6 text-left">
                            <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                                Como esta despesa já foi paga, o valor será <strong>estornado (devolvido)</strong> ao saldo da conta de origem.
                            </p>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button 
                            onClick={() => setExpenseToDelete(null)}
                            className="flex-1 py-3 rounded-xl font-bold text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-sm"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={confirmDelete}
                            className="flex-1 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-900/20 transition-colors text-sm"
                        >
                            Sim, Excluir
                        </button>
                    </div>
                </div>
            </div>
        )}

        {isBulkDeleteModalOpen && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 max-w-sm w-full p-6 relative animate-in zoom-in-95 duration-200">
                    <button 
                        onClick={() => setIsBulkDeleteModalOpen(false)}
                        className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4 text-red-600 dark:text-red-500">
                            <Trash2 size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Excluir {selectedIds.length} Itens?</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Total selecionado: <strong>R$ {selectedTotalAmount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong>.
                        </p>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-3 rounded-lg flex gap-3 items-start mb-6 text-left">
                        <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                            Itens marcados como <strong>Pagos</strong> terão seus valores estornados (devolvidos) para as contas de origem.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={() => setIsBulkDeleteModalOpen(false)}
                            className="flex-1 py-3 rounded-xl font-bold text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-sm"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={handleBulkDeleteConfirm}
                            className="flex-1 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-900/20 transition-colors text-sm"
                        >
                            Confirmar Exclusão
                        </button>
                    </div>
                </div>
            </div>
        )}

    </div>
  );
};

export default ExpensesView;
