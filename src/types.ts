export type CurrencyCode = 'EUR' | 'USD' | 'XOF' | 'XAF' | 'GBP';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  avatar?: string;
}

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  label: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'XOF', symbol: 'CFA', label: 'Franc CFA (BCEAO)' },
  { code: 'XAF', symbol: 'FCFA', label: 'Franc CFA (BEAC)' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
];

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  supplierId: string;
  price: number;
  quantity: number;
  minQuantity: number;
  lastUpdated: string;
}

export interface Movement {
  id: string;
  productId: string;
  productName: string;
  type: 'IN' | 'OUT';
  quantity: number;
  reason: string;
  reference?: string;
  date: string;
}

export interface AppSettings {
  currencyCode: CurrencyCode;
}

export interface InventoryStats {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  categoriesCount: number;
  suppliersCount: number;
}
