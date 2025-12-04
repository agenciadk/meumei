
import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Landmark, 
  Smartphone, 
  Globe, 
  TrendingUp, 
  Banknote,
  CheckSquare,
  Trash2,
  X,
  AlertTriangle
} from 'lucide-react';
import NewAccountModal from './NewAccountModal';
import { Account } from '../types';

interface AccountsViewProps {
  onBack: () => void;
  accounts: Account[];
  onUpdateAccounts: (accounts: Account[]) => void;
  onDeleteAccount: (id: string) => void;
  accountTypes: string[];
  onUpdateAccountTypes: (types: string[]) => void;
}

const AccountsView: React.FC<AccountsViewProps> = ({ 
  onBack, 
  accounts, 
  onUpdateAccounts, 
  onDeleteAccount,
  accountTypes, 
  onUpdateAccountTypes 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // --- DELETE STATE ---
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

  // --- Logic for Dynamic Calculation ---
  const isSelectionMode = selectedIds.length > 0;

  const displayBalance = isSelectionMode
    ? accounts.filter(acc => selectedIds.includes(acc.id)).reduce((acc, curr) => acc + curr.currentBalance, 0)
    : accounts.reduce((acc, curr) => acc + curr.currentBalance, 0);

  const displayCount = isSelectionMode ? selectedIds.length : accounts.length;
  const displayLabel = isSelectionMode ? 'Saldo Parcial (Selecionado)' : 'Saldo Total';

  // --- Icons Logic ---
  const getIconForType = (type: string) => {
    if (type.includes('Carteira') || type.includes('Nubank')) return <Smartphone size={24} className="text-purple-600" />;
    if (type.includes('Rendimentos') || type.includes('Investimento')) return <TrendingUp size={24} className="text-purple-600" />;
    if (type.includes('Dinheiro')) return <Banknote size={24} className="text-purple-600" />;
    if (type.includes('Internacional')) return <Globe size={24} className="text-purple-600" />;
    return <Landmark size={24} className="text-purple-600" />;
  };

  // --- Actions ---

  const handleSaveAccount = (accountData: any) => {
    let updatedAccounts;
    if (accountData.id) {
        // We removed editing for now, so this branch might be unused unless invoked differently, 
        // but keeping logic clean for new additions.
        updatedAccounts = accounts.map(acc => 
            acc.id === accountData.id 
            ? { ...acc, name: accountData.name, type: accountData.type, initialBalance: accountData.balance, currentBalance: accountData.balance } 
            : acc
        );
    } else {
        const newAccount: Account = {
            id: Math.random().toString(36).substr(2, 9),
            name: accountData.name,
            type: accountData.type,
            initialBalance: accountData.balance,
            currentBalance: accountData.balance,
            yieldRate: accountData.yieldRate,
            yieldIndex: accountData.yieldIndex
            // icon is rendered dynamically
        };
        updatedAccounts = [...accounts, newAccount];
    }
    onUpdateAccounts(updatedAccounts);
    setIsModalOpen(false);
  };

  // Trigger modal
  const requestDelete = (e: React.MouseEvent, account: Account) => {
      e.stopPropagation(); // Prevent selection toggle
      setAccountToDelete(account);
  };

  // Confirm delete
  const confirmDelete = () => {
      if (accountToDelete) {
          onDeleteAccount(accountToDelete.id);
          setAccountToDelete(null);
      }
  };

  const handleOpenNew = () => {
      setIsModalOpen(true);
  };

  const toggleSelection = (id: string) => {
      if (selectedIds.includes(id)) {
          setSelectedIds(selectedIds.filter(i => i !== id));
      } else {
          setSelectedIds([...selectedIds, id]);
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] text-zinc-900 dark:text-white font-inter pb-20 transition-colors duration-300">
      
      {/* Summary Bar & Action */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-20 -mt-6 pt-10">
          
          <button 
             onClick={onBack}
             className="mb-6 flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
          >
              <ArrowLeft size={16} /> Voltar ao Dashboard
          </button>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300">
              
              {/* Dynamic Balance Display */}
              <div className={`rounded-full px-6 py-3 shadow-lg border flex items-center gap-3 transition-all duration-300 ${isSelectionMode ? 'bg-indigo-600 border-indigo-500 text-white scale-105' : 'bg-white dark:bg-[#1a1a1a] border-zinc-200 dark:border-zinc-800'}`}>
                  <span className={`text-sm font-semibold ${isSelectionMode ? 'text-indigo-100' : 'text-zinc-600 dark:text-zinc-400'}`}>
                      {displayCount} {displayCount === 1 ? 'conta' : 'contas'} • {displayLabel}:
                  </span>
                  <span className={`text-lg font-bold ${isSelectionMode ? 'text-white' : 'text-zinc-900 dark:text-white'}`}>
                      R$ {displayBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
              </div>

              {/* Action Button: Only New Account now */}
              <button 
                onClick={handleOpenNew}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-blue-900/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                  <Plus size={20} />
                  Nova Conta
              </button>
          </div>
      </div>

      {/* Accounts Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {accounts.map(account => {
                  const isSelected = selectedIds.includes(account.id);
                  
                  return (
                    <div 
                        key={account.id} 
                        onClick={() => toggleSelection(account.id)}
                        className={`
                            rounded-2xl p-6 border shadow-sm transition-all duration-200 group relative cursor-pointer select-none
                            ${isSelected 
                                ? 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-500 ring-1 ring-indigo-500' 
                                : 'bg-white dark:bg-[#1a1a1a] border-zinc-200 dark:border-zinc-800 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700'}
                        `}
                    >
                      
                      {/* Top Row: Checkbox, Icon, Name */}
                      <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-4">
                              {/* Selection Checkbox */}
                              <div className={`
                                  w-6 h-6 rounded-md border flex items-center justify-center transition-colors
                                  ${isSelected 
                                      ? 'bg-indigo-600 border-indigo-600 text-white' 
                                      : 'bg-transparent border-zinc-300 dark:border-zinc-600 text-transparent group-hover:border-zinc-400'}
                              `}>
                                  <CheckSquare size={16} fill="currentColor" className={isSelected ? 'block' : 'hidden'} />
                              </div>

                              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                  {getIconForType(account.type)}
                              </div>
                              <div>
                                  <h3 className="font-bold text-lg text-zinc-900 dark:text-white leading-tight">{account.name}</h3>
                                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{account.type}</p>
                              </div>
                          </div>

                           {/* Delete Button (Visible on Hover/Always on mobile) */}
                           <button 
                                onClick={(e) => requestDelete(e, account)}
                                className="p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                title="Excluir Conta"
                            >
                                <Trash2 size={16} />
                            </button>
                      </div>

                      {/* Info Rows */}
                      <div className="space-y-3">
                          <div className="flex justify-between items-center text-sm">
                              <span className="text-zinc-500 dark:text-zinc-400">Saldo Inicial:</span>
                              <span className="font-medium text-zinc-900 dark:text-white">R$ {account.initialBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                          
                          {(account.yieldRate !== undefined) && (
                               <div className="flex justify-between items-center text-sm">
                                  <span className="text-zinc-500 dark:text-zinc-400">Taxa:</span>
                                  <span className="font-bold text-blue-500">
                                    {account.yieldRate}% do {account.yieldIndex || 'CDI'}
                                  </span>
                              </div>
                          )}

                          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-end">
                              <span className="text-zinc-500 dark:text-zinc-400 text-sm">Saldo Atual:</span>
                              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                  R$ {account.currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                          </div>
                      </div>

                  </div>
              )})}
          </div>
      </main>

      <NewAccountModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAccount}
        initialData={null}
        accountTypes={accountTypes}
        onUpdateAccountTypes={onUpdateAccountTypes}
      />

       {/* --- DELETE CONFIRMATION MODAL --- */}
       {accountToDelete && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 max-w-sm w-full p-6 relative animate-in zoom-in-95 duration-200">
                    <button 
                        onClick={() => setAccountToDelete(null)}
                        className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4 text-red-600 dark:text-red-500">
                            <Trash2 size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Excluir Conta?</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Você está prestes a excluir permanentemente a conta <strong>{accountToDelete.name}</strong>.
                        </p>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-3 rounded-lg flex gap-3 items-start mb-6 text-left">
                        <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                            As transações antigas vinculadas a esta conta permanecerão no histórico, mas perderão a referência de origem.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={() => setAccountToDelete(null)}
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

export default AccountsView;
