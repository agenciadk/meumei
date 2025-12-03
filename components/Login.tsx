

import React, { useState } from 'react';
import { LogIn, UserPlus, ShieldCheck, User, AlertCircle } from 'lucide-react';
import { MOCK_CREDENTIALS } from '../constants';

interface LoginProps {
  onLoginSuccess: (data: { username: string; role: 'admin' | 'user' }) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login State
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  
  // Register State
  const [regUser, setRegUser] = useState('');
  const [regPass, setRegPass] = useState('');
  
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. Check Admin Credentials
    if (loginUser === MOCK_CREDENTIALS.username && loginPass === MOCK_CREDENTIALS.password) {
      console.log('Admin login attempt success');
      onLoginSuccess({ username: loginUser, role: 'admin' });
      return;
    } 

    // 2. Check Registered Users in LocalStorage
    const users = getStoredUsers();
    const validUser = users.find((u: any) => u.username === loginUser && u.password === loginPass);

    if (validUser) {
        console.log('User login attempt success');
        onLoginSuccess({ username: loginUser, role: 'user' });
    } else {
        setError('Usuário não encontrado ou senha incorreta.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!regUser || !regPass) {
        setError('Preencha todos os campos obrigatórios.');
        return;
    }

    // Check if user already exists
    const users = getStoredUsers();
    if (users.find((u: any) => u.username === regUser) || regUser === MOCK_CREDENTIALS.username) {
        setError('Este nome de usuário já está em uso.');
        return;
    }

    // Save new user
    const newUser = { username: regUser, password: regPass };
    localStorage.setItem('meumei_users', JSON.stringify([...users, newUser]));

    // Auto login after register
    onLoginSuccess({ 
        username: regUser, 
        role: 'user'
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#09090b] text-white p-4 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/20 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-[420px] bg-[#1a1a1a] rounded-3xl shadow-2xl overflow-hidden border border-zinc-800 flex flex-col relative z-10">
        
        {/* Header Section - Gradient */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
             <div className="relative z-10">
                <h1 className="text-5xl font-extrabold tracking-tighter text-white mb-2 drop-shadow-md">
                meumei
                </h1>
                <p className="text-indigo-100 font-medium text-sm">Controle Financeiro Inteligente</p>
             </div>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-[#151515] mx-6 -mt-6 rounded-xl border border-zinc-800 relative z-20 shadow-lg">
            <button 
                type="button"
                onClick={() => { setActiveTab('login'); setError(''); }}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'login' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
                <LogIn size={16} /> Acesso
            </button>
            <button 
                type="button"
                onClick={() => { setActiveTab('register'); setError(''); }}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'register' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
                <UserPlus size={16} /> Registrar
            </button>
        </div>

        {/* Forms */}
        <div className="p-8 pt-6">
          
          {activeTab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-5 animate-in slide-in-from-left-4 duration-300">
                
                <div className="text-center mb-4">
                    <p className="text-sm text-zinc-400">Entre com suas credenciais para acessar o painel.</p>
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
                    Acessar Sistema
                </button>
              </form>
          ) : (
              <form onSubmit={handleRegister} className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mb-4">
                     <h3 className="text-purple-400 text-xs font-bold uppercase mb-1 flex items-center gap-2">
                        <UserPlus size={14} /> Novo Usuário
                     </h3>
                     <p className="text-xs text-purple-200/70 leading-relaxed">
                        Crie sua conta para colaborar na empresa. O administrador gerencia as configurações globais.
                     </p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Escolha um Usuário</label>
                        <input
                            type="text"
                            value={regUser}
                            onChange={(e) => setRegUser(e.target.value)}
                            className="w-full bg-[#121212] border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                            placeholder="Ex: seu.nome"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Crie uma Senha</label>
                        <input
                            type="password"
                            value={regPass}
                            onChange={(e) => setRegPass(e.target.value)}
                            className="w-full bg-[#121212] border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                            placeholder="******"
                        />
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 p-3 rounded-lg justify-center animate-pulse">
                        <AlertCircle size={14} /> {error}
                    </div>
                )}

                <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2">
                    Criar Conta
                </button>
              </form>
          )}

        </div>
        
        <div className="bg-[#151515] p-4 text-center border-t border-zinc-800">
            <p className="text-[10px] text-zinc-600">
                &copy; 2025 meumei. Todos os direitos reservados.
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;