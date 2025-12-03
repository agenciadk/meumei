

export type Role = 'admin' | 'user';

export interface User {
  username: string;
  name: string;
  role: Role;
}

export interface CompanyInfo {
  name: string;
  cnpj: string;
  startDate: string;
  address: string;
  zipCode?: string; // Added as requested in print
  phone: string;
  email: string;
  website: string;
  selicRate: number;
  isConfigured?: boolean; 
}

export enum ViewState {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  SETTINGS = 'SETTINGS',
  ACCOUNTS = 'ACCOUNTS',
  COMPANY_DETAILS = 'COMPANY_DETAILS',
  COMPANY_SETUP = 'COMPANY_SETUP',
  VARIABLE_EXPENSES = 'VARIABLE_EXPENSES',
  FIXED_EXPENSES = 'FIXED_EXPENSES',
  PERSONAL_EXPENSES = 'PERSONAL_EXPENSES',
  INCOMES = 'INCOMES'
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: 'income' | 'expense';
}

export interface Account {
  id: string;
  name: string;
  type: string;
  initialBalance: number;
  currentBalance: number;
  icon?: React.ReactNode; 
}

export interface CreditCard {
  id: string;
  name: string;
  brand: string; // Adicionado Bandeira
  closingDay: number;
  dueDay: number;
  limit?: number; 
}

export type ExpenseType = 'variable' | 'fixed' | 'personal';

export interface Expense {
  id: string;
  description: string; // Fornecedor/Nome
  amount: number;
  category: string;
  date: string; // Data de lançamento
  dueDate: string; // Data de Vencimento
  paymentMethod: string; // Crédito, Débito, etc.
  accountId?: string; // If paid via account
  cardId?: string; // If paid via credit card
  status: 'pending' | 'paid';
  type: ExpenseType; // Novo campo para diferenciar os tipos
  notes?: string;
  
  // Installment Info
  installments?: boolean; 
  installmentNumber?: number; // e.g., 1
  totalInstallments?: number; // e.g., 10
  installmentGroupId?: string; // To link them together
}

export interface Income {
  id: string;
  description: string; // Origem / Cliente
  amount: number;
  category: string;
  date: string; // Data de recebimento
  accountId: string; // Conta de destino (Obrigatória para entradas)
  status: 'pending' | 'received';
  notes?: string;

  // Installment Info for Incomes
  installments?: boolean;
  installmentNumber?: number;
  totalInstallments?: number;
  installmentGroupId?: string;
}