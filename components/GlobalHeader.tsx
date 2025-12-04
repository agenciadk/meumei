
import React from 'react';
import { 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Building2,
  ExternalLink
} from 'lucide-react';
import Logo from './Logo';
import { Role } from '../types';

interface GlobalHeaderProps {
  title?: string;
  subtitle?: string;
  companyName: string;
  username: string;
  viewDate: Date;
  onMonthChange: (increment: number) => void;
  canGoBack: boolean;
  onOpenSettings: () => void;
  onLogout: () => void;
  onCompanyClick: () => void;
  role: Role;
}

const GlobalHeader: React.FC<GlobalHeaderProps> = ({ 
  companyName, 
  username, 
  viewDate, 
  onMonthChange, 
  canGoBack,
  onOpenSettings,
  onLogout,
  onCompanyClick,
  role
}) => {
  
  const monthLabel = viewDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const capitalizedMonthLabel = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  const getRoleLabel = (r: Role) => {
    switch(r) {
        case 'admin': return 'Administrador';
        case 'financial': return 'Financeiro';
        case 'limited': return 'Limitado';
        default: return 'Colaborador';
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-600 rounded-b-[40px] relative shadow-2xl shadow-indigo-500/20 mb-12 transition-all duration-300 z-50">
         {/* Background Pattern */}
         <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] rounded-b-[40px]"></div>
         
         <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-16 relative z-10">
             
             {/* Header Grid: Left (Company), Center (Logo), Right (User/Actions) */}
             <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
                
                {/* LEFT: Company Name */}
                <div className="flex-1 w-full md:w-auto flex justify-center md:justify-start order-2 md:order-1 overflow-hidden">
                    <button 
                        onClick={onCompanyClick}
                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/5 transition-all group max-w-full"
                        title="Ver dados da empresa"
                    >
                        <Building2 size={16} className="text-indigo-200 group-hover:text-white transition-colors shrink-0" />
                        <span className="text-sm font-semibold text-white tracking-wide truncate max-w-[200px] md:max-w-[250px]">{companyName}</span>
                        <ExternalLink size={12} className="text-white/50 group-hover:text-white transition-colors ml-1 shrink-0" />
                    </button>
                </div>

                {/* CENTER: Logo (meumei) */}
                <div className="flex-1 w-full md:w-auto flex justify-center order-1 md:order-2 mb-4 md:mb-0">
                    <Logo size="5xl" className="text-white drop-shadow-lg" />
                </div>

                {/* RIGHT: User Info & Actions */}
                <div className="flex-1 w-full md:w-auto flex items-center justify-center md:justify-end gap-4 order-3">
                    
                    {/* User Profile */}
                    <div className="flex items-center gap-3 text-right">
                        <div className="hidden md:block">
                            <p className="text-sm font-bold text-white leading-none">{username}</p>
                            <p className="text-[10px] text-indigo-200 font-medium uppercase tracking-wider mt-0.5">
                                {getRoleLabel(role)}
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-white shadow-inner border border-white/10">
                            {username.charAt(0).toUpperCase()}
                        </div>
                    </div>

                    {/* Separator */}
                    <div className="h-8 w-px bg-white/20 mx-1"></div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button 
                            onClick={onOpenSettings}
                            className="p-2.5 bg-white/10 hover:bg-white/20 hover:scale-105 backdrop-blur-md rounded-xl text-white transition-all border border-white/5"
                            title="Configurações"
                        >
                            <Settings size={18} />
                        </button>
                        <button 
                            onClick={onLogout}
                            className="p-2.5 bg-red-500/20 hover:bg-red-500/30 hover:scale-105 backdrop-blur-md rounded-xl text-white transition-all border border-white/5"
                            title="Sair"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>

             </div>
         </div>

         {/* BOTTOM EDGE: Month Selector (Overlapping) */}
         <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 z-20 w-full max-w-xs px-4">
            <div className="flex items-center justify-between bg-[#1a1a1a] dark:bg-black border border-white/10 dark:border-zinc-800 p-1.5 rounded-full shadow-2xl shadow-black/40">
                <button 
                    onClick={() => onMonthChange(-1)}
                    disabled={!canGoBack}
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${!canGoBack ? 'text-zinc-600 cursor-not-allowed' : 'text-white hover:bg-zinc-800 active:scale-95'}`}
                >
                    <ChevronLeft size={20} />
                </button>
                
                <div className="flex flex-col items-center justify-center px-4">
                    <span className="text-xs font-medium text-zinc-400 uppercase tracking-widest leading-none mb-0.5">Mês Atual</span>
                    <span className="text-sm font-bold text-white capitalize leading-none">
                        {capitalizedMonthLabel}
                    </span>
                </div>

                <button 
                    onClick={() => onMonthChange(1)}
                    className="w-10 h-10 flex items-center justify-center rounded-full text-white hover:bg-zinc-800 active:scale-95 transition-all"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
         </div>
    </div>
  );
};

export default GlobalHeader;
