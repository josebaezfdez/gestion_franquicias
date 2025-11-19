# API Documentation

## Overview

This document describes the API structure and data fetching patterns used in the Lead Management System.

## Data Fetching with React Query

All data fetching is handled through React Query hooks located in `src/hooks/useQueries.ts`.

### Query Keys

Query keys are centralized for consistency:

```typescript
export const QUERY_KEYS = {
  leads: ["leads"],
  lead: (id: string) => ["lead", id],
  leadDetails: (id: string) => ["leadDetails", id],
  tasks: ["tasks"],
  communications: (leadId: string) => ["communications", leadId],
  franchises: ["franchises"],
  franchise: (id: string) => ["franchise", id],
  users: ["users"],
  userRole: ["userRole"],
} as const;
```

## User Management

### Get Current User Role

```typescript
import { useUserRole } from "@/hooks/useQueries";

const { data: role, isLoading } = useUserRole();
// Returns: "superadmin" | "admin" | "user" | null
```

**Database Function:**
```sql
CREATE FUNCTION get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM public.users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Lead Management

### Fetch All Leads

```typescript
import { useLeads } from "@/hooks/useQueries";

const { data: leads, isLoading, error } = useLeads();
```

**Returns:**
```typescript
Lead[] // Array of lead objects with lead_details
```

### Fetch Single Lead

```typescript
import { useLead } from "@/hooks/useQueries";

const { data: lead, isLoading } = useLead(leadId);
```

**Returns:**
```typescript
Lead & {
  lead_details: LeadDetail[];
  communications: Communication[];
  tasks: Task[];
}
```

### Create Lead

```typescript
import { useCreateLead } from "@/hooks/useQueries";

const createLead = useCreateLead();

createLead.mutate({
  full_name: "John Doe",
  email: "john@example.com",
  phone: "+1234567890",
  status: "new_contact",
  source_channel: "website",
});
```

**Success:** Invalidates `leads` query and shows success toast

**Error:** Shows error toast with message

### Update Lead

```typescript
import { useUpdateLead } from "@/hooks/useQueries";

const updateLead = useUpdateLead();

updateLead.mutate({
  id: leadId,
  data: {
    status: "qualification",
    assigned_to: userId,
  },
});
```

**Success:** Invalidates `leads` and specific `lead` queries

### Delete Lead

```typescript
import { useDeleteLead } from "@/hooks/useQueries";

const deleteLead = useDeleteLead();

deleteLead.mutate(leadId);
```

**Success:** Invalidates `leads` query

## Franchise Management

### Fetch All Franchises

```typescript
import { useFranchises } from "@/hooks/useQueries";

const { data: franchises, isLoading } = useFranchises();
```

### Fetch Single Franchise

```typescript
import { useFranchise } from "@/hooks/useQueries";

const { data: franchise, isLoading } = useFranchise(franchiseId);
```

## Task Management

### Fetch User Tasks

```typescript
import { useTasks } from "@/hooks/useQueries";

const { data: tasks, isLoading } = useTasks();
```

**Returns:** Tasks assigned to the current user with lead information

## Direct Supabase Queries

For operations not covered by React Query hooks, use the Supabase client directly:

```typescript
import { supabase } from "@/lib/supabase";

// Example: Fetch communications for a lead
const { data, error } = await supabase
  .from("communications")
  .select("*")
  .eq("lead_id", leadId)
  .order("created_at", { ascending: false });
```

## Database Schema

### Tables

#### users
```sql
- id: UUID (PK, references auth.users)
- email: TEXT (UNIQUE, NOT NULL)
- full_name: TEXT
- role: TEXT (superadmin | admin | user)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### leads
```sql
- id: UUID (PK)
- full_name: TEXT (NOT NULL)
- email: TEXT (NOT NULL)
- phone: TEXT
- location: TEXT
- status: TEXT (NOT NULL)
- source_channel: TEXT
- assigned_to: UUID (FK -> users.id)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### lead_details
```sql
- id: UUID (PK)
- lead_id: UUID (FK -> leads.id, UNIQUE)
- score: INTEGER (0-100)
- investment_capacity: TEXT
- previous_experience: TEXT
- notes: TEXT
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### communications
```sql
- id: UUID (PK)
- lead_id: UUID (FK -> leads.id)
- type: TEXT (email | phone | meeting | note)
- subject: TEXT
- content: TEXT (NOT NULL)
- created_by: UUID (FK -> users.id)
- created_at: TIMESTAMPTZ
```

#### tasks
```sql
- id: UUID (PK)
- lead_id: UUID (FK -> leads.id)
- title: TEXT (NOT NULL)
- description: TEXT
- due_date: TIMESTAMPTZ
- completed: BOOLEAN
- completed_at: TIMESTAMPTZ
- assigned_to: UUID (FK -> users.id)
- created_by: UUID (FK -> users.id)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### franchises
```sql
- id: UUID (PK)
- name: TEXT (NOT NULL)
- location: TEXT (NOT NULL)
- owner_name: TEXT
- owner_email: TEXT
- owner_phone: TEXT
- status: TEXT (active | inactive | pending)
- opening_date: DATE
- investment_amount: NUMERIC(12, 2)
- notes: TEXT
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

## Edge Functions

Edge functions are located in `supabase/functions/` and handle server-side operations:

- `create-user` - Create new user with role
- `update-user` - Update user information
- `delete-user` - Delete user account
- `create-user-admin` - Admin user creation
- `update-admin` - Update admin user
- `delete-admin` - Delete admin user

### Invoking Edge Functions

```typescript
const { data, error } = await supabase.functions.invoke('function-name', {
  body: { /* payload */ },
});
```

## Error Handling

All React Query hooks include automatic error handling:

```typescript
const { data, error, isLoading } = useLeads();

if (error) {
  // Error is automatically shown in toast
  // Component can handle additional error UI
}
```

For manual error handling:

```typescript
try {
  const result = await someOperation();
} catch (error) {
  const errorMessage = error instanceof Error 
    ? error.message 
    : "An unexpected error occurred";
  
  toast({
    title: "Error",
    description: errorMessage,
    variant: "destructive",
  });
}
```

## Caching Strategy

React Query configuration:

```typescript
{
  staleTime: 1000 * 60 * 5, // 5 minutes
  refetchOnWindowFocus: false,
  retry: 1,
}
```

- Data is considered fresh for 5 minutes
- No automatic refetch on window focus
- Single retry on failure

## Best Practices

1. **Always use React Query hooks** for data fetching
2. **Never use useEffect** for API calls
3. **Handle loading states** with proper UI feedback
4. **Show error messages** to users with toast notifications
5. **Invalidate queries** after mutations to keep data fresh
6. **Use proper TypeScript types** from `src/types/index.ts`
7. **Centralize query keys** for consistency

## Performance Tips

- React Query automatically caches responses
- Use `enabled` option to conditionally fetch data
- Leverage `staleTime` to reduce unnecessary requests
- Implement optimistic updates for better UX
- Use pagination for large datasets
