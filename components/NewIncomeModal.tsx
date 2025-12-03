

import React, { useState, useEffect } from 'react';
import { X, Calendar, Plus, Edit2, Trash2 } from 'lucide-react';
import { Income, Account } from '../types';

interface NewIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (income: any) => void;
  initialData?: Income | null;
  accounts: Account[];
  categories: string[];
  onUpdateCategories: (categories: string[]) => void;
}

const NewIncomeModal: React.FC<NewIncomeModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData, 
  accounts,
  categories,
  onUpdateCategories
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [status, setStatus] = useState<'pending' | 'received'>('received');
  const [notes, setNotes] = useState('');

  // Category Management State
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Installment (Boleto Parcelado) State
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentCount, setInstallmentCount] = useState(2);
  // 'parcel' = value entered is per parcel
  // 'total' = value entered is total amount (divide by count)
  const [installmentValueType, setInstallmentValueType] = useState<'parcel' | 'total'>('total'); 
  
  // Installment Dates Summary
  const [lastInstallmentDate, setLastInstallmentDate] = useState('');

  useEffect(() => {
    if (isOpen) {
        // Set default category if none selected
        if (!category && categories.length > 0) {
            setCategory(categories[0]);
        }

        if (initialData) {
            setDescription(initialData.description);
            setAmount(initialData.amount.toString());
            setCategory(initialData.category);
            setDate(initialData.date);
            setSelectedAccountId(initialData.accountId);
            setStatus(initialData.status);
            setNotes(initialData.notes || '');
            setIsInstallment(false); // Edit mode doesn't support transforming to installments easily yet
        } else {
            // Reset form
            setDescription('');
            setAmount('');
            setCategory(categories.length > 0 ? categories[0] : '');
            const today = new Date().toISOString().split('T')[0];
            setDate(today);
            setSelectedAccountId(accounts.length > 0 ? accounts[0].id : '');
            setStatus('received');
            setNotes('');
            setIsInstallment(false);
            setInstallmentCount(2);
            setInstallmentValueType('total'); // Default to splitting total value
        }
    } else {
        // Reset local UI states on close
        setIsManagingCategories(false);
        setNewCategoryName('');
    }
  }, [isOpen, initialData, accounts, categories]);

  // Calculate Last Installment Date for preview
  useEffect(() => {
    if (isInstallment && installmentCount > 0 && date) {
        const firstDate = new Date(date + 'T12:00:00');
        const lastDate = new Date(firstDate);
        lastDate.setMonth(lastDate.getMonth() + (installmentCount - 1));
        setLastInstallmentDate(lastDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }));
    } else {
        setLastInstallmentDate('');
    }
  }, [isInstallment, installmentCount, date]);

  if (!isOpen) return null;

  // --- Category Management Logic ---
  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
        const trimmed = newCategoryName.trim();
        if (!categories.includes(trimmed)) {
            const newCats = [...categories, trimmed];
            onUpdateCategories(newCats);
            setCategory(trimmed);
            setNewCategoryName('');
        }
    }
  };

  const handleDeleteCategory = (catToDelete: string) => {
    if (categories.length <= 1) {
        alert("É necessário ter pelo menos uma categoria.");
        return;
    }
    const newCats = categories.filter(c => c !== catToDelete);
    onUpdateCategories(newCats);
    if (category === catToDelete) {
        setCategory(newCats[0]);
    }
  };

  // --- Calculations for Installments ---
  const numericAmount = parseFloat(amount.replace(',', '.')) || 0;
  let installmentValue = 0;
  let finalTotal = 0;

  if (isInstallment) {
      if (installmentValueType === 'total') {
          finalTotal = numericAmount;
          installmentValue = numericAmount / installmentCount;
      } else {
          installmentValue = numericAmount;
          finalTotal = numericAmount * installmentCount;
      }
  }

  const handleSave = () => {
    if (!description || !amount || !date || !selectedAccountId) return;

    const baseIncome = {
        id: initialData?.id,
        description,
        category,
        date, // This date will be incremented for installments
        accountId: selectedAccountId,
        status, // Usually 'pending' for installments, but user can choose
        notes
    };

    if (isInstallment && !initialData) {
        // GENERATE MULTIPLE INCOMES
        const groupId = Math.random().toString(36).substr(2, 9);
        const incomesToSave = [];

        for (let i = 0; i < installmentCount; i++) {
            const currentDate = new Date(date + 'T12:00:00');
            currentDate.setMonth(currentDate.getMonth() + i);
            const specificDate = currentDate.toISOString().split('T')[0];

            incomesToSave.push({
                ...baseIncome,
                id: Math.random().toString(36).substr(2, 9),
                amount: installmentValue,
                date: specificDate,
                installments: true,
                installmentNumber: i + 1,
                totalInstallments: installmentCount,
                installmentGroupId: groupId,
                description: `${description} (${i+1}/${installmentCount})`,
                status: 'pending' // Force pending for future installments usually? Or keep user selection. 
                                  // Prompt says: status inicial "Pendente (A receber)".
                                  // We will force 'pending' for installments as per instructions.
            });
        }
        onSave(incomesToSave); 
    } else {
        // Single Income
        onSave({
            ...baseIncome,
            amount: parseFloat(amount.replace(',', '.')),
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
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                {initialData ? 'Editar Entrada' : 'Nova Entrada'}
            </h2>
            <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Descrição / Origem</label>
              <input 
                type="text" 
                placeholder="Ex: Pagamento Cliente X, Venda Loja"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Valor (R$)</label>
                    <input 
                        type="number" 
                        placeholder="0,00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-emerald-600 dark:text-emerald-400"
                    />
                </div>
                
                {/* Dynamic Category Section */}
                <div className="space-y-2 relative">
                    <div className="flex justify-between items-center h-4 mb-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Categoria</label>
                        <button 
                            type="button"
                            onClick={() => setIsManagingCategories(!isManagingCategories)}
                            className="text-[10px] font-bold flex items-center gap-1 text-emerald-500 hover:text-emerald-400 transition-colors"
                        >
                           {isManagingCategories ? 'Fechar Edição' : <><Edit2 size={10} /> Editar / <Plus size={10} /> Nova</>}
                        </button>
                    </div>
                    
                    {isManagingCategories ? (
                         <div className="absolute top-8 left-0 right-0 z-[60] bg-zinc-50 dark:bg-[#202020] border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 shadow-lg">
                            <div className="flex gap-2 mb-3">
                                <input 
                                    autoFocus
                                    type="text" 
                                    placeholder="Nova categoria..."
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                                    className="flex-1 bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                                <button 
                                    onClick={handleAddCategory}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-md"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                            <div className="max-h-32 overflow-y-auto custom-scrollbar space-y-1">
                                {categories.map(cat => (
                                    <div key={cat} className="flex justify-between items-center px-2 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded">
                                        <span className="text-sm text-zinc-700 dark:text-zinc-300">{cat}</span>
                                        <button onClick={() => handleDeleteCategory(cat)} className="text-red-500 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                         </div>
                    ) : (
                        <select 
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none"
                        >
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">
                        {isInstallment ? 'Data da 1ª Parcela' : 'Data de Recebimento'}
                    </label>
                    <div className="relative">
                        <input 
                            type="date" 
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all [color-scheme:dark]"
                        />
                        <Calendar className="absolute right-4 top-3 text-zinc-400 pointer-events-none" size={20} />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Conta de Destino</label>
                    <select 
                        value={selectedAccountId}
                        onChange={(e) => setSelectedAccountId(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none"
                    >
                        {accounts.length === 0 && <option value="">Nenhuma conta cadastrada</option>}
                        {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                    </select>
                </div>
            </div>

            {/* Installment / Boleto Section */}
            {!initialData && (
                <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-4 space-y-4">
                    <div className="flex items-center gap-2">
                        <input 
                            type="checkbox" 
                            id="installments_income" 
                            checked={isInstallment} 
                            onChange={(e) => setIsInstallment(e.target.checked)}
                            className="w-4 h-4 rounded border-zinc-600 bg-transparent text-emerald-600 focus:ring-emerald-500"
                        />
                        <label htmlFor="installments_income" className="text-sm font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer">
                            Entrada Parcelada / Boleto Parcelado
                        </label>
                    </div>

                    {isInstallment && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Quantidade de parcelas</label>
                                <input 
                                    type="number" 
                                    min="2"
                                    max="60"
                                    value={installmentCount}
                                    onChange={(e) => setInstallmentCount(parseInt(e.target.value))}
                                    className="w-full bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">O valor informado acima é:</label>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="radio" 
                                            id="val_total_inc" 
                                            name="val_type_inc"
                                            checked={installmentValueType === 'total'}
                                            onChange={() => setInstallmentValueType('total')}
                                            className="text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <label htmlFor="val_total_inc" className="text-sm text-zinc-700 dark:text-zinc-300">Valor Total (será dividido)</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="radio" 
                                            id="val_parcel_inc" 
                                            name="val_type_inc"
                                            checked={installmentValueType === 'parcel'}
                                            onChange={() => setInstallmentValueType('parcel')}
                                            className="text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <label htmlFor="val_parcel_inc" className="text-sm text-zinc-700 dark:text-zinc-300">Valor da Parcela</label>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-[#1a1a1a] rounded-lg p-4 border border-zinc-200 dark:border-zinc-800">
                                <p className="text-xs font-bold text-zinc-500 uppercase mb-1">Resumo do parcelamento:</p>
                                <p className="text-lg font-bold text-zinc-900 dark:text-white">
                                    {installmentCount}x de R$ {installmentValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                                </p>
                                <p className="text-sm text-zinc-500 mb-2">
                                    Valor Total da Venda: R$ {finalTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                                </p>
                                {date && lastInstallmentDate && (
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                        Última parcela em: {lastInstallmentDate}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!isInstallment && (
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Status</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 w-full hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                            <input 
                                type="radio" 
                                name="status" 
                                value="received" 
                                checked={status === 'received'}
                                onChange={() => setStatus('received')}
                                className="text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-sm font-medium text-zinc-900 dark:text-white">Recebido</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 w-full hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                            <input 
                                type="radio" 
                                name="status" 
                                value="pending" 
                                checked={status === 'pending'}
                                onChange={() => setStatus('pending')}
                                className="text-amber-500 focus:ring-amber-500"
                            />
                            <span className="text-sm font-medium text-zinc-900 dark:text-white">Pendente</span>
                        </label>
                    </div>
                </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Observações</label>
              <textarea 
                rows={3}
                placeholder="Detalhes adicionais..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-zinc-400 resize-none"
              />
            </div>

          </div>

          <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3 bg-white dark:bg-[#1a1a1a] rounded-b-2xl">
              <button onClick={onClose} className="px-6 py-3 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                  Cancelar
              </button>
              <button onClick={handleSave} className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-900/20 transition-all active:scale-95">
                  Confirmar Entrada
              </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default NewIncomeModal;