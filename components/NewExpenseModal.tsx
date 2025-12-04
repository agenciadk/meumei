
import React, { useState, useEffect } from 'react';
import { X, Calendar, Edit2, Plus, CreditCard, Home, ShoppingCart, User } from 'lucide-react';
import { Expense, Account, CreditCard as CreditCardType, ExpenseType } from '../types';

interface NewExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: any) => void;
  initialData?: Expense | null;
  accounts: Account[];
  creditCards: CreditCardType[];
  categories: string[]; 
  expenseType: ExpenseType; // Prop para identificar o tipo e ajustar o layout
  themeColor?: 'indigo' | 'amber' | 'cyan' | 'pink'; // Prop para cor do tema
}

const DEFAULT_CATEGORIES = [
    'Alimentação', 'Assinatura', 'Cenário', 'Equipamentos', 'Logística', 'Materiais', 'Plantas', 'Revelação', 'Tráfego Pago', 'Moradia', 'Transporte', 'Saúde', 'Lazer'
];

const NewExpenseModal: React.FC<NewExpenseModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData, 
  accounts,
  creditCards,
  expenseType,
  themeColor = 'indigo'
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [date, setDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Débito');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [selectedCardId, setSelectedCardId] = useState('');
  const [status, setStatus] = useState<'pending' | 'paid'>('pending');
  const [notes, setNotes] = useState('');
  
  // Installments State
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentCount, setInstallmentCount] = useState(2);
  const [installmentValueType, setInstallmentValueType] = useState<'parcel' | 'total'>('parcel');

  // Installment Dates Summary
  const [firstInstallmentDate, setFirstInstallmentDate] = useState('');
  const [lastInstallmentDate, setLastInstallmentDate] = useState('');

  // Helper for dynamic UI based on type
  const getModalConfig = () => {
      switch(expenseType) {
          case 'fixed': 
              return { 
                  title: 'Nova Despesa Fixa', 
                  icon: <Home className="text-amber-600 dark:text-amber-400" />,
                  colorClass: 'text-amber-600 focus:ring-amber-500',
                  btnClass: 'bg-amber-600 hover:bg-amber-700 shadow-amber-900/20'
              };
          case 'personal': 
              return { 
                  title: 'Nova Despesa Pessoal', 
                  icon: <User className="text-cyan-600 dark:text-cyan-400" />,
                  colorClass: 'text-cyan-600 focus:ring-cyan-500',
                  btnClass: 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-900/20'
              };
          case 'variable':
          default: 
              return { 
                  title: 'Nova Despesa Variável', 
                  icon: <ShoppingCart className="text-pink-600 dark:text-pink-400" />,
                  colorClass: 'text-pink-600 focus:ring-pink-500',
                  btnClass: 'bg-pink-600 hover:bg-pink-700 shadow-pink-900/20'
              };
      }
  };
  
  const config = getModalConfig();

  useEffect(() => {
    if (isOpen) {
        if (initialData) {
            setDescription(initialData.description);
            setAmount(initialData.amount.toString());
            setCategory(initialData.category);
            setDate(initialData.date);
            setDueDate(initialData.dueDate);
            setPaymentMethod(initialData.paymentMethod);
            setSelectedAccountId(initialData.accountId || '');
            setSelectedCardId(initialData.cardId || '');
            setStatus(initialData.status);
            setNotes(initialData.notes || '');
            setIsInstallment(false);
        } else {
            // Reset form
            setDescription('');
            setAmount('');
            setCategory(DEFAULT_CATEGORIES[0]);
            const today = new Date().toISOString().split('T')[0];
            setDate(today);
            setDueDate(today);
            setPaymentMethod('Débito');
            setSelectedAccountId(accounts.length > 0 ? accounts[0].id : '');
            setSelectedCardId(creditCards.length > 0 ? creditCards[0].id : '');
            setStatus('pending');
            setNotes('');
            setIsInstallment(false);
            setInstallmentCount(2);
            setInstallmentValueType('parcel');
        }
    }
  }, [isOpen, initialData, accounts, creditCards]);

  // --- Auto-Calculate Due Date for Credit Cards ---
  useEffect(() => {
      if (paymentMethod === 'Crédito' && selectedCardId && date) {
          const card = creditCards.find(c => c.id === selectedCardId);
          if (card) {
              const launchDate = new Date(date + 'T12:00:00'); 
              const closingDay = card.closingDay;
              const dueDay = card.dueDay;
              
              const launchDay = launchDate.getDate();
              let targetMonth = new Date(launchDate);

              if (launchDay >= closingDay) {
                  targetMonth.setMonth(targetMonth.getMonth() + 1);
              }

              targetMonth.setMonth(targetMonth.getMonth() + 1);
              targetMonth.setDate(dueDay);
              
              setDueDate(targetMonth.toISOString().split('T')[0]);
              setStatus('pending'); 
          }
      }
  }, [paymentMethod, selectedCardId, date, creditCards]);

  // --- Calculate Installment Dates Summary ---
  useEffect(() => {
      if (isInstallment && installmentCount > 0 && dueDate) {
          const firstDate = new Date(dueDate + 'T12:00:00');
          const lastDate = new Date(firstDate);
          lastDate.setMonth(lastDate.getMonth() + (installmentCount - 1));

          setFirstInstallmentDate(firstDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
          setLastInstallmentDate(lastDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
      } else {
          setFirstInstallmentDate('');
          setLastInstallmentDate('');
      }
  }, [isInstallment, installmentCount, dueDate]);


  if (!isOpen) return null;

  const isCredit = paymentMethod === 'Crédito';

  // --- Installment Logic ---
  const numericAmount = parseFloat(amount.replace(',', '.')) || 0;
  let finalTotal = 0;
  let installmentValue = 0;

  if (isInstallment) {
      if (installmentValueType === 'parcel') {
          installmentValue = numericAmount;
          finalTotal = numericAmount * installmentCount;
      } else {
          finalTotal = numericAmount;
          installmentValue = numericAmount / installmentCount;
      }
  }

  const handleSave = () => {
      if (!description || !amount || !date) return;

      const baseExpense = {
          id: initialData?.id,
          description,
          category,
          date,
          paymentMethod,
          accountId: !isCredit ? selectedAccountId : undefined,
          cardId: isCredit ? selectedCardId : undefined,
          status,
          notes,
      };

      if (isCredit && isInstallment && !initialData) {
          // GENERATE MULTIPLE EXPENSES
          const groupId = Math.random().toString(36).substr(2, 9);
          const expensesToSave = [];
          
          for (let i = 0; i < installmentCount; i++) {
              const baseDue = new Date(dueDate + 'T12:00:00');
              baseDue.setMonth(baseDue.getMonth() + i);
              const specificDueDate = baseDue.toISOString().split('T')[0];

              expensesToSave.push({
                  ...baseExpense,
                  id: Math.random().toString(36).substr(2, 9), 
                  amount: installmentValue,
                  dueDate: specificDueDate,
                  installments: true,
                  installmentNumber: i + 1,
                  totalInstallments: installmentCount,
                  installmentGroupId: groupId,
                  description: `${description} (${i+1}/${installmentCount})`
              });
          }
          onSave(expensesToSave); 
      } else {
          onSave({
              ...baseExpense,
              amount: parseFloat(amount.replace(',', '.')),
              dueDate: isCredit ? dueDate : date, 
          });
      }
      onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} aria-hidden="true" />

        <div className="relative w-full max-w-2xl transform rounded-2xl bg-white dark:bg-[#1a1a1a] text-left shadow-xl transition-all sm:my-8 border border-zinc-200 dark:border-zinc-800">
          
          <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className={`text-xl font-bold flex items-center gap-2 ${config.colorClass.split(' ')[0]} dark:text-white`}>
              {config.icon}
              {initialData ? 'Editar Despesa' : config.title}
            </h2>
            <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Fornecedor / Nome</label>
              <input 
                type="text" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Aluguel, Supermercado, Netflix..."
                className={`w-full bg-gray-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 ${config.colorClass} transition-all`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Valor (R$)</label>
                    <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0,00"
                        className={`w-full bg-gray-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 ${config.colorClass} transition-all`}
                    />
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Categoria</label>
                    </div>
                    <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className={`w-full bg-gray-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 ${config.colorClass} transition-all appearance-none`}
                    >
                        {DEFAULT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Data de lançamento</label>
                <div className="relative">
                    <input 
                        type="date" 
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className={`w-full bg-gray-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 ${config.colorClass} transition-all [color-scheme:dark]`}
                    />
                    <Calendar className="absolute right-4 top-3 text-zinc-400 pointer-events-none" size={20} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Conta de Pagamento</label>
                    <select 
                        value={isCredit ? selectedCardId : selectedAccountId}
                        onChange={(e) => isCredit ? setSelectedCardId(e.target.value) : setSelectedAccountId(e.target.value)}
                        className={`w-full bg-gray-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 ${config.colorClass} transition-all appearance-none`}
                    >
                        {isCredit ? (
                            creditCards.length > 0 ? (
                                creditCards.map(card => <option key={card.id} value={card.id}>{card.name}</option>)
                            ) : (
                                <option value="">Nenhum cartão cadastrado</option>
                            )
                        ) : (
                            accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)
                        )}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Forma de Pagamento</label>
                    <select 
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className={`w-full bg-gray-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 ${config.colorClass} transition-all appearance-none`}
                    >
                        <option>Débito</option>
                        <option>Crédito</option>
                        <option>PIX</option>
                        <option>Boleto</option>
                        <option>Transferência</option>
                        <option>Dinheiro</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Status</label>
                    <select 
                        value={status}
                        onChange={(e) => setStatus(e.target.value as 'pending' | 'paid')}
                        disabled={isCredit} 
                        className={`w-full bg-gray-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 ${config.colorClass} transition-all appearance-none disabled:opacity-50`}
                    >
                        <option value="pending">Pendente</option>
                        <option value="paid">Pago</option>
                    </select>
                </div>
                
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Data de Vencimento</label>
                    <div className="relative">
                        <input 
                            type="date" 
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            disabled={isCredit} 
                            className={`w-full bg-gray-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 ${config.colorClass} transition-all [color-scheme:dark] disabled:opacity-50`}
                        />
                        <Calendar className="absolute right-4 top-3 text-zinc-400 pointer-events-none" size={20} />
                    </div>
                </div>
            </div>

            {isCredit && (
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4 space-y-4">
                    <div className="flex items-center gap-2">
                        <input 
                            type="checkbox" 
                            id="installments" 
                            checked={isInstallment} 
                            onChange={(e) => setIsInstallment(e.target.checked)}
                            className="w-4 h-4 rounded border-zinc-600 bg-transparent text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="installments" className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Compra parcelada?</label>
                    </div>

                    {isInstallment && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Número de parcelas</label>
                                <input 
                                    type="number" 
                                    min="2"
                                    max="99"
                                    value={installmentCount}
                                    onChange={(e) => setInstallmentCount(parseInt(e.target.value))}
                                    className="w-full bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Valor informado é:</label>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="radio" 
                                            id="val_parcel" 
                                            name="val_type"
                                            checked={installmentValueType === 'parcel'}
                                            onChange={() => setInstallmentValueType('parcel')}
                                            className="text-blue-600 focus:ring-blue-500"
                                        />
                                        <label htmlFor="val_parcel" className="text-sm text-zinc-700 dark:text-zinc-300">Valor da parcela</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="radio" 
                                            id="val_total" 
                                            name="val_type"
                                            checked={installmentValueType === 'total'}
                                            onChange={() => setInstallmentValueType('total')}
                                            className="text-blue-600 focus:ring-blue-500"
                                        />
                                        <label htmlFor="val_total" className="text-sm text-zinc-700 dark:text-zinc-300">Valor total</label>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-[#1a1a1a] rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
                                <p className="text-xs font-bold text-zinc-500 uppercase mb-1">Resumo do parcelamento:</p>
                                <p className="text-lg font-bold text-zinc-900 dark:text-white">
                                    {installmentCount}x de R$ {installmentValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                                </p>
                                <p className="text-sm text-zinc-500 mb-2">
                                    Valor total: R$ {finalTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                                </p>
                                {firstInstallmentDate && lastInstallmentDate && (
                                    <div className="flex justify-between text-xs text-blue-500 font-medium bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                                        <span>1ª: {firstInstallmentDate}</span>
                                        <span>...</span>
                                        <span>{installmentCount}ª: {lastInstallmentDate}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Observações</label>
              <textarea 
                rows={3}
                placeholder="Informações adicionais..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={`w-full bg-gray-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 ${config.colorClass} transition-all placeholder:text-zinc-400 resize-none`}
              />
            </div>

          </div>

          <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3 bg-white dark:bg-[#1a1a1a] rounded-b-2xl">
              <button onClick={onClose} className="px-6 py-3 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                  Cancelar
              </button>
              <button onClick={handleSave} className={`px-6 py-3 rounded-lg text-white font-bold transition-all active:scale-95 ${config.btnClass}`}>
                  Adicionar Despesa
              </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default NewExpenseModal;
