/**
 * Lead status constants
 */
export const LEAD_STATUSES = {
  NEW_CONTACT: 'new_contact',
  FIRST_CONTACT: 'first_contact',
  QUALIFICATION: 'qualification',
  PRESENTATION: 'presentation',
  NEGOTIATION: 'negotiation',
  CONTRACT: 'contract',
  CLOSED_WON: 'closed_won',
  CLOSED_LOST: 'closed_lost',
} as const;

export type LeadStatus = typeof LEAD_STATUSES[keyof typeof LEAD_STATUSES];

/**
 * Lead source channels
 */
export const SOURCE_CHANNELS = {
  WEBSITE: 'website',
  REFERRAL: 'referral',
  SOCIAL_MEDIA: 'social_media',
  EMAIL: 'email',
  PHONE: 'phone',
  EVENT: 'event',
  OTHER: 'other',
} as const;

export type SourceChannel = typeof SOURCE_CHANNELS[keyof typeof SOURCE_CHANNELS];

/**
 * Score thresholds for lead qualification
 */
export const SCORE_THRESHOLDS = {
  HIGH: 80,
  MEDIUM: 60,
  LOW: 40,
} as const;

/**
 * User roles
 */
export const USER_ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  USER: 'user',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
