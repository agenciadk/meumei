
import React from 'react';

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
  INCOMES = 'INCOMES',
  YIELDS = 'YIELDS' // Novo estado
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
  // Novos campos de Rendimento
  yieldRate?: number; // Ex: 100 (para 100%)
  yieldIndex?: 'CDI' | 'Selic'; 
  // Histórico para gráficos
  balanceHistory?: { date: string; value: number }[];
  
  // Controle de Rendimentos (Manual/Auto)
  lastYield?: number; // Valor do último rendimento
  lastYieldDate?: string; // Data do último rendimento
  lastYieldNote?: string; // Observação do último rendimento
  
  // Deprecated but kept for compatibility with existing types if needed temporarily
  lastYieldDetails?: {
    base: number;
    gross: number;
    ir: number;
    net: number;
  };
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
