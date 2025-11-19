/**
 * Application-wide constants
 */

// API & Query Configuration
export const API_CONFIG = {
  STALE_TIME: 1000 * 60 * 5, // 5 minutes
  RETRY_COUNT: 1,
  REFETCH_ON_WINDOW_FOCUS: false,
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
} as const;

// Date Formats
export const DATE_FORMATS = {
  SHORT: "MM/DD/YYYY",
  LONG: "MMMM DD, YYYY",
  WITH_TIME: "MM/DD/YYYY HH:mm",
} as const;

// Toast Duration
export const TOAST_DURATION = {
  SUCCESS: 3000,
  ERROR: 5000,
  INFO: 4000,
} as const;

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 5,
  ALLOWED_TYPES: [".csv", ".xlsx", ".xls"],
} as const;

// Email Templates
export const EMAIL_TEMPLATES = {
  WELCOME: "welcome",
  FOLLOW_UP: "follow_up",
  REMINDER: "reminder",
  THANK_YOU: "thank_you",
} as const;

// Task Priorities
export const TASK_PRIORITIES = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
} as const;

export type TaskPriority = typeof TASK_PRIORITIES[keyof typeof TASK_PRIORITIES];

// Communication Types
export const COMMUNICATION_TYPES = {
  EMAIL: "email",
  PHONE: "phone",
  MEETING: "meeting",
  NOTE: "note",
} as const;

export type CommunicationType = typeof COMMUNICATION_TYPES[keyof typeof COMMUNICATION_TYPES];

// Franchise Status
export const FRANCHISE_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
} as const;

export type FranchiseStatus = typeof FRANCHISE_STATUS[keyof typeof FRANCHISE_STATUS];

// Investment Capacity
export const INVESTMENT_CAPACITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  VERY_HIGH: "very_high",
  UNKNOWN: "unknown",
} as const;

export type InvestmentCapacity = typeof INVESTMENT_CAPACITY[keyof typeof INVESTMENT_CAPACITY];

// Previous Experience
export const PREVIOUS_EXPERIENCE = {
  NONE: "none",
  SOME: "some",
  EXTENSIVE: "extensive",
} as const;

export type PreviousExperience = typeof PREVIOUS_EXPERIENCE[keyof typeof PREVIOUS_EXPERIENCE];
