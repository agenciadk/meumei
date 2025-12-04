
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
  Pencil,
  Calendar,
  UserPlus,
  Eye,
  EyeOff,
  CheckSquare,
  Square
} from 'lucide-react';
import { CompanyInfo, CreditCard as CreditCardType, Role, User, UserPermissions } from '../types';
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

const DEFAULT_PERMISSIONS: UserPermissions = {
    canManageIncomes: false,
    canManageExpenses: false,
    canViewBalances: false,
    canViewMeiLimit: false,
    canViewInvoices: false,
    canViewReports: false
};

const ADMIN_PERMISSIONS: UserPermissions = {
    canManageIncomes: true,
    canManageExpenses: true,
    canViewBalances: true,
    canViewMeiLimit: true,
    canViewInvoices: true,
    canViewReports: true
};

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
  const [usersList, setUsersList] = useState<User[]>([]);
  
  // --- USER MODAL STATE (Edit & Create) ---
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUserOriginalUsername, setEditingUserOriginalUsername] = useState<string | null>(null); // Track original username for edits
  
  const [formUser, setFormUser] = useState<{
      name: string;
      username: string;
      password: string;
      role: Role;
      permissions: UserPermissions;
  }>({
      name: '',
      username: '',
      password: '',
      role: 'user',
      permissions: DEFAULT_PERMISSIONS
  });
  
  const [userModalError, setUserModalError] = useState('');

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
          const response = await fetch('https://brasilapi.com.br/api/taxas/v1');
          const data = await response.json();
          const selicData = data.find((item: any) => item.nome === 'Selic');
          
          if (selicData) {
              const newRate = parseFloat(selicData.valor);
              const updatedInfo = { ...companyInfo, selicRate: newRate };
              setEditedInfo(updatedInfo);
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

  const handleOpenUserModal = (userToEdit?: User) => {
      setUserModalError('');
      if (userToEdit) {
          // Edit Mode
          setEditingUserOriginalUsername(userToEdit.username);
          setFormUser({
              name: userToEdit.name,
              username: userToEdit.username,
              password: userToEdit.password || '',
              role: userToEdit.role,
              permissions: userToEdit.permissions || DEFAULT_PERMISSIONS
          });
      } else {
          // Create Mode
          setEditingUserOriginalUsername(null);
          setFormUser({
              name: '',
              username: '',
              password: '',
              role: 'user',
              permissions: DEFAULT_PERMISSIONS
          });
      }
      setIsUserModalOpen(true);
  };

  const handleSaveUser = () => {
      setUserModalError('');

      if (!formUser.name.trim() || !formUser.username.trim() || (!editingUserOriginalUsername && !formUser.password.trim())) {
          setUserModalError('Preencha os campos obrigatórios (Senha é opcional na edição).');
          return;
      }

      // Check for duplicate username (skip if editing same user)
      const isDuplicate = usersList.some(u => 
          u.username.toLowerCase() === formUser.username.toLowerCase() && 
          u.username.toLowerCase() !== editingUserOriginalUsername?.toLowerCase()
      );

      if (isDuplicate) {
          setUserModalError('Este nome de usuário já está em uso.');
          return;
      }

      let updatedList = [...usersList];

      const userObject: User = {
          name: formUser.name,
          username: formUser.username,
          // Only update password if provided, otherwise keep existing (for edit mode)
          password: formUser.password ? formUser.password : (usersList.find(u => u.username === editingUserOriginalUsername)?.password || ''),
          role: formUser.role,
          // If admin, enforce full permissions. Else, use checkbox values.
          permissions: formUser.role === 'admin' ? ADMIN_PERMISSIONS : formUser.permissions
      };

      if (editingUserOriginalUsername) {
          // Update existing
          updatedList = updatedList.map(u => u.username === editingUserOriginalUsername ? userObject : u);
      } else {
          // Create new
          updatedList.push(userObject);
      }

      setUsersList(updatedList);
      localStorage.setItem('meumei_users', JSON.stringify(updatedList));
      setIsUserModalOpen(false);
  };

  const togglePermission = (key: keyof UserPermissions) => {
      setFormUser(prev => ({
          ...prev,
          permissions: {
              ...prev.permissions,
              [key]: !prev.permissions[key]
          }
      }));
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
    const stored = localStorage.getItem('meumei_users');
    const users = stored ? JSON.parse(stored) : [];
    const admin = users.find((u: any) => u.username === resetAdminUser && u.password === resetAdminPass && u.role === 'admin');

    if (!admin) {
        setResetError('Credenciais de administrador incorretas.');
        return;
    }

    if (onSystemReset) {
        onSystemReset();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] text-zinc-900 dark:text-white font-inter pb-20 transition-colors duration-300">
      
      {/* Header */}
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
        
        {/* --- SECTION 2: ADMINISTRATION (Restricted) --- */}
        <div>
            <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider mb-4 ml-1 flex items-center gap-2">
                Administração {isAdmin && <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 rounded">Admin</span>}
            </h3>

            {isAdmin ? (
                <div className="space-y-6">
                    
                    {/* Company Management Card */}
                    <section className="bg-white dark:bg-[#151517] rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm relative overflow-hidden">
                        {/* ... (Company Details Form Content same as before) ... */}
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
                                        <span className="text-emerald-600 dark:text-emerald-400">Salvo!</span>
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
                                    <Calendar size={12} /> Data de Abertura / Início
                                </label>
                                <div className="relative">
                                    <input 
                                        type="date" 
                                        value={editedInfo.startDate}
                                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                                        className="w-full bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-zinc-900 dark:text-white [color-scheme:dark]"
                                    />
                                    <Calendar className="absolute right-4 top-3 text-zinc-400 pointer-events-none" size={16} />
                                </div>
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
                            <div className="md:col-span-7 space-y-2">
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
                             <div className="md:col-span-12 space-y-2">
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
                        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-500 shadow-inner">
                                    <Users size={24} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Gestão de Usuários</h2>
                                    <p className="text-sm text-zinc-500">Controle de acesso e permissões.</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleOpenUserModal()}
                                className="w-full sm:w-auto px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-purple-900/20"
                            >
                                <UserPlus size={18} /> Novo Usuário
                            </button>
                        </div>

                        <div className="space-y-4">
                            {usersList.length > 0 ? (
                                usersList.map((user, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-[#1a1a1a] border border-zinc-100 dark:border-zinc-800 rounded-xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${user.role === 'admin' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-zinc-900 dark:text-white">
                                                    {user.name || user.username}
                                                </p>
                                                <div className="flex items-center gap-1.5">
                                                    {user.role === 'admin' ? (
                                                        <>
                                                            <Shield size={12} className="text-amber-500" />
                                                            <p className="text-xs text-amber-600 dark:text-amber-500 font-semibold uppercase">Admin</p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <UserIcon size={12} className="text-purple-500" />
                                                            <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold uppercase">Colaborador</p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleOpenUserModal(user)}
                                                className="p-2 text-zinc-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center gap-2 px-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                                                title="Editar Usuário"
                                            >
                                                <Pencil size={14} />
                                                <span className="text-xs font-bold hidden sm:inline">Editar</span>
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteUser(user.username)}
                                                className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-zinc-200 dark:border-zinc-700"
                                                title="Excluir Usuário"
                                            >
                                                <Trash2 size={16} />
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
                        {/* Selic & Reset sections (kept same) */}
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
                        </section>

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

      {/* --- USER CREATE/EDIT MODAL --- */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-0 overflow-hidden relative flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-[#202020]">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                        {editingUserOriginalUsername ? <Pencil size={20} className="text-blue-500" /> : <UserPlus size={20} className="text-purple-600" />}
                        {editingUserOriginalUsername ? 'Editar Usuário' : 'Novo Usuário'}
                    </h3>
                    <button 
                        onClick={() => setIsUserModalOpen(false)}
                        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                {/* Scrollable Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar space-y-5">
                    
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-zinc-500 uppercase">Nome Completo</label>
                            <input 
                                type="text" 
                                placeholder="Ex: João Silva"
                                value={formUser.name}
                                onChange={(e) => setFormUser({...formUser, name: e.target.value})}
                                className="w-full bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-zinc-900 dark:text-white"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Usuário</label>
                                <input 
                                    type="text" 
                                    placeholder="joao.silva"
                                    value={formUser.username}
                                    onChange={(e) => setFormUser({...formUser, username: e.target.value})}
                                    className="w-full bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-zinc-900 dark:text-white"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-zinc-500 uppercase">
                                    {editingUserOriginalUsername ? 'Nova Senha (Opcional)' : 'Senha'}
                                </label>
                                <input 
                                    type="password" 
                                    placeholder="********"
                                    value={formUser.password}
                                    onChange={(e) => setFormUser({...formUser, password: e.target.value})}
                                    className="w-full bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-zinc-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 pt-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase block">Tipo de Conta</label>
                            <div className="flex gap-4">
                                <label className={`flex-1 p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-center gap-2 ${formUser.role === 'user' ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 text-purple-700 dark:text-purple-400' : 'bg-white dark:bg-[#121212] border-zinc-200 dark:border-zinc-700 text-zinc-500'}`}>
                                    <input 
                                        type="radio" 
                                        className="hidden" 
                                        checked={formUser.role === 'user'} 
                                        onChange={() => setFormUser({...formUser, role: 'user'})} 
                                    />
                                    <UserIcon size={16} /> Colaborador
                                </label>
                                <label className={`flex-1 p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-center gap-2 ${formUser.role === 'admin' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-500 text-amber-700 dark:text-amber-400' : 'bg-white dark:bg-[#121212] border-zinc-200 dark:border-zinc-700 text-zinc-500'}`}>
                                    <input 
                                        type="radio" 
                                        className="hidden" 
                                        checked={formUser.role === 'admin'} 
                                        onChange={() => setFormUser({...formUser, role: 'admin'})} 
                                    />
                                    <Shield size={16} /> Administrador
                                </label>
                            </div>
                        </div>
                        
                        {/* PERMISSIONS SECTION (Only for Non-Admins) */}
                        {formUser.role !== 'admin' && (
                            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 animate-in fade-in slide-in-from-top-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase block mb-3">Permissões de Acesso</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {[
                                        { key: 'canManageIncomes', label: 'Entradas (Apenas Lançar)' },
                                        { key: 'canManageExpenses', label: 'Despesas (Apenas Lançar)' },
                                        { key: 'canViewBalances', label: 'Ver Saldo Atual/Contas' },
                                        { key: 'canViewMeiLimit', label: 'Ver Faturamento MEI' },
                                        { key: 'canViewInvoices', label: 'Acesso à Guia Faturas' },
                                        { key: 'canViewReports', label: 'Acesso à Guia Relatórios' },
                                    ].map((perm) => (
                                        <button
                                            key={perm.key}
                                            onClick={() => togglePermission(perm.key as keyof UserPermissions)}
                                            className={`flex items-center gap-3 p-3 rounded-lg border text-left text-sm transition-all ${
                                                formUser.permissions[perm.key as keyof UserPermissions] 
                                                ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-zinc-900 dark:text-zinc-200' 
                                                : 'bg-zinc-50 dark:bg-[#151517] border-zinc-200 dark:border-zinc-800 text-zinc-400'
                                            }`}
                                        >
                                            {formUser.permissions[perm.key as keyof UserPermissions] 
                                                ? <CheckSquare size={18} className="text-purple-600 dark:text-purple-400 shrink-0" /> 
                                                : <Square size={18} className="shrink-0" />
                                            }
                                            <span className="leading-tight">{perm.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {formUser.role === 'admin' && (
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-lg text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2">
                                <Shield size={14} /> Administradores possuem acesso total ao sistema.
                            </div>
                        )}
                    </div>

                    {userModalError && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs p-3 rounded-lg flex items-center gap-2">
                            <AlertTriangle size={14} />
                            {userModalError}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-[#202020] flex gap-3">
                    <button 
                        onClick={() => setIsUserModalOpen(false)}
                        className="flex-1 py-3 rounded-lg font-bold text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSaveUser}
                        className="flex-1 py-3 rounded-lg font-bold text-white bg-purple-600 hover:bg-purple-700 transition-all shadow-lg"
                    >
                        Salvar Usuário
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- SYSTEM RESET SECURITY MODAL --- */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-red-950/80 backdrop-blur-md animate-in fade-in zoom-in-95 duration-300">
             <div className="w-full max-w-md bg-[#1a1a1a] rounded-2xl shadow-2xl border border-red-900/50 p-0 overflow-hidden">
                {/* ... existing reset content ... */}
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
