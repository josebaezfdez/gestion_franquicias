# Lead Management System for Insurance Franchise

A comprehensive web application for tracking and qualifying potential franchise leads through a visual pipeline, with automated scoring and detailed analytics.

## 🚀 Features

- **Dashboard**: Central hub with key metrics, interactive charts, and color-coded lead qualification
- **Visual Pipeline**: Drag-and-drop interface with customizable stages
- **Lead Management**: Complete CRUD functionality with detailed profiles
- **Communication Center**: Email templates, scheduling, and communication logging
- **Reporting**: Customizable reports with export options and analytics
- **Franchise Management**: Track and manage franchise locations
- **User Management**: Role-based access control (SuperAdmin, Admin, User)

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Query (TanStack Query)
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Routing**: React Router v6

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard components
│   ├── leads/          # Lead management components
│   ├── franchises/     # Franchise management components
│   ├── settings/       # Settings components
│   └── ui/             # shadcn/ui components
├── constants/          # Application constants
│   ├── appConstants.ts
│   └── leadConstants.ts
├── contexts/           # React contexts
│   └── RoleContext.tsx
├── hooks/              # Custom React hooks
│   └── useQueries.ts
├── lib/                # Library configurations
│   ├── react-query-provider.tsx
│   ├── theme-provider.tsx
│   └── utils.ts
├── services/           # API services
├── types/              # TypeScript types
├── utils/              # Utility functions
│   ├── csvUtils.ts
│   ├── dateUtils.ts
│   └── leadHelpers.ts
└── App.tsx             # Main application component
```

## 🔐 Environment Variables

Required environment variables (set in Tempo project settings):

- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_KEY` - Supabase service role key (for edge functions)

## 📝 Code Standards

### TypeScript
- Strict mode enabled
- No `any` types (use proper interfaces)
- All functions must have return types
- Use type inference where appropriate

### React
- Functional components with hooks
- Use React Query for data fetching
- Error boundaries for error handling
- Proper prop typing with interfaces

### Styling
- Use Tailwind CSS utility classes
- Follow shadcn/ui component patterns
- Responsive design (mobile-first)
- Dark mode support

### Constants
- Extract magic numbers and strings to constants files
- Use `as const` for type safety
- Group related constants together

### Imports
- Use path aliases (`@/`) instead of relative imports
- Group imports: external → internal → components → utils
- Remove unused imports

## 🔄 Data Fetching

Use React Query hooks from `src/hooks/useQueries.ts`:

```typescript
import { useLeads, useCreateLead, useUpdateLead } from "@/hooks/useQueries";

// Fetch leads
const { data: leads, isLoading } = useLeads();

// Create lead
const createLead = useCreateLead();
createLead.mutate(leadData);

// Update lead
const updateLead = useUpdateLead();
updateLead.mutate({ id, data });
```

## 🎨 UI Components

All UI components are from shadcn/ui located in `src/components/ui/`. 

Common components:
- Button, Input, Select, Textarea
- Card, Badge, Avatar
- Dialog, Sheet, Popover
- Table, Tabs, Accordion
- Toast notifications

## 🔒 Authentication & Authorization

Role-based access control with three roles:
- **SuperAdmin**: Full system access
- **Admin**: Manage leads, franchises, and users
- **User**: View and manage assigned leads

Use `PermissionGuard` component to protect routes:

```typescript
<PermissionGuard allowedRoles={["superadmin", "admin"]}>
  <AdminComponent />
</PermissionGuard>
```

## 🗄️ Database Schema

Main tables:
- `users` - User accounts and roles
- `leads` - Lead information
- `lead_details` - Extended lead details (score, investment capacity)
- `communications` - Communication history
- `tasks` - Task management
- `franchises` - Franchise locations
- `email_settings` - Email configuration

## 🚨 Error Handling

- Error boundaries wrap all major routes
- React Query handles API errors automatically
- Toast notifications for user feedback
- Development mode shows detailed error messages

## 📊 Performance Optimizations

- React Query caching (5-minute stale time)
- Lazy loading with React.lazy and Suspense
- Optimized re-renders with proper memoization
- Database indexes on frequently queried columns

## 🧪 Testing

```bash
# Run tests (when implemented)
npm run test

# Run linter
npm run lint

# Type check
npm run type-check
```

## 📚 Additional Resources

- [React Query Documentation](https://tanstack.com/query/latest)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)

## 🤝 Contributing

1. Follow the code standards outlined above
2. Write meaningful commit messages
3. Test thoroughly before committing
4. Update documentation as needed

## 📄 License

Proprietary - All rights reserved