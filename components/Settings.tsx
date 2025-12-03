

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  CreditCard, 
  Settings2, 
  Trash2, 
  Moon, 
  Sun, 
  Plus, 
  RefreshCw,
  AlertTriangle,
  Lock,
  Building2,
  Save,
  CheckCircle2,
  Palette,
  MapPin,
  Phone,
  Mail,
  Globe,
  FileText,
  Users,
  Key,
  X,
  Shield,
  User as UserIcon,
  AlertOctagon,
  Loader2,
  Pencil
} from 'lucide-react';
import { CompanyInfo, CreditCard as CreditCardType } from '../types';
import { MOCK_CREDENTIALS } from '../constants';
import NewCreditCardModal from './NewCreditCardModal';

interface SettingsProps {
  onBack: () => void;
  currentTheme: 'dark' | 'light';
  onThemeChange: (theme: 'dark' | 'light') => void;
  isAdmin: boolean;
  companyInfo: CompanyInfo;
  onUpdateCompany: (info: CompanyInfo) => void;
  onSystemReset?: () => void;
  creditCards?: CreditCardType[];
  onUpdateCreditCards?: (cards: CreditCardType[]) => void;
}

interface StoredUser {
    username: string;
    password?: string;
}

const Settings: React.FC<SettingsProps> = ({ 
    onBack, 
    currentTheme, 
    onThemeChange, 
    isAdmin, 
    companyInfo, 
    onUpdateCompany,
    onSystemReset,
    creditCards = [],
    onUpdateCreditCards
}) => {
  
  // Local state for editing company info
  const [editedInfo, setEditedInfo] = useState<CompanyInfo>(companyInfo);
  const [isSaved, setIsSaved] = useState(false);

  // User Management State
  const [usersList, setUsersList] = useState<StoredUser[]>([]);
  const [userToEdit, setUserToEdit] = useState<StoredUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [userSaveSuccess, setUserSaveSuccess] = useState(false);

  // System Reset State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetAdminUser, setResetAdminUser] = useState('');
  const [resetAdminPass, setResetAdminPass] = useState('');
  const [resetError, setResetError] = useState('');

  // Selic Fetch State
  const [isFetchingSelic, setIsFetchingSelic] = useState(false);

  // Credit Card Modal State
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCardType | null>(null);

  // Sync with prop if it changes externally (rare but safe)
  useEffect(() => {
      setEditedInfo(companyInfo);
  }, [companyInfo]);

  // Load users on mount
  useEffect(() => {
      if (isAdmin) {
          loadUsers();
      }
  }, [isAdmin]);

  const loadUsers = () => {
      try {
          const stored = localStorage.getItem('meumei_users');
          if (stored) {
              setUsersList(JSON.parse(stored));
          }
      } catch (e) {
          console.error("Erro ao carregar usuários", e);
      }
  };

  const handleInputChange = (field: keyof CompanyInfo, value: string) => {
      setEditedInfo(prev => ({ ...prev, [field]: value }));
      setIsSaved(false); // Reset saved state on edit
  };

  const handleSaveCompany = () => {
    if (editedInfo.name.trim()) {
        onUpdateCompany(editedInfo);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    }
  };

  // --- Selic Rate Handler ---
  const handleUpdateSelic = async () => {
      setIsFetchingSelic(true);
      try {
          // Using BrasilAPI which proxies official BCB data, friendly for frontend
          const response = await fetch('https://brasilapi.com.br/api/taxas/v1');
          const data = await response.json();
          
          // Data format: [{ nome: "Selic", valor: 11.75 }, ...]
          const selicData = data.find((item: any) => item.nome === 'Selic');
          
          if (selicData) {
              const newRate = parseFloat(selicData.valor);
              const updatedInfo = { ...companyInfo, selicRate: newRate };
              
              // Update local edit state
              setEditedInfo(updatedInfo);
              // Update global app state immediately
              onUpdateCompany(updatedInfo);
          } else {
              alert("Não foi possível encontrar a taxa Selic na resposta da API.");
          }
      } catch (error) {
          console.error("Erro ao buscar Selic:", error);
          alert("Erro ao conectar com o Banco Central. Tente novamente mais tarde.");
      } finally {
          setIsFetchingSelic(false);
      }
  };

  // --- User Management Handlers ---

  const handleDeleteUser = (username: string) => {
      if (confirm(`Tem certeza que deseja remover o usuário "${username}"?`)) {
          const updatedList = usersList.filter(u => u.username !== username);
          localStorage.setItem('meumei_users', JSON.stringify(updatedList));
          setUsersList(updatedList);
      }
  };

  const openEditModal = (user: StoredUser) => {
      setUserToEdit(user);
      setNewPassword(user.password || '');
      setUserSaveSuccess(false);
  };

  const handleSaveUser = () => {
      if (!userToEdit || !newPassword.trim()) return;

      const updatedList = usersList.map(u => {
          if (u.username === userToEdit.username) {
              return { ...u, password: newPassword };
          }
          return u;
      });

      localStorage.setItem('meumei_users', JSON.stringify(updatedList));
      setUsersList(updatedList);
      setUserSaveSuccess(true);
      
      // Close modal after brief delay
      setTimeout(() => {
          setUserToEdit(null);
          setNewPassword('');
          setUserSaveSuccess(false);
      }, 1000);
  };

  // --- Credit Card Handlers ---
  const handleSaveCard = (cardData: CreditCardType) => {
      if (!onUpdateCreditCards) return;
      
      let updatedCards;
      if (editingCard) {
          updatedCards = creditCards.map(c => c.id === cardData.id ? cardData : c);
      } else {
          updatedCards = [...creditCards, { ...cardData, id: Math.random().toString(36).substr(2, 9) }];
      }
      onUpdateCreditCards(updatedCards);
      setIsCardModalOpen(false);
      setEditingCard(null);
  };

  const handleDeleteCard = (cardId: string) => {
      if (!onUpdateCreditCards) return;
      if(confirm('Tem certeza que deseja remover este cartão?')) {
          const updatedCards = creditCards.filter(c => c.id !== cardId);
          onUpdateCreditCards(updatedCards);
      }
  }

  const handleOpenNewCard = () => {
      setEditingCard(null);
      setIsCardModalOpen(true);
  }

  const handleEditCard = (card: CreditCardType) => {
      setEditingCard(card);
      setIsCardModalOpen(true);
  }

  // --- System Reset Handlers ---
  
  const handleConfirmReset = () => {
    // 1. Validate Admin Credentials
    if (resetAdminUser !== MOCK_CREDENTIALS.username || resetAdminPass !== MOCK_CREDENTIALS.password) {
        setResetError('Credenciais de administrador incorretas.');
        return;
    }

    // 2. Execute Reset
    if (onSystemReset) {
        onSystemReset();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] text-zinc-900 dark:text-white font-inter pb-20 transition-colors duration-300">
      
      {/* Header - Expanded Width to Match Dashboard (max-w-7xl) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-6 flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2.5 rounded-xl bg-white dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors border border-zinc-200 dark:border-zinc-700/50 shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Gerencie as preferências e dados do sistema</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* --- SECTION 1: PREFERENCES --- */}
        <div>
            <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider mb-4 ml-1">
                Preferências Gerais
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Appearance Card */}
                <div className="bg-white dark:bg-[#151517] rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 bg-purple-100 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                                <Palette size={20} />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-zinc-900 dark:text-white">Aparência</h2>
                                <p className="text-xs text-zinc-500">Tema do sistema</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-2">
                            <button 
                                onClick={() => onThemeChange('light')}
                                className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${currentTheme === 'light' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
                            >
                                <Sun size={18} />
                                <span className="text-sm font-semibold">Claro</span>
                            </button>
                            <button 
                                onClick={() => onThemeChange('dark')}
                                className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${currentTheme === 'dark' ? 'border-purple-500 bg-purple-900/20 text-purple-400' : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
                            >
                                <Moon size={18} />
                                <span className="text-sm font-semibold">Escuro</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Credit Cards Card - RESTRICTED TO ADMIN */}
                {isAdmin && (
                    <div className="bg-white dark:bg-[#151517] rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm flex flex-col h-full">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                                    <CreditCard size={20} />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-zinc-900 dark:text-white">Cartões de Crédito</h2>
                                    <p className="text-xs text-zinc-500">Gerenciar faturas</p>
                                </div>
                            </div>
                            {/* "Ver todos" Button REMOVED here */}
                        </div>

                        {creditCards.length === 0 ? (
                            <div className="flex-1 bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-100 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center py-6 gap-3">
                                <span className="text-xs text-zinc-500 dark:text-zinc-400">Nenhum cartão ativo</span>
                                <button 
                                    onClick={handleOpenNewCard}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-lg shadow-blue-900/20"
                                >
                                    <Plus size={14} /> Novo Cartão
                                </button>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col gap-3">
                                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                                    {creditCards.map(card => (
                                        <div key={card.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-100 dark:border-zinc-800 rounded-xl">
                                            <div>
                                                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{card.name}</p>
                                                <p className="text-[10px] text-zinc-500">
                                                    {card.brand || 'Cartão'} • Fecha dia {card.closingDay}
                                                </p>
                                            </div>
                                            <div className="flex gap-1">
                                                <button onClick={() => handleEditCard(card)} className="p-1.5 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded transition-colors"><Pencil size={14} /></button>
                                                <button onClick={() => handleDeleteCard(card.id)} className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button 
                                    onClick={handleOpenNewCard}
                                    className="mt-auto w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-blue-900/20"
                                >
                                    <Plus size={16} /> Novo Cartão
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
        
        {/* ... Rest of settings component remains unchanged ... */}
        {/* --- SECTION 2: ADMINISTRATION (Restricted) --- */}
        <div>
            <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider mb-4 ml-1 flex items-center gap-2">
                Administração {isAdmin && <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 rounded">Admin</span>}
            </h3>

            {isAdmin ? (
                <div className="space-y-6">
                    
                    {/* Company Management Card */}
                    <section className="bg-white dark:bg-[#151517] rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm relative overflow-hidden">
                        
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 relative z-10 gap-4">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-xl text-amber-600 dark:text-amber-500 shadow-inner">
                                    <Building2 size={24} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Gestão da Empresa</h2>
                                    <p className="text-sm text-zinc-500">Dados cadastrais e informações do negócio.</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                {isSaved && (
                                    <span className="text-emerald-500 font-bold text-sm flex items-center gap-2 animate-in fade-in slide-in-from-right-4 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                                        <CheckCircle2 size={18} fill="currentColor" className="text-emerald-500" /> 
                                        <span className="text-emerald-600 dark:text-emerald-400">Alteração feita e salva!</span>
                                    </span>
                                )}
                                <button 
                                    onClick={handleSaveCompany}
                                    className={`px-5 py-2.5 rounded-lg font-bold text-white transition-all flex items-center gap-2 shadow-lg w-full sm:w-auto justify-center ${isSaved ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-zinc-900 dark:bg-zinc-700 hover:bg-zinc-800 dark:hover:bg-zinc-600'}`}
                                >
                                    <Save size={18} />
                                    <span>Salvar Alterações</span>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
                            {/* Company Form Fields */}
                            <div className="md:col-span-7 space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide ml-1 flex items-center gap-1.5">
                                    <Building2 size={12} /> Nome da Empresa
                                </label>
                                <input 
                                    type="text" 
                                    value={editedInfo.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-zinc-900 dark:text-white"
                                />
                            </div>
                             <div className="md:col-span-5 space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide ml-1 flex items-center gap-1.5">
                                    <FileText size={12} /> CNPJ / Documento
                                </label>
                                <input 
                                    type="text" 
                                    value={editedInfo.cnpj}
                                    onChange={(e) => handleInputChange('cnpj', e.target.value)}
                                    placeholder="00.000.000/0000-00"
                                    className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-zinc-900 dark:text-white"
                                />
                            </div>
                            <div className="md:col-span-8 space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide ml-1 flex items-center gap-1.5">
                                    <MapPin size={12} /> Endereço Completo
                                </label>
                                <input 
                                    type="text" 
                                    value={editedInfo.address}
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                    placeholder="Rua Exemplo, 123 - Bairro - Cidade/UF"
                                    className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-zinc-900 dark:text-white"
                                />
                            </div>
                            <div className="md:col-span-4 space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide ml-1 flex items-center gap-1.5">
                                    <MapPin size={12} /> CEP
                                </label>
                                <input 
                                    type="text" 
                                    value={editedInfo.zipCode || ''}
                                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                                    placeholder="00000-000"
                                    className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-zinc-900 dark:text-white"
                                />
                            </div>
                            <div className="md:col-span-4 space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide ml-1 flex items-center gap-1.5">
                                    <Phone size={12} /> Telefone / WhatsApp
                                </label>
                                <input 
                                    type="text" 
                                    value={editedInfo.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    placeholder="(00) 00000-0000"
                                    className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-zinc-900 dark:text-white"
                                />
                            </div>
                             <div className="md:col-span-4 space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide ml-1 flex items-center gap-1.5">
                                    <Mail size={12} /> E-mail
                                </label>
                                <input 
                                    type="email" 
                                    value={editedInfo.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    placeholder="contato@empresa.com"
                                    className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-zinc-900 dark:text-white"
                                />
                            </div>
                             <div className="md:col-span-4 space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide ml-1 flex items-center gap-1.5">
                                    <Globe size={12} /> Website
                                </label>
                                <input 
                                    type="text" 
                                    value={editedInfo.website}
                                    onChange={(e) => handleInputChange('website', e.target.value)}
                                    placeholder="www.site.com.br"
                                    className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-zinc-900 dark:text-white"
                                />
                            </div>
                        </div>
                    </section>

                    {/* --- USER MANAGEMENT SECTION --- */}
                    <section className="bg-white dark:bg-[#151517] rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-500 shadow-inner">
                                <Users size={24} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Gestão de Usuários</h2>
                                <p className="text-sm text-zinc-500">Controle de acesso e colaboradores.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Admin Item (Static) */}
                            <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center text-amber-800 dark:text-amber-200 font-bold">
                                        A
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-zinc-900 dark:text-white">agdk</p>
                                        <div className="flex items-center gap-1.5">
                                            <Shield size={12} className="text-amber-500" />
                                            <p className="text-xs text-amber-600 dark:text-amber-500 font-semibold uppercase">Administrador</p>
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs text-zinc-400 italic pr-2">Acesso principal</span>
                            </div>

                            {/* Registered Users List */}
                            {usersList.length > 0 ? (
                                usersList.map((user, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-100 dark:border-zinc-800 rounded-xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 font-bold">
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-zinc-900 dark:text-white">{user.username}</p>
                                                <div className="flex items-center gap-1.5">
                                                    <UserIcon size={12} className="text-purple-500" />
                                                    <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold uppercase">Colaborador</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => openEditModal(user)}
                                                className="p-2 text-zinc-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                title="Alterar Senha"
                                            >
                                                <Key size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteUser(user.username)}
                                                className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Excluir Usuário"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6 text-zinc-500 text-sm italic bg-zinc-50 dark:bg-[#1a1a1a] rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                                    Nenhum colaborador cadastrado.
                                </div>
                            )}
                        </div>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Selic Rate Configuration */}
                        <section className="bg-white dark:bg-[#151517] rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                                        <Settings2 size={20} />
                                    </div>
                                    <h2 className="text-base font-bold text-zinc-900 dark:text-white">Taxa Selic</h2>
                                </div>
                                <div className="bg-zinc-50 dark:bg-[#1a1a1a] rounded-xl p-4 border border-zinc-100 dark:border-zinc-800 mb-4">
                                     <span className="text-xs text-zinc-500 font-semibold uppercase">Atual (% a.a.)</span>
                                     <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                                        {companyInfo.selicRate?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%
                                     </div>
                                </div>
                            </div>
                            <button 
                                onClick={handleUpdateSelic}
                                disabled={isFetchingSelic}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isFetchingSelic ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} 
                                {isFetchingSelic ? 'Buscando...' : 'Atualizar Taxa'}
                            </button>
                            <p className="text-[10px] text-zinc-400 mt-2 text-center">
                                Fonte: Banco Central do Brasil
                            </p>
                        </section>

                        {/* Danger Zone */}
                        <section className="bg-white dark:bg-[#151517] rounded-2xl border border-red-100 dark:border-red-900/30 p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-20 h-full opacity-5 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#ef4444_10px,#ef4444_20px)]"></div>

                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2.5 bg-red-100 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
                                        <AlertTriangle size={20} />
                                    </div>
                                    <h2 className="text-base font-bold text-red-700 dark:text-red-400">Zona de Perigo</h2>
                                </div>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
                                    O reset apaga <strong>todos</strong> os dados financeiros, usuários e configurações. Esta ação não pode ser desfeita.
                                </p>
                            </div>
                            <button 
                                onClick={() => { setIsResetModalOpen(true); setResetError(''); setResetAdminUser(''); setResetAdminPass(''); }}
                                className="w-full bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-sm"
                            >
                                <Trash2 size={16} /> Resetar Sistema
                            </button>
                        </section>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center p-10 bg-zinc-100 dark:bg-[#1a1a1a] rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 text-zinc-500 gap-3">
                    <div className="p-4 bg-zinc-200 dark:bg-zinc-800 rounded-full">
                         <Lock size={24} />
                    </div>
                    <span className="text-sm font-medium">Configurações avançadas disponíveis apenas para Administradores.</span>
                </div>
            )}
        </div>

      </main>

      {/* ... Edit User & Reset Modals ... */}
      {/* --- EDIT USER MODAL --- */}
      {userToEdit && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 relative">
                <button 
                    onClick={() => setUserToEdit(null)}
                    className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
                >
                    <X size={20} />
                </button>
                
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">Editar Usuário</h3>
                <p className="text-sm text-zinc-500 mb-6">Alterar senha para <strong>{userToEdit.username}</strong></p>
                
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Nova Senha</label>
                        <input 
                            type="text" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-[#121212] border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-zinc-900 dark:text-white"
                        />
                    </div>
                    
                    <button 
                        onClick={handleSaveUser}
                        className={`w-full py-3 rounded-lg font-bold text-white transition-all shadow-lg ${userSaveSuccess ? 'bg-emerald-600' : 'bg-purple-600 hover:bg-purple-700'}`}
                    >
                        {userSaveSuccess ? 'Salvo com Sucesso!' : 'Salvar Alterações'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- SYSTEM RESET SECURITY MODAL --- */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-red-950/80 backdrop-blur-md animate-in fade-in zoom-in-95 duration-300">
             <div className="w-full max-w-md bg-[#1a1a1a] rounded-2xl shadow-2xl border border-red-900/50 p-0 overflow-hidden">
                
                {/* Header */}
                <div className="bg-red-900/20 p-6 flex flex-col items-center justify-center text-center border-b border-red-900/30">
                     <div className="p-4 bg-red-500/10 rounded-full mb-3 animate-pulse">
                        <AlertOctagon size={48} className="text-red-500" />
                     </div>
                     <h2 className="text-2xl font-black text-red-500 uppercase tracking-tight">Zona de Perigo</h2>
                     <p className="text-red-300/70 text-sm mt-1">Esta ação é irreversível.</p>
                </div>

                <div className="p-6">
                    <div className="bg-red-950/30 rounded-lg p-4 mb-6 border border-red-900/30">
                        <h4 className="text-sm font-bold text-red-400 mb-2 uppercase">O que será apagado?</h4>
                        <ul className="text-sm text-zinc-400 space-y-1 list-disc list-inside">
                            <li>Todos os usuários (exceto Admin)</li>
                            <li>Todas as contas bancárias e saldos</li>
                            <li>Histórico de transações financeiras</li>
                            <li>Configurações da empresa</li>
                        </ul>
                    </div>

                    <p className="text-center text-zinc-300 text-sm mb-4 font-medium">
                        Confirme suas credenciais de <strong>Administrador</strong> para continuar:
                    </p>

                    <div className="space-y-3 mb-6">
                         <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Usuário Admin</label>
                            <input 
                                type="text"
                                value={resetAdminUser}
                                onChange={(e) => setResetAdminUser(e.target.value)}
                                className="w-full bg-[#121212] border border-zinc-800 rounded-lg px-3 py-2.5 text-white focus:ring-1 focus:ring-red-500 outline-none"
                            />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Senha Admin</label>
                            <input 
                                type="password"
                                value={resetAdminPass}
                                onChange={(e) => setResetAdminPass(e.target.value)}
                                className="w-full bg-[#121212] border border-zinc-800 rounded-lg px-3 py-2.5 text-white focus:ring-1 focus:ring-red-500 outline-none"
                            />
                         </div>
                    </div>

                    {resetError && (
                        <div className="mb-4 text-center text-xs font-bold text-red-500 bg-red-950/50 py-2 rounded-lg border border-red-900/50">
                            {resetError}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button 
                            onClick={() => setIsResetModalOpen(false)}
                            className="flex-1 py-3 rounded-xl font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors text-sm"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={handleConfirmReset}
                            className="flex-[2] py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 text-sm"
                        >
                            <Trash2 size={16} /> DELETAR TUDO AGORA
                        </button>
                    </div>
                </div>

             </div>
        </div>
      )}

      <NewCreditCardModal 
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        onSave={handleSaveCard}
        initialData={editingCard}
      />

    </div>
  );
};

export default Settings;