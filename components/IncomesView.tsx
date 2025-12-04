
// ... existing imports ...
import React, { useState } from 'react';
import { ArrowLeft, Plus, Wallet, ArrowUpCircle, Trash2, AlertTriangle, X, CheckSquare, Square, CheckCircle2, Circle, UserCircle } from 'lucide-react';
import { Income, Account } from '../types';
import NewIncomeModal from './NewIncomeModal';

// ... existing interface ...
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
  // ... existing state ...
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [incomeToDelete, setIncomeToDelete] = useState<Income | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Filter incomes by Date
  const filteredIncomes = incomes.filter(inc => {
      // Use T12:00:00 for safe parsing
      const targetDate = new Date(inc.date + 'T12:00:00'); 
      return targetDate.getMonth() === viewDate.getMonth() && targetDate.getFullYear() === viewDate.getFullYear();
  });

  const totalAmount = filteredIncomes.reduce((acc, curr) => acc + curr.amount, 0);
  const totalReceived = filteredIncomes.filter(i => i.status === 'received').reduce((acc, curr) => acc + curr.amount, 0);

  // ... rest of logic/handlers ...
  // --- SELECTION CALCULATIONS ---
  const selectedIncomes = filteredIncomes.filter(i => selectedIds.includes(i.id));
  const selectedTotalAmount = selectedIncomes.reduce((acc, curr) => acc + curr.amount, 0);

  // --- HANDLERS ---

  const toggleSelection = (id: string) => {
      setSelectedIds(prev => 
          prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
  };

  const toggleSelectAll = () => {
      if (selectedIds.length === filteredIncomes.length && filteredIncomes.length > 0) {
          setSelectedIds([]);
      } else {
          setSelectedIds(filteredIncomes.map(i => i.id));
      }
  };

  // ... handleSaveIncome, handleBulkStatusChange, handleBulkDeleteConfirm, requestDelete, confirmDelete, handleNew ...
  const handleSaveIncome = (incomeData: any) => {
      let updatedList;
      
      if (Array.isArray(incomeData)) {
          updatedList = [...incomes, ...incomeData];
          
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
          let newItem: Income;
          newItem = { ...incomeData, id: String(Math.random().toString(36).substr(2, 9)) };
          updatedList = [...incomes, newItem];
          
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

  const handleBulkStatusChange = (newStatus: 'received' | 'pending') => {
      if (selectedIds.length === 0) return;

      const newAccounts = [...accounts];
      let accountsChanged = false;

      const updatedIncomes = incomes.map(inc => {
          if (!selectedIds.includes(inc.id)) return inc;
          if (inc.status === newStatus) return inc;

          if (inc.accountId) {
              const accIdx = newAccounts.findIndex(a => a.id === inc.accountId);
              if (accIdx > -1) {
                  if (newStatus === 'received') {
                      newAccounts[accIdx].currentBalance += inc.amount;
                  } else {
                      newAccounts[accIdx].currentBalance -= inc.amount;
                  }
                  accountsChanged = true;
              }
          }

          return { ...inc, status: newStatus };
      });

      onUpdateIncomes(updatedIncomes);
      if (accountsChanged) {
          onUpdateAccounts(newAccounts);
      }
  };

  const handleBulkDeleteConfirm = () => {
      const newAccounts = [...accounts];
      let accountsChanged = false;

      selectedIncomes.forEach(inc => {
          if (inc.status === 'received' && inc.accountId) {
              const accIdx = newAccounts.findIndex(a => a.id === inc.accountId);
              if (accIdx > -1) {
                  newAccounts[accIdx].currentBalance -= inc.amount;
                  accountsChanged = true;
              }
          }
      });

      const remainingIncomes = incomes.filter(inc => !selectedIds.includes(inc.id));

      onUpdateIncomes(remainingIncomes);
      if (accountsChanged) {
          onUpdateAccounts(newAccounts);
      }
      
      setSelectedIds([]);
      setIsBulkDeleteModalOpen(false);
  };

  const requestDelete = (income: Income) => {
      setIncomeToDelete(income);
  };

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

        {/* ... Bulk Actions ... */}
        {selectedIds.length > 0 && (
             <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-4 animate-in fade-in slide-in-from-top-2">
                <div className="bg-emerald-600 dark:bg-emerald-900 text-white p-3 rounded-xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
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
                            onClick={() => handleBulkStatusChange('received')}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 bg-white text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs font-bold transition-colors"
                        >
                            <CheckCircle2 size={14} /> Marcar Recebidos
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
                                        className="text-zinc-400 hover:text-emerald-600 transition-colors"
                                    >
                                        {selectedIds.length > 0 && selectedIds.length === filteredIncomes.length 
                                            ? <CheckSquare size={18} className="text-emerald-600" /> 
                                            : <Square size={18} />
                                        }
                                    </button>
                                </th>
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
                                filteredIncomes.map(income => {
                                    const isSelected = selectedIds.includes(income.id);
                                    
                                    return (
                                    <tr 
                                        key={income.id} 
                                        className={`transition-colors group ${isSelected ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : 'hover:bg-zinc-50 dark:hover:bg-[#1a1a1a]'}`}
                                    >
                                        <td className="px-4 py-4 text-center">
                                            <button 
                                                onClick={() => toggleSelection(income.id)}
                                                className="text-zinc-400 hover:text-emerald-600 transition-colors"
                                            >
                                                {isSelected 
                                                    ? <CheckSquare size={18} className="text-emerald-600" /> 
                                                    : <Square size={18} />
                                                }
                                            </button>
                                        </td>
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
                                            {new Date(income.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                                            {income.installments && (
                                                <span className="ml-2 text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded-md">
                                                    {income.installmentNumber}/{income.totalInstallments}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">
                                            {income.description}
                                            {income.createdBy && (
                                                <span className="block text-[10px] text-zinc-400 font-normal mt-0.5 flex items-center gap-1">
                                                    <UserCircle size={10} /> Lançado por: {income.createdBy}
                                                </span>
                                            )}
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
                                )})
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-zinc-500">
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
            defaultDate={viewDate} // PASS VIEW DATE
        />

        {/* ... Modal Components ... */}
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
                            Itens marcados como <strong>Recebidos</strong> terão seus valores debitados (revertidos) das contas de destino.
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

export default IncomesView;
