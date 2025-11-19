# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added - Phase 4 (Code Audit Fixes)
- Comprehensive TypeScript configuration with strict mode enabled
- ESLint configuration with rules for unused variables and console statements
- Prettier configuration for consistent code formatting
- Centralized constants in `src/constants/appConstants.ts`
- Comprehensive type definitions in `src/types/index.ts`
- Contributing guidelines in `CONTRIBUTING.md`
- Improved README with detailed documentation
- `.prettierrc` and `.prettierignore` for code formatting
- Centralized Supabase client export in `src/lib/supabase.ts`

### Added - Phase 3 (Code Audit Fixes)
- React Query integration for data fetching
- Custom hooks in `src/hooks/useQueries.ts`:
  - `useUserRole()` - Centralized role fetching
  - `useLeads()`, `useLead()` - Lead data fetching
  - `useCreateLead()`, `useUpdateLead()`, `useDeleteLead()` - Lead mutations
  - `useFranchises()`, `useFranchise()` - Franchise data fetching
  - `useTasks()` - Tasks data fetching
- Error Boundary component for graceful error handling
- Role Context Provider to avoid multiple role checks
- Consolidated database migration file
- Error boundaries wrapped around all major routes

### Added - Phase 2 (Code Audit Fixes)
- Shared utility functions in `src/utils/leadHelpers.ts`:
  - `getStatusColor()` - Status badge colors
  - `getStatusLabel()` - Status display labels
  - `getScoreColor()` - Score badge colors
  - `getSourceChannelLabel()` - Source channel labels
- Date utility functions in `src/utils/dateUtils.ts`:
  - `formatDate()` - Format date strings
  - `formatDateTime()` - Format date and time
  - `getRelativeTime()` - Relative time strings
- Lead constants in `src/constants/leadConstants.ts`:
  - Lead statuses
  - Source channels
  - Score thresholds
  - User roles

### Fixed - Phase 1 (Code Audit Fixes)
- Replaced all `any` types with proper TypeScript types
- Removed console.error statements from production code
- Fixed error handling in LoginForm, AddUserDialog, EmailSettingsForm, PermissionGuard
- Improved error messages with proper type checking

### Added - Franchise Management
- Franchise routes in App.tsx
- Franchise navigation link in sidebar
- FranchisesList, FranchiseForm, FranchiseDetail components
- Franchise CRUD operations
- Permission guards for franchise management

### Security
- Removed excessive console logging
- Improved error handling without exposing sensitive data
- Type-safe error handling throughout the application

### Performance
- React Query caching reduces unnecessary API calls
- Centralized role fetching eliminates duplicate RPC calls
- Optimized component re-renders
- Database indexes on frequently queried columns

### Code Quality
- Eliminated code duplication (helper functions, date formatting)
- Extracted magic numbers and strings to constants
- Improved TypeScript type safety
- Better code organization and structure

## [1.0.0] - Initial Release

### Added
- Lead Management System with full CRUD operations
- Visual pipeline with drag-and-drop functionality
- Dashboard with key metrics and analytics
- Communication center with email templates
- Task management system
- User management with role-based access control
- Settings page with email configuration
- Authentication with Supabase
- Dark mode support
- Responsive design

### Features
- Lead tracking and qualification
- Automated lead scoring
- Communication history logging
- Task assignment and tracking
- Email integration
- User roles (SuperAdmin, Admin, User)
- Import/Export functionality
- Real-time updates

### Tech Stack
- React 18 + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Supabase (PostgreSQL + Auth + Edge Functions)
- React Router v6
