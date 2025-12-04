
import React, { useState, useEffect } from 'react';
import { X, Calendar, TrendingUp } from 'lucide-react';
import { Account } from '../types';

interface NewYieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { accountId: string, amount: number, date: string, notes: string }) => void;
  accounts: Account[];
}

const NewYieldModal: React.FC<NewYieldModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  accounts
}) => {
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  // Filtra apenas contas de investimento/rendimento
  const investmentAccounts = accounts.filter(acc => {
      const isYieldType = acc.type.toLowerCase().includes('rendimento') || acc.type.toLowerCase().includes('investimento');
      return isYieldType || (acc.yieldRate !== undefined && acc.yieldRate > 0);
  });

  useEffect(() => {
    if (isOpen) {
        setAccountId(investmentAccounts.length > 0 ? investmentAccounts[0].id : '');
        setAmount('');
        
        // Adjust for local timezone to prevent date shifting
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        const today = now.toISOString().split('T')[0];

        setDate(today);
        setNotes('');
    }
  }, [isOpen, accounts]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!accountId || !amount || !date) return;
    
    onSave({
        accountId,
        amount: parseFloat(amount.replace(',', '.')),
        date,
        notes
    });
  };

  const selectedAccount = accounts.find(a => a.id === accountId);

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} aria-hidden="true" />

        <div className="relative w-full max-w-lg transform rounded-2xl bg-white dark:bg-[#1a1a1a] text-left shadow-xl transition-all sm:my-8 border border-zinc-200 dark:border-zinc-800">
          
          <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="text-indigo-600 dark:text-indigo-400" />
                Novo Rendimento
            </h2>
            <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Data do Rendimento</label>
                    <div className="relative">
                        <input 
                            type="date" 
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all [color-scheme:dark]"
                        />
                        <Calendar className="absolute right-4 top-3 text-zinc-400 pointer-events-none" size={20} />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Conta</label>
                    <select 
                        value={accountId}
                        onChange={(e) => setAccountId(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                    >
                        {investmentAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Valor Rendido (R$)</label>
                <div className="relative">
                     <span className="absolute left-4 top-3 text-emerald-500 font-bold">R$</span>
                     <input 
                        type="number" 
                        placeholder="0,00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-lg"
                    />
                </div>
                {selectedAccount && (
                    <p className="text-[10px] text-zinc-400 text-right">
                        Saldo Atual: R$ {selectedAccount.currentBalance.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </p>
                )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Observações</label>
              <textarea 
                rows={3}
                placeholder="Informações adicionais..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-zinc-400 resize-none"
              />
            </div>

          </div>

          <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3 bg-white dark:bg-[#1a1a1a] rounded-b-2xl">
              <button onClick={onClose} className="px-6 py-3 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                  Cancelar
              </button>
              <button onClick={handleSave} className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-900/20 transition-all active:scale-95">
                  Adicionar Rendimento
              </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default NewYieldModal;
