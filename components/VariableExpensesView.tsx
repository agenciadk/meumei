

import React, { useState } from 'react';
import { ArrowLeft, Plus, Pencil, Trash2, CreditCard as CardIcon, Wallet } from 'lucide-react';
import { Expense, Account, CreditCard } from '../types';
import NewExpenseModal from './NewExpenseModal';

interface VariableExpensesViewProps {
  onBack: () => void;
  expenses: Expense[];
  onUpdateExpenses: (expenses: Expense[]) => void;
  accounts: Account[];
  onUpdateAccounts?: (accounts: Account[]) => void; // Added to handle balance updates
  creditCards: CreditCard[];
  viewDate: Date;
}

const VariableExpensesView: React.FC<VariableExpensesViewProps> = ({ 
  onBack, 
  expenses, 
  onUpdateExpenses,
  accounts,
  onUpdateAccounts,
  creditCards,
  viewDate 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Filter expenses based on the viewDate's month and year
  const filteredExpenses = expenses.filter(exp => {
      const targetDate = new Date(exp.dueDate); 
      return targetDate.getMonth() === viewDate.getMonth() && targetDate.getFullYear() === viewDate.getFullYear();
  });

  const totalAmount = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPaid = filteredExpenses.filter(e => e.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);

  const handleSaveExpense = (expenseData: any) => {
      let updatedList;
      let newItems: Expense[] = [];

      // Determine the new/updated expense object(s)
      if (Array.isArray(expenseData)) {
          // It's a list of installments
          newItems = expenseData.map((e: any) => ({
              ...e,
              id: e.id || Math.random().toString(36).substr(2, 9)
          }));
          updatedList = [...expenses, ...newItems];
      } else if (expenseData.id) {
          // Edit existing
          newItems = [expenseData];
          updatedList = expenses.map(e => e.id === expenseData.id ? expenseData : e);
      } else {
          // New single
          const newItem = { ...expenseData, id: Math.random().toString(36).substr(2, 9) };
          newItems = [newItem];
          updatedList = [...expenses, newItem];
      }
      
      // --- BALANCE UPDATE LOGIC ---
      if (onUpdateAccounts) {
          const newAccounts = [...accounts];
          let accountsChanged = false;

          const processTransaction = (exp: any, revert: boolean) => {
              // Only affect wallet/bank accounts, not credit cards
              // Only affect if status is PAID
              if (exp.accountId && exp.status === 'paid') {
                  const accIdx = newAccounts.findIndex(a => a.id === exp.accountId);
                  if (accIdx > -1) {
                      if (revert) {
                          // Adding back money (reverting a payment)
                          newAccounts[accIdx].currentBalance += exp.amount;
                      } else {
                          // Subtracting money (making a payment)
                          newAccounts[accIdx].currentBalance -= exp.amount;
                      }
                      accountsChanged = true;
                  }
              }
          };

          // 1. If Editing, Revert the OLD expense impact first
          if (editingExpense) {
              processTransaction(editingExpense, true);
          }

          // 2. Apply the NEW expense impact
          newItems.forEach(item => {
              processTransaction(item, false);
          });

          if (accountsChanged) {
              onUpdateAccounts(newAccounts);
          }
      }

      onUpdateExpenses(updatedList);
      setIsModalOpen(false);
      setEditingExpense(null);
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      if(confirm('Deseja excluir esta despesa?')) {
          
          // --- BALANCE UPDATE LOGIC ---
          // When deleting, we must "refund" the money to the account if it was paid
          if (onUpdateAccounts) {
            const expToDelete = expenses.find(exp => exp.id === id);
            if (expToDelete && expToDelete.accountId && expToDelete.status === 'paid') {
                const newAccounts = [...accounts];
                const accIdx = newAccounts.findIndex(a => a.id === expToDelete.accountId);
                if (accIdx > -1) {
                    newAccounts[accIdx].currentBalance += expToDelete.amount;
                    onUpdateAccounts(newAccounts);
                }
            }
          }

          const updatedList = expenses.filter(e => e.id !== id);
          onUpdateExpenses(updatedList);
      }
  };

  const handleEdit = (expense: Expense) => {
      setEditingExpense(expense);
      setIsModalOpen(true);
  };

  const handleNew = () => {
      setEditingExpense(null);
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
        
        {/* Header Summary */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-6 relative z-10 -mt-6">
            <button 
                onClick={onBack}
                className="mb-6 flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
            >
                <ArrowLeft size={16} /> Voltar ao Dashboard
            </button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-[#151517] p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold mb-1">Despesas Variáveis</h1>
                    <p className="text-sm text-zinc-500">
                        {filteredExpenses.length} despesas • Total: <strong className="text-zinc-900 dark:text-white">R$ {totalAmount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong> • Pago: <span className="text-emerald-600">R$ {totalPaid.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                    </p>
                </div>
                <button 
                    onClick={handleNew}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-900/20"
                >
                    <Plus size={20} /> Nova Despesa Variável
                </button>
            </div>
        </div>

        {/* Table List */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="bg-white dark:bg-[#151517] rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-[#1a1a1a] border-b border-zinc-200 dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Data de Lançamento</th>
                                <th className="px-6 py-4 font-semibold">Fornecedor</th>
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
                                    return (
                                    <tr key={expense.id} className="hover:bg-zinc-50 dark:hover:bg-[#1a1a1a] transition-colors">
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
                                            {new Date(expense.date).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">
                                            {expense.description}
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
                                            {new Date(expense.dueDate).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-red-600 dark:text-red-400">
                                            R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button 
                                                    onClick={() => handleEdit(expense)}
                                                    className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button 
                                                    onClick={(e) => handleDelete(expense.id, e)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )})
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-zinc-500">
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
            initialData={editingExpense}
            accounts={accounts}
            creditCards={creditCards}
            categories={[]}
        />
    </div>
  );
};

export default VariableExpensesView;