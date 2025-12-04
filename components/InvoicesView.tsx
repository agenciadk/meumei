
// ... existing imports ...
import React, { useState, useMemo } from 'react';
import { ArrowLeft, CreditCard as CardIcon, Calendar, CheckSquare, Square, DollarSign, Wallet, AlertTriangle } from 'lucide-react';
import { Expense, CreditCard, Account } from '../types';
import PayInvoiceModal from './PayInvoiceModal';

interface InvoicesViewProps {
  onBack: () => void;
  expenses: Expense[];
  creditCards: CreditCard[];
  accounts: Account[];
  onPayInvoice: (expenseIds: string[], sourceAccountId: string, totalAmount: number) => void;
}

const InvoicesView: React.FC<InvoicesViewProps> = ({ 
  onBack, 
  expenses, 
  creditCards,
  accounts,
  onPayInvoice
}) => {
  // ... existing state ...
  const [selectedCardId, setSelectedCardId] = useState<string>(creditCards.length > 0 ? creditCards[0].id : '');
  const [selectedExpenseIds, setSelectedExpenseIds] = useState<string[]>([]);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  // Filter expenses: Must be Credit Card type, match selected card
  // Show PENDING and PAID? Usually invoices show history too, but for payment, only pending.
  // The user wants a "Hub de Conciliação". Let's show Pending by default.
  const cardExpenses = useMemo(() => {
      if (!selectedCardId) return [];
      return expenses.filter(exp => 
          exp.cardId === selectedCardId && 
          exp.paymentMethod === 'Crédito' &&
          exp.status === 'pending' // Only open items for payment
      ).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [expenses, selectedCardId]);

  // Group expenses by Due Month (Invoice Cycle)
  const groupedExpenses = useMemo(() => {
      const groups: Record<string, Expense[]> = {};
      
      cardExpenses.forEach(exp => {
          // Use T12:00:00 to avoid timezone shift when getting month
          // We group by DUE DATE because that defines the Invoice
          const date = new Date(exp.dueDate + 'T12:00:00');
          // Key format: YYYY-MM
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (!groups[key]) groups[key] = [];
          groups[key].push(exp);
      });

      // Sort keys (months) ascending
      return Object.keys(groups).sort().reduce((obj, key) => {
          obj[key] = groups[key];
          return obj;
      }, {} as Record<string, Expense[]>);
  }, [cardExpenses]);

  // ... rest of logic ...
  // Calculation for Selected Items
  const selectedTotal = cardExpenses
      .filter(exp => selectedExpenseIds.includes(exp.id))
      .reduce((sum, exp) => sum + exp.amount, 0);

  const selectedCard = creditCards.find(c => c.id === selectedCardId);

  // Handlers
  const toggleSelection = (id: string) => {
      setSelectedExpenseIds(prev => 
          prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
  };

  const toggleSelectMonth = (monthKey: string) => {
      const idsInMonth = groupedExpenses[monthKey].map(e => e.id);
      const allSelected = idsInMonth.every(id => selectedExpenseIds.includes(id));

      if (allSelected) {
          // Deselect all in this month
          setSelectedExpenseIds(prev => prev.filter(id => !idsInMonth.includes(id)));
      } else {
          // Select all in this month (merging unique)
          const newIds = [...new Set([...selectedExpenseIds, ...idsInMonth])];
          setSelectedExpenseIds(newIds);
      }
  };

  const handleConfirmPayment = (accountId: string, paymentDate: string) => {
      onPayInvoice(selectedExpenseIds, accountId, selectedTotal);
      setSelectedExpenseIds([]); // Clear selection
      setIsPayModalOpen(false);
  };

  // Helper to format Month Key (YYYY-MM) to readable string
  const formatMonthKey = (key: string) => {
      const [year, month] = key.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] text-zinc-900 dark:text-white font-inter pb-20 transition-colors duration-300">
      
      {/* Top Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-6 relative z-10 -mt-2">
          <button 
             onClick={onBack}
             className="mb-6 flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
          >
              <ArrowLeft size={16} /> Voltar ao Dashboard
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                  <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-3">
                      <CardIcon className="text-rose-600 dark:text-rose-500" />
                      Faturas de Cartão
                  </h1>
                  <p className="text-zinc-500 dark:text-zinc-400">
                      Conciliação e pagamento de faturas em aberto.
                  </p>
              </div>

              {/* Card Selector */}
              <div className="w-full md:w-auto min-w-[250px]">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-1 block">Selecione o Cartão</label>
                  <div className="relative">
                      <select 
                          value={selectedCardId}
                          onChange={(e) => { setSelectedCardId(e.target.value); setSelectedExpenseIds([]); }}
                          className="w-full appearance-none bg-white dark:bg-[#151517] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium shadow-sm"
                      >
                          {creditCards.map(card => (
                              <option key={card.id} value={card.id}>{card.name}</option>
                          ))}
                          {creditCards.length === 0 && <option value="">Nenhum cartão cadastrado</option>}
                      </select>
                      <CardIcon className="absolute right-4 top-3.5 text-zinc-400 pointer-events-none" size={18} />
                  </div>
              </div>
          </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* RECONCILIATION BAR (Sticky/Fixed possibility, but kept inline for simplicity) */}
        <div className="bg-white dark:bg-[#151517] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm sticky top-4 z-40 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl text-rose-600 dark:text-rose-500">
                    <CheckSquare size={24} />
                </div>
                <div>
                    <p className="text-xs font-bold text-zinc-500 uppercase">Total Selecionado</p>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                        R$ {selectedTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-zinc-400">{selectedExpenseIds.length} itens marcados</p>
                </div>
            </div>

            <button 
                onClick={() => setIsPayModalOpen(true)}
                disabled={selectedExpenseIds.length === 0}
                className={`
                    w-full sm:w-auto px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg
                    ${selectedExpenseIds.length > 0 
                        ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-900/20 active:scale-95' 
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'}
                `}
            >
                <DollarSign size={20} />
                Pagar Fatura
            </button>
        </div>

        {/* Invoice Lists Grouped by Month */}
        {Object.keys(groupedExpenses).length > 0 ? (
            Object.entries(groupedExpenses).map(([monthKey, expensesList]) => {
                const totalMonth = expensesList.reduce((acc, curr) => acc + curr.amount, 0);
                const allSelected = expensesList.every(e => selectedExpenseIds.includes(e.id));
                const partialSelected = expensesList.some(e => selectedExpenseIds.includes(e.id)) && !allSelected;

                return (
                    <div key={monthKey} className="bg-white dark:bg-[#151517] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                        
                        {/* Month Header */}
                        <div className="bg-zinc-50 dark:bg-[#1a1a1a] p-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => toggleSelectMonth(monthKey)}
                                    className="text-zinc-400 hover:text-rose-600 transition-colors"
                                >
                                    {allSelected ? <CheckSquare size={20} className="text-rose-600" /> : 
                                     partialSelected ? <div className="w-5 h-5 border-2 border-rose-600 rounded flex items-center justify-center"><div className="w-2.5 h-2.5 bg-rose-600 rounded-sm"></div></div> :
                                     <Square size={20} />}
                                </button>
                                <div>
                                    <h3 className="font-bold text-zinc-800 dark:text-zinc-200 capitalize flex items-center gap-2">
                                        <Calendar size={16} className="text-rose-500" />
                                        Fatura: {formatMonthKey(monthKey)}
                                    </h3>
                                </div>
                            </div>
                            <span className="text-sm font-bold text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 px-3 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
                                Total: R$ {totalMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                        </div>

                        {/* Transactions List */}
                        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {expensesList.map(exp => {
                                const isSelected = selectedExpenseIds.includes(exp.id);
                                return (
                                    <div 
                                        key={exp.id} 
                                        onClick={() => toggleSelection(exp.id)}
                                        className={`flex items-center justify-between p-4 cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50 ${isSelected ? 'bg-rose-50/50 dark:bg-rose-900/10' : ''}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`text-zinc-300 ${isSelected ? 'text-rose-600' : ''}`}>
                                                {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                                            </div>
                                            <div>
                                                <p className="font-medium text-zinc-900 dark:text-white text-sm">{exp.description}</p>
                                                <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                                                    <span>{new Date(exp.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                                                    <span>•</span>
                                                    <span className="bg-zinc-100 dark:bg-zinc-800 px-1.5 rounded text-[10px] uppercase tracking-wide">{exp.category}</span>
                                                    {exp.installments && (
                                                        <span className="text-rose-500 font-bold ml-1">
                                                            {exp.installmentNumber}/{exp.totalInstallments}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-zinc-900 dark:text-white">
                                                R$ {exp.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </p>
                                            <p className="text-[10px] text-zinc-400">
                                                Vence: {new Date(exp.dueDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })
        ) : (
            <div className="text-center py-20 bg-white dark:bg-[#151517] rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400">
                    <CardIcon size={32} />
                </div>
                {selectedCardId ? (
                    <>
                        <h3 className="text-zinc-900 dark:text-white font-bold mb-1">Tudo em dia!</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Não há despesas pendentes para o cartão selecionado.</p>
                    </>
                ) : (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Selecione um cartão para visualizar as faturas.</p>
                )}
            </div>
        )}

      </main>

      <PayInvoiceModal 
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        totalAmount={selectedTotal}
        selectedCount={selectedExpenseIds.length}
        accounts={accounts}
        selectedCard={selectedCard || null}
        onConfirmPayment={handleConfirmPayment}
      />

    </div>
  );
};

export default InvoicesView;
