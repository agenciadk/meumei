

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
  selicRate: 13.75, // Default fallback value
  isConfigured: false // Default to false until setup is completed
};

// --- ALTERAÇÃO: Array vazio para iniciar sem contas ---
export const DEFAULT_ACCOUNTS: any[] = [];

// Dados antigos mantidos apenas para referência (não usados na inicialização)
export const MOCK_ACCOUNTS_FOR_DEMO = [
    { id: '1', name: 'Cora', type: 'Conta Bancária', initialBalance: 0, currentBalance: 0.32 },
    { id: '2', name: 'Sicredi', type: 'Conta Bancária', initialBalance: 0, currentBalance: 95.90 },
    { id: '3', name: 'Nubank', type: 'Conta Bancária', initialBalance: 0, currentBalance: 0.00 },
    { id: '4', name: 'MP - DK', type: 'Rendimentos', initialBalance: 0, currentBalance: 1727.32 },
    { id: '5', name: 'MP - Nati', type: 'Rendimentos', initialBalance: 0, currentBalance: 3868.19 },
    { id: '6', name: 'MP - Ale', type: 'Rendimentos', initialBalance: 0, currentBalance: 5912.57 },
    { id: '7', name: 'Dinheiro', type: 'Dinheiro (Espécie)', initialBalance: 0, currentBalance: 115.50 },
];

export const DEFAULT_ACCOUNT_TYPES = [
    'Conta Bancária',
    'Carteira Digital',
    'Conta Digital Internacional',
    'Rendimentos',
    'Dinheiro (Espécie)'
];

export const DEFAULT_EXPENSE_CATEGORIES = [
    'Alimentação', 'Assinatura', 'Cenário', 'Equipamentos', 'Logística', 'Materiais', 'Plantas', 'Revelação', 'Tráfego Pago'
];

export const DEFAULT_INCOME_CATEGORIES = [
    'Serviço', 'Venda de Produto', 'Salário', 'Rendimento', 'Reembolso', 'Outros'
];