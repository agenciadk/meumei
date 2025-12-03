

import React, { useState, useEffect } from 'react';
import { X, CreditCard } from 'lucide-react';
import { CreditCard as CreditCardType } from '../types';

interface NewCreditCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: CreditCardType) => void;
  initialData?: CreditCardType | null;
}

const CARD_BRANDS = ['Visa', 'Mastercard', 'Elo', 'Amex', 'Hipercard', 'Outros'];

const NewCreditCardModal: React.FC<NewCreditCardModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('Visa');
  const [closingDay, setClosingDay] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [limit, setLimit] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setBrand(initialData.brand || 'Visa');
        setClosingDay(initialData.closingDay.toString());
        setDueDay(initialData.dueDay.toString());
        setLimit(initialData.limit ? initialData.limit.toString() : '');
      } else {
        setName('');
        setBrand('Visa');
        setClosingDay('');
        setDueDay('');
        setLimit('');
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name || !closingDay || !dueDay) return;
    
    onSave({
      id: initialData?.id || '',
      name,
      brand,
      closingDay: parseInt(closingDay),
      dueDay: parseInt(dueDay),
      limit: parseFloat(limit) || 0
    });
  };

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} aria-hidden="true" />

        <div className="relative w-full max-w-2xl transform rounded-2xl bg-white dark:bg-[#1a1a1a] text-left shadow-xl transition-all sm:my-8 border border-zinc-200 dark:border-zinc-800">
          
          <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <CreditCard className="text-blue-600" />
              {initialData ? 'Editar Cartão de Crédito' : 'Novo Cartão de Crédito'}
            </h2>
            <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Nome do Cartão / Instituição</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Nubank, Santander"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-zinc-400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Bandeira</label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                  >
                    {CARD_BRANDS.map(b => (
                        <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Dia de Fechamento</label>
                <input 
                  type="number" 
                  min="1"
                  max="31"
                  placeholder="Ex: 28"
                  value={closingDay}
                  onChange={(e) => setClosingDay(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-zinc-400"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Dia de Vencimento</label>
                <input 
                  type="number" 
                  min="1"
                  max="31"
                  placeholder="Ex: 13"
                  value={dueDay}
                  onChange={(e) => setDueDay(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-zinc-400"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Limite (Opcional)</label>
                <input 
                  type="number" 
                  placeholder="R$ 0,00"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-zinc-400"
                />
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3 bg-gray-50 dark:bg-[#1a1a1a] rounded-b-2xl">
              <button onClick={onClose} className="px-6 py-3 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-semibold hover:bg-white dark:hover:bg-zinc-800 transition-colors">
                  Cancelar
              </button>
              <button onClick={handleSave} className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg transition-all active:scale-95">
                  Adicionar Cartão
              </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default NewCreditCardModal;