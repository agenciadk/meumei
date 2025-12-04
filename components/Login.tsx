
import React, { useState, useEffect } from 'react';
import { LogIn, Key, ShieldCheck, User, AlertCircle, Lock } from 'lucide-react';
import { MASTER_LICENSE_KEY, DEFAULT_COMPANY_INFO } from '../constants';
import Logo from './Logo';
import { Role } from '../types';

interface LoginProps {
  onLoginSuccess: (data: { username: string; role: Role }) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isFirstAccess, setIsFirstAccess] = useState(false);
  
  // Login State
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  
  // Activation State (First Access)
  const [licenseKey, setLicenseKey] = useState('');
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  
  const [error, setError] = useState('');

  // Helper to get users from storage
  const getStoredUsers = () => {
    try {
        const users = localStorage.getItem('meumei_users');
        return users ? JSON.parse(users) : [];
    } catch (e) {
        return [];
    }
  };

  useEffect(() => {
      const users = getStoredUsers();
      if (users.length === 0) {
          setIsFirstAccess(true);
      }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const users = getStoredUsers();
    const validUser = users.find((u: any) => u.username === loginUser && u.password === loginPass);

    if (validUser) {
        console.log('User login attempt success');
        onLoginSuccess({ 
            username: loginUser, 
            role: validUser.role || 'user' // Default to user if role missing
        });
    } else {
        setError('Usuário não encontrado ou senha incorreta.');
    }
  };

  // Auto-format the license key input (XXXX-XXXX-XXXX)
  const handleLicenseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // 1. Keep only alphanumeric
      let raw = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
      
      // 2. Limit to 12 chars (excluding hyphens)
      if (raw.length > 12) raw = raw.slice(0, 12);

      // 3. Insert hyphens
      let formatted = raw;
      if (raw.length > 4) formatted = raw.slice(0, 4) + '-' + raw.slice(4);
      if (raw.length > 8) formatted = formatted.slice(0, 9) + '-' + raw.slice(8);

      setLicenseKey(formatted);
  };

  const handleActivation = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!licenseKey || !adminUser || !adminPass) {
        setError('Todos os campos são obrigatórios.');
        return;
    }

    // 1. Strict Validation
    // Check format XXXX-XXXX-XXXX (14 chars total)
    if (licenseKey.length !== 14) {
        setError('A Chave de Licença deve ter o formato XXXX-XXXX-XXXX.');
        return;
    }

    // Check specific valid key
    if (licenseKey !== MASTER_LICENSE_KEY) {
        setError('Chave de Licença Inválida ou Expirada.');
        return;
    }

    // 2. ARCHITECTURE FIX: Bind License to Company Data
    // This ensures all subsequent users and data are linked to this Master Key
    try {
        const existingInfoStr = localStorage.getItem('meumei_company_info');
        const companyInfo = existingInfoStr ? JSON.parse(existingInfoStr) : DEFAULT_COMPANY_INFO;
        
        const updatedCompanyInfo = {
            ...companyInfo,
            licenseId: licenseKey // The Single Source of Truth for Data Scope
        };
        
        localStorage.setItem('meumei_company_info', JSON.stringify(updatedCompanyInfo));
    } catch (err) {
        console.error("Failed to bind license to company info", err);
    }

    // 3. Create Admin User
    const newAdmin = { 
        username: adminUser, 
        password: adminPass,
        role: 'admin' as Role
    };

    localStorage.setItem('meumei_users', JSON.stringify([newAdmin]));

    // 4. Auto Login
    onLoginSuccess({ 
        username: adminUser, 
        role: 'admin'
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 text-white p-4 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-500/20 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-[420px] bg-[#1a1a1a]/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/10 flex flex-col relative z-10">
        
        {/* Header Section - Gradient */}
        <div className={`bg-gradient-to-br ${isFirstAccess ? 'from-blue-600 via-purple-600 to-pink-600' : 'from-indigo-600/20 to-purple-700/20'} p-8 text-center relative overflow-hidden transition-colors duration-500`}>
             <div className="relative z-10 flex flex-col items-center">
                <Logo size="5xl" className="text-white mb-2 drop-shadow-md" />
                <p className={`${isFirstAccess ? 'text-white' : 'text-indigo-100'} font-medium text-sm`}>
                    {isFirstAccess ? 'Ativação do Sistema' : 'Controle Financeiro Inteligente'}
                </p>
             </div>
        </div>

        {/* Forms */}
        <div className="p-8 pt-6">
          
          {isFirstAccess ? (
              // --- ACTIVATION FORM (MASTER KEY) ---
              <form onSubmit={handleActivation} className="space-y-5 animate-in slide-in-from-right-4 duration-500">
                
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-4">
                     <h3 className="text-blue-400 text-xs font-bold uppercase mb-1 flex items-center gap-2">
                        <Key size={14} /> Primeiro Acesso
                     </h3>
                     <p className="text-xs text-blue-200/70 leading-relaxed">
                        Insira a Chave Mestra para ativar sua licença e criar o usuário Administrador.
                     </p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Chave de Licença</label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-3 text-zinc-500 group-focus-within:text-pink-500 transition-colors" size={18} />
                            <input
                                type="text"
                                value={licenseKey}
                                onChange={handleLicenseChange}
                                maxLength={14}
                                className="w-full bg-[#121212] border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all placeholder:text-zinc-600 font-mono tracking-wider uppercase"
                                placeholder="XXXX-XXXX-XXXX"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Usuário Admin</label>
                        <input
                            type="text"
                            value={adminUser}
                            onChange={(e) => setAdminUser(e.target.value)}
                            className="w-full bg-[#121212] border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                            placeholder="Crie seu usuário"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Senha Admin</label>
                        <input
                            type="password"
                            value={adminPass}
                            onChange={(e) => setAdminPass(e.target.value)}
                            className="w-full bg-[#121212] border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                            placeholder="Crie sua senha"
                        />
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 p-3 rounded-lg justify-center animate-pulse">
                        <AlertCircle size={14} /> {error}
                    </div>
                )}

                <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-500 hover:to-pink-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-pink-900/20 flex items-center justify-center gap-2 mt-2">
                    <ShieldCheck size={18} /> Ativar Sistema
                </button>
              </form>
          ) : (
              // --- STANDARD LOGIN FORM ---
              <form onSubmit={handleLogin} className="space-y-5 animate-in slide-in-from-left-4 duration-500">
                
                <div className="text-center mb-4">
                    <p className="text-sm text-zinc-400">Entre com suas credenciais para acessar.</p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Usuário</label>
                        <div className="relative group">
                            <User className="absolute left-3 top-3 text-zinc-500 group-focus-within:text-purple-500 transition-colors" size={18} />
                            <input
                                type="text"
                                value={loginUser}
                                onChange={(e) => setLoginUser(e.target.value)}
                                className="w-full bg-[#121212] border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder:text-zinc-600"
                                placeholder="Digite seu usuário"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Senha</label>
                        <div className="relative group">
                            <ShieldCheck className="absolute left-3 top-3 text-zinc-500 group-focus-within:text-purple-500 transition-colors" size={18} />
                            <input
                                type="password"
                                value={loginPass}
                                onChange={(e) => setLoginPass(e.target.value)}
                                className="w-full bg-[#121212] border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder:text-zinc-600"
                                placeholder="Digite sua senha"
                            />
                        </div>
                    </div>
                </div>
                
                {error && (
                    <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 p-3 rounded-lg justify-center animate-pulse shadow-sm">
                        <AlertCircle size={14} /> {error}
                    </div>
                )}

                <button type="submit" className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-3.5 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-white/10 flex items-center justify-center gap-2 mt-2">
                    <LogIn size={18} /> Acessar Sistema
                </button>
              </form>
          )}

        </div>
        
        <div className="bg-[#151515] p-4 text-center border-t border-zinc-800">
            <p className="text-[10px] text-zinc-600">
                &copy; 2025 <Logo size="sm" className="inline text-zinc-500" />. Todos os direitos reservados.
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
