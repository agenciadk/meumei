

import React, { useState } from 'react';
import { ArrowLeft, Plus, Wallet, ArrowUpCircle, Trash2, AlertTriangle, X } from 'lucide-react';
import { Income, Account } from '../types';
import NewIncomeModal from './NewIncomeModal';

interface IncomesViewProps {
  onBack: () => void;
  incomes: Income[];
  onUpdateIncomes: (incomes: Income[]) => void;
  onDeleteIncome: (id: string) => void;
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
  onDeleteIncome,
  accounts,
  onUpdateAccounts,
  viewDate,
  categories,
  onUpdateCategories
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // --- DELETE STATE ---
  const [incomeToDelete, setIncomeToDelete] = useState<Income | null>(null);

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
          // Single Entry (New)
          let newItem: Income;
          // No Edit Support anymore as requested
          newItem = { ...incomeData, id: String(Math.random().toString(36).substr(2, 9)) };
          updatedList = [...incomes, newItem];
          
          // --- BALANCE UPDATE LOGIC FOR CREATE ---
          const newAccounts = [...accounts];
          let accountsChanged = false;

          const processTransaction = (inc: any) => {
              if (inc.accountId && inc.status === 'received') {
                  const accIdx = newAccounts.findIndex(a => a.id === inc.accountId);
                  if (accIdx > -1) {
                      newAccounts[accIdx].currentBalance += inc.amount;
                      accountsChanged = true;
                  }
              }
          };

          processTransaction(newItem);

          if (accountsChanged) {
              onUpdateAccounts(newAccounts);
          }
      }

      onUpdateIncomes(updatedList);
      setIsModalOpen(false);
  };

  // Trigger modal opening
  const requestDelete = (income: Income) => {
      setIncomeToDelete(income);
  };

  // Confirm Action
  const confirmDelete = () => {
      if (incomeToDelete) {
          onDeleteIncome(incomeToDelete.id);
          setIncomeToDelete(null);
      }
  };

  const handleNew = () => {
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
                                    <tr key={income.id} className="hover:bg-zinc-50 dark:hover:bg-[#1a1a1a] transition-colors group">
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
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={() => requestDelete(income)}
                                                className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Excluir Entrada"
                                            >
                                                <Trash2 size={16} />
                                            </button>
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
            initialData={null}
            accounts={accounts}
            categories={categories}
            onUpdateCategories={onUpdateCategories}
        />

        {/* --- DELETE CONFIRMATION MODAL --- */}
        {incomeToDelete && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 max-w-sm w-full p-6 relative animate-in zoom-in-95 duration-200">
                    <button 
                        onClick={() => setIncomeToDelete(null)}
                        className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4 text-red-600 dark:text-red-500">
                            <Trash2 size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Excluir Entrada?</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Você está prestes a excluir o registro de <strong>{incomeToDelete.description}</strong> no valor de <strong>R$ {incomeToDelete.amount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong>.
                        </p>
                    </div>

                    {incomeToDelete.status === 'received' && (
                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-3 rounded-lg flex gap-3 items-start mb-6 text-left">
                            <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                                Como esta entrada já foi marcada como <strong>Recebida</strong>, o valor será debitado do saldo da conta vinculada.
                            </p>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button 
                            onClick={() => setIncomeToDelete(null)}
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
    </div>
  );
};

export default IncomesView;