
// Credentials as requested
export const MOCK_CREDENTIALS = {
  username: 'agdk',
  password: 'Pipoca@123'
};

export const APP_NAME = 'meumei';

// Mock date logic for "December 2025"
export const COMPANY_DATA = {
    // The visual "Today"
    currentDateDisplay: '03/12/2025', 
    
    // HTML Input format (YYYY-MM-DD)
    currentDateISO: '2025-12-03',
    
    // Start of the current month (The limit for the user)
    monthStartISO: '2025-12-01',
    
    // End of the current month
    monthEndISO: '2025-12-31'
};

export const DEFAULT_COMPANY_INFO = {
  name: 'Minha Empresa',
  cnpj: 'XX.XXX.XXX/0001-XX',
  startDate: COMPANY_DATA.monthStartISO,
  address: '',
  phone: '',
  email: '',
  website: '',
  selicRate: 11.25, // Atualizado para 11.25% conforme solicitado
  isConfigured: false // Default to false until setup is completed
};

// --- CONTAS PADRÃO COM DADOS DE INVESTIMENTO (ATUALIZADO) ---
export const DEFAULT_ACCOUNTS: any[] = [
    { 
        id: 'acc_mp_nati', 
        name: 'MP - Nati', 
        type: 'Rendimentos', 
        initialBalance: 3868.19, // Ajustado para base antes do rendimento
        currentBalance: 3868.19, 
        yieldRate: 120, 
        yieldIndex: 'CDI',
        balanceHistory: [{ date: '2025-12-01', value: 3868.19 }]
    },
    { 
        id: 'acc_mp_ale', 
        name: 'MP - Ale', 
        type: 'Rendimentos', 
        initialBalance: 5912.57, 
        currentBalance: 5912.57, 
        yieldRate: 120, 
        yieldIndex: 'CDI',
        balanceHistory: [{ date: '2025-12-01', value: 5912.57 }]
    },
    { 
        id: 'acc_mp_dk', 
        name: 'MP - DK', 
        type: 'Rendimentos', 
        initialBalance: 1727.32, 
        currentBalance: 1727.32, 
        yieldRate: 115, 
        yieldIndex: 'CDI',
        balanceHistory: [{ date: '2025-12-01', value: 1727.32 }] 
    },
    { 
        id: 'acc_nubank', 
        name: 'Nubank', 
        type: 'Conta Bancária', 
        initialBalance: 2500, 
        currentBalance: 2150.50 
    }
];

// Dados antigos mantidos apenas para referência (não usados na inicialização)
export const MOCK_ACCOUNTS_FOR_DEMO = [];

export const DEFAULT_ACCOUNT_TYPES = [
    'Conta Bancária',
    'Carteira Digital',
    'Conta Digital Internacional',
    'Rendimentos',
    'Investimento',
    'Dinheiro (Espécie)'
];

export const DEFAULT_EXPENSE_CATEGORIES = [
    'Alimentação', 'Assinatura', 'Cenário', 'Equipamentos', 'Logística', 'Materiais', 'Plantas', 'Revelação', 'Tráfego Pago'
];

export const DEFAULT_INCOME_CATEGORIES = [
    'Serviço', 'Venda de Produto', 'Salário', 'Rendimento', 'Reembolso', 'Outros'
];
