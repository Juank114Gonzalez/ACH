export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

export type MovementType = 'INCOME' | 'EXPENSE';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: MovementType;
  isDefault: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  type: MovementType;
  amount: number;
  description: string;
  date: string;
  notes?: string;
  userId: string;
  categoryId: string;
  category: Pick<Category, 'id' | 'name' | 'color' | 'icon'>;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  amount: number;
  month: number;
  year: number;
  spent: number;
  userId: string;
  categoryId: string;
  category: Pick<Category, 'id' | 'name' | 'color' | 'icon'>;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetAlert {
  budgetId: string;
  categoryName: string;
  spent: number;
  limit: number;
  percentage: number;
  level: 'warning' | 'exceeded';
}

export interface BalanceSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: MovementType;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'date' | 'amount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}
