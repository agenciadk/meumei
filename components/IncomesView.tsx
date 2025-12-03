

import React, { useState } from 'react';
import { ArrowLeft, Plus, Pencil, Trash2, Wallet, ArrowUpCircle } from 'lucide-react';
import { Income, Account } from '../types';
import NewIncomeModal from './NewIncomeModal';

interface IncomesViewProps {
  onBack: () => void;
  incomes: Income[];
  onUpdateIncomes: (incomes: Income[]) => void;
  onDelete: (id: string | number) => void;
  accounts: Account[];
  onUpdateAccounts: (accounts: Account[]) => void;
  viewDate: Date;
  categories: string[];
  onUpdateCategories: (categories: string[]) => void;
}

const IncomesView: React.FC<IncomesViewProps> = ({ 
  onBack, 
  incomes, 
  onUpdateIncomes,
  onDelete,
  accounts,
  onUpdateAccounts,
  viewDate,
  categories,
  onUpdateCategories
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);

  // Filter incomes by Date
  const filteredIncomes = incomes.filter(inc => {
      const targetDate = new Date(inc.date); 
      return targetDate.getMonth() === viewDate.getMonth() && targetDate.getFullYear() === viewDate.getFullYear();
  });

  const totalAmount = filteredIncomes.reduce((acc, curr) => acc + curr.amount, 0);
  const totalReceived = filteredIncomes.filter(i => i.status === 'received').reduce((acc, curr) => acc + curr.amount, 0);

  const handleSaveIncome = (incomeData: any) => {
      let updatedList;
      
      if (Array.isArray(incomeData)) {
          // Bulk add (Installments)
          updatedList = [...incomes, ...incomeData];
          
          // Process Balance for each new income (only if received, which is rare for future installments but possible)
          const newAccounts = [...accounts];
          let accountsChanged = false;
          
          incomeData.forEach((inc: any) => {
             if (inc.accountId && inc.status === 'received') {
                  const accIdx = newAccounts.findIndex(a => a.id === inc.accountId);
                  if (accIdx > -1) {
                      newAccounts[accIdx].currentBalance += inc.amount;
                      accountsChanged = true;
                  }
             }
          });

          if (accountsChanged) {
              onUpdateAccounts(newAccounts);
          }

      } else {
          // Single Entry (Edit or New)
          let newItem: Income;
          const isEdit = !!incomeData.id;

          if (isEdit) {
              newItem = incomeData;
              updatedList = incomes.map(i => i.id === incomeData.id ? incomeData : i);
          } else {
              newItem = { ...incomeData, id: String(Math.random().toString(36).substr(2, 9)) };
              updatedList = [...incomes, newItem];
          }
          
          // --- BALANCE UPDATE LOGIC FOR CREATE/EDIT ---
          const newAccounts = [...accounts];
          let accountsChanged = false;

          const processTransaction = (inc: any, revert: boolean) => {
              if (inc.accountId && inc.status === 'received') {
                  const accIdx = newAccounts.findIndex(a => a.id === inc.accountId);
                  if (accIdx > -1) {
                      if (revert) {
                          newAccounts[accIdx].currentBalance -= inc.amount;
                      } else {
                          newAccounts[accIdx].currentBalance += inc.amount;
                      }
                      accountsChanged = true;
                  }
              }
          };

          if (isEdit && editingIncome) {
              processTransaction(editingIncome, true);
          }
          processTransaction(newItem, false);

          if (accountsChanged) {
              onUpdateAccounts(newAccounts);
          }
      }

      onUpdateIncomes(updatedList);
      setIsModalOpen(false);
      setEditingIncome(null);
  };

  const handleEdit = (income: Income) => {
      setEditingIncome(income);
      setIsModalOpen(true);
  };

  const handleNew = () => {
      setEditingIncome(null);
      setIsModalOpen(true);
  };

  const getAccountName = (accId: string) => {
      const acc = accounts.find(a => a.id === accId);
      return acc ? acc.name : 'Conta Deletada';
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
                    <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
                        <ArrowUpCircle className="text-emerald-500" />
                        Entradas
                    </h1>
                    <p className="text-sm text-zinc-500">
                        {filteredIncomes.length} registros • Previsto: <strong className="text-zinc-900 dark:text-white">R$ {totalAmount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong> • Recebido: <span className="text-emerald-600 font-bold">R$ {totalReceived.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                    </p>
                </div>
                <button 
                    onClick={handleNew}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/20"
                >
                    <Plus size={20} /> Nova Entrada
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
                                <th className="px-6 py-4 font-semibold">Data</th>
                                <th className="px-6 py-4 font-semibold">Descrição / Origem</th>
                                <th className="px-6 py-4 font-semibold">Destino</th>
                                <th className="px-6 py-4 font-semibold">Categoria</th>
                                <th className="px-6 py-4 font-semibold text-right">Valor</th>
                                <th className="px-6 py-4 font-semibold text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {filteredIncomes.length > 0 ? (
                                filteredIncomes.map(income => (
                                    <tr key={income.id} className="hover:bg-zinc-50 dark:hover:bg-[#1a1a1a] transition-colors">
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                                income.status === 'received' 
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' 
                                                : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                                            }`}>
                                                {income.status === 'received' ? 'Recebido' : 'Pendente'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">
                                            {new Date(income.date).toLocaleDateString('pt-BR')}
                                            {income.installments && (
                                                <span className="ml-2 text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded-md">
                                                    {income.installmentNumber}/{income.totalInstallments}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">
                                            {income.description}
                                        </td>
                                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">
                                            <div className="flex items-center gap-2">
                                                <Wallet size={14} className="text-emerald-500" />
                                                <span className="text-xs">{getAccountName(income.accountId)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">
                                            {income.category}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                            + R$ {income.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button 
                                                    onClick={() => handleEdit(income)}
                                                    className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        console.log('Clique na lixeira, id:', income.id);
                                                        if (confirm('Deseja excluir esta entrada?')) {
                                                            onDelete(income.id);
                                                        }
                                                    }}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                                    title="Excluir"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                                        Nenhuma entrada registrada para este mês.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>

        <NewIncomeModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveIncome}
            initialData={editingIncome}
            accounts={accounts}
            categories={categories}
            onUpdateCategories={onUpdateCategories}
        />
    </div>
  );
};

export default IncomesView;