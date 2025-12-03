
import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { Account } from '../types';

interface NewAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: any) => void;
  initialData?: Account | null;
  accountTypes: string[];
  onUpdateAccountTypes: (types: string[]) => void;
}

const NewAccountModal: React.FC<NewAccountModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData, 
  accountTypes, 
  onUpdateAccountTypes 
}) => {
  const [accountName, setAccountName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  
  // Account Types now come from props
  const [selectedType, setSelectedType] = useState('');
  
  // UI States
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isManagingTypes, setIsManagingTypes] = useState(false);
  const [newTypeInputValue, setNewTypeInputValue] = useState('');
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Reset or Populate state
  useEffect(() => {
    if (isOpen) {
        if (initialData) {
            setAccountName(initialData.name);
            setInitialBalance(initialData.initialBalance.toString());
            setSelectedType(initialData.type);
        } else {
            setAccountName('');
            setInitialBalance('');
            setSelectedType('');
        }
    } else {
        setIsManagingTypes(false);
        setIsDropdownOpen(false);
        setNewTypeInputValue('');
    }
  }, [isOpen, initialData]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleDeleteType = (typeToDelete: string) => {
    if (accountTypes.length <= 1) {
      alert("É necessário ter pelo menos um tipo de conta.");
      return;
    }
    const newTypes = accountTypes.filter(t => t !== typeToDelete);
    onUpdateAccountTypes(newTypes);
    
    if (selectedType === typeToDelete) {
      setSelectedType('');
    }
  };

  const handleAddType = () => {
    if (newTypeInputValue.trim()) {
      const newType = newTypeInputValue.trim();
      if (!accountTypes.includes(newType)) {
          onUpdateAccountTypes([...accountTypes, newType]);
          setNewTypeInputValue('');
      }
    }
  };

  const handleSave = () => {
    if (!accountName || !selectedType) return;
    
    onSave({
      id: initialData?.id, // Pass ID if editing
      name: accountName,
      balance: parseFloat(initialBalance.replace(',', '.')) || 0,
      type: selectedType
    });
    onClose();
  };

  return (
    // Outer container handles scrolling if modal is too tall
    // IMPORTANT: overflow-y-auto is here, not on the body of the app, to allow scrolling of tall modals
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} aria-hidden="true" />

        {/* Modal Panel */}
        <div className="relative w-full max-w-2xl transform rounded-2xl bg-white dark:bg-[#1a1a1a] text-left shadow-xl transition-all sm:my-8 border border-zinc-200 dark:border-zinc-800 overflow-visible">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800 rounded-t-2xl bg-white dark:bg-[#1a1a1a] relative z-20">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              {initialData ? 'Editar Conta' : 'Nova Conta Financeira'}
            </h2>
            <button 
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body - Overflow Visible so dropdowns can spill out */}
          <div className="p-6 space-y-6 relative z-30">
            
            {/* Account Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Nome da Conta</label>
              <input 
                type="text" 
                placeholder="Ex: Nubank, Banco Inter"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-zinc-400"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Initial Balance */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Saldo Inicial (R$)</label>
                <input 
                  type="number" 
                  placeholder="0,00"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-zinc-400"
                />
              </div>

              {/* Account Type Section */}
              <div className="space-y-2 relative">
                  {/* Label Row with Toggle Button */}
                  <div className="flex justify-between items-center h-4">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Tipo de Conta</label>
                      <button
                          type="button"
                          onClick={() => setIsManagingTypes(!isManagingTypes)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors ${
                              isManagingTypes
                              ? 'border border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                              : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40'
                          }`}
                      >
                          {isManagingTypes ? 'Concluir Edição' : 'Editar / + Nova'}
                      </button>
                  </div>

                  {isManagingTypes ? (
                      // Management UI
                      <div className="absolute top-6 left-0 right-0 z-[60] bg-blue-50/95 dark:bg-[#1a1a1a] border border-blue-200 dark:border-blue-900/50 rounded-xl p-3 shadow-lg backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
                           {/* Input Row */}
                          <div className="flex gap-2 mb-3">
                              <input
                                  autoFocus
                                  type="text"
                                  placeholder="Digite nova opção..."
                                  value={newTypeInputValue}
                                  onChange={(e) => setNewTypeInputValue(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleAddType()}
                                  className="flex-1 bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-zinc-400"
                              />
                              <button
                                  onClick={handleAddType}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md font-bold text-sm flex items-center gap-1 transition-colors"
                              >
                                  <Plus size={16} /> Add
                              </button>
                          </div>
                          
                          {/* Scrollable List */}
                          <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                               {accountTypes.map(type => (
                                  <div key={type} className="flex items-center justify-between bg-white dark:bg-[#202020] border border-zinc-200 dark:border-zinc-700/50 p-2.5 rounded-lg group hover:border-blue-200 dark:hover:border-blue-900/50 transition-colors">
                                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{type}</span>
                                      <button
                                          onClick={() => handleDeleteType(type)}
                                          className="bg-red-50 dark:bg-red-500/10 text-red-500 p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                                          title="Excluir"
                                      >
                                          <Trash2 size={14} />
                                      </button>
                                  </div>
                               ))}
                          </div>
                      </div>
                  ) : (
                      // Standard Dropdown (Select Mode)
                      <div className="relative" ref={dropdownRef}>
                          <button 
                              type="button"
                              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                              className="w-full bg-gray-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg px-4 py-3 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-left"
                          >
                              <span className={selectedType ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'}>
                                  {selectedType || 'Selecione...'}
                              </span>
                              <ChevronDown size={20} className={`text-zinc-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>

                          {isDropdownOpen && (
                              <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white dark:bg-[#202020] border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl max-h-48 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
                                  {accountTypes.map((type) => (
                                      <button
                                          key={type}
                                          type="button"
                                          onClick={() => {
                                              setSelectedType(type);
                                              setIsDropdownOpen(false);
                                          }}
                                          className="w-full text-left px-4 py-3 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors border-b border-zinc-100 dark:border-zinc-800/50 last:border-0"
                                      >
                                          {type}
                                      </button>
                                  ))}
                              </div>
                          )}
                      </div>
                  )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3 rounded-b-2xl bg-white dark:bg-[#1a1a1a] relative z-20">
              <button 
                  onClick={onClose}
                  className="px-6 py-3 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                  Cancelar
              </button>
              <button 
                  onClick={handleSave}
                  className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-lg shadow-purple-900/20 transition-all transform active:scale-95"
              >
                  {initialData ? 'Salvar Alterações' : 'Adicionar Conta'}
              </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default NewAccountModal;
