/**
 * Application-wide TypeScript types and interfaces
 */

import { 
  LeadStatus, 
  SourceChannel, 
  UserRole,
  InvestmentCapacity,
  PreviousExperience,
  CommunicationType,
  FranchiseStatus,
  TaskPriority
} from "@/constants/leadConstants";
import { Database } from "./supabase";

// User Types
export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

// Lead Types
export interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  location: string | null;
  status: LeadStatus;
  source_channel: SourceChannel | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  lead_details?: LeadDetail | LeadDetail[];
  communications?: Communication[];
  tasks?: Task[];
}

export interface LeadDetail {
  id: string;
  lead_id: string;
  score: number;
  investment_capacity: InvestmentCapacity;
  previous_experience: PreviousExperience;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface LeadFormData {
  full_name: string;
  email: string;
  phone?: string;
  location?: string;
  status: LeadStatus;
  source_channel?: SourceChannel;
  assigned_to?: string;
  score?: number;
  investment_capacity?: InvestmentCapacity;
  previous_experience?: PreviousExperience;
  notes?: string;
}

// Communication Types
export interface Communication {
  id: string;
  lead_id: string;
  type: CommunicationType;
  subject: string | null;
  content: string;
  created_by: string | null;
  created_at: string;
}

export interface CommunicationFormData {
  type: CommunicationType;
  subject?: string;
  content: string;
}

// Task Types
export interface Task {
  id: string;
  lead_id: string;
  title: string;
  description: string;
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
  assigned_to: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  leads?: {
    full_name: string;
    email: string;
  };
}

export interface TaskFormData {
  title: string;
  description?: string;
  due_date?: string;
  assigned_to?: string;
}

// Franchise Types
export interface Franchise {
  id: string;
  name: string;
  location: string;
  owner_name: string | null;
  owner_email: string | null;
  owner_phone: string | null;
  status: FranchiseStatus;
  opening_date: string | null;
  investment_amount: number | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface FranchiseFormData {
  name: string;
  location: string;
  owner_name?: string;
  owner_email?: string;
  owner_phone?: string;
  status: FranchiseStatus;
  opening_date?: string;
  investment_amount?: number;
  notes?: string;
}

// Email Settings Types
export interface EmailSettings {
  id: string;
  api_key: string;
  from_email: string;
  from_name: string;
  created_at: string;
  updated_at: string;
}

// Dashboard Stats Types
export interface DashboardStats {
  totalLeads: number;
  activeLeads: number;
  conversionRate: number;
  averageScore: number;
  leadsByStatus: Record<LeadStatus, number>;
  leadsBySource: Record<SourceChannel, number>;
  recentLeads: Lead[];
}

// Filter Types
export interface LeadFilters {
  status?: LeadStatus;
  source_channel?: SourceChannel;
  assigned_to?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Sort Types
export type SortDirection = "asc" | "desc";

export interface SortConfig {
  field: string;
  direction: SortDirection;
}

// Pagination Types
export interface PaginationConfig {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

// Form State Types
export interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isDirty: boolean;
}

// Export Supabase Database types
export type { Database };
