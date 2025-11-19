# Contributing Guidelines

## Development Workflow

### Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Start development server: `npm run dev`

### Code Standards

#### TypeScript

- **Strict mode enabled** - No `any` types allowed
- Use proper interfaces for all data structures
- Leverage type inference where appropriate
- Export types from `src/types/index.ts`

```typescript
// ❌ Bad
function processLead(data: any) {
  return data.name;
}

// ✅ Good
import { Lead } from "@/types";

function processLead(lead: Lead): string {
  return lead.full_name;
}
```

#### Imports

- Use path aliases (`@/`) instead of relative imports
- Group imports logically:
  1. External packages
  2. Internal modules
  3. Components
  4. Utils/Constants
  5. Types

```typescript
// ✅ Good
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/dateUtils";
import { LEAD_STATUSES } from "@/constants/leadConstants";
import type { Lead } from "@/types";
```

#### Constants

- Extract all magic numbers and strings
- Use `as const` for type safety
- Group related constants in dedicated files

```typescript
// ❌ Bad
if (score >= 80) {
  return "high";
}

// ✅ Good
import { SCORE_THRESHOLDS } from "@/constants/appConstants";

if (score >= SCORE_THRESHOLDS.HIGH) {
  return "high";
}
```

#### React Components

- Use functional components with hooks
- Proper prop typing with interfaces
- Default props for optional values
- Error boundaries for error handling

```typescript
// ✅ Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

export function CustomButton({ 
  label, 
  onClick, 
  variant = "primary" 
}: ButtonProps) {
  return (
    <button onClick={onClick} className={variant}>
      {label}
    </button>
  );
}
```

#### Data Fetching

- Use React Query hooks from `src/hooks/useQueries.ts`
- Never use `useEffect` for data fetching
- Handle loading and error states properly

```typescript
// ❌ Bad
useEffect(() => {
  fetchLeads().then(setLeads);
}, []);

// ✅ Good
import { useLeads } from "@/hooks/useQueries";

const { data: leads, isLoading, error } = useLeads();
```

#### Error Handling

- Use try-catch for async operations
- Proper error typing (no `any`)
- User-friendly error messages
- Toast notifications for feedback

```typescript
// ✅ Good
try {
  await createLead(data);
  toast({
    title: "Lead creado",
    description: "El lead ha sido creado exitosamente",
  });
} catch (error) {
  const errorMessage = error instanceof Error 
    ? error.message 
    : "Error al crear el lead";
  toast({
    title: "Error",
    description: errorMessage,
    variant: "destructive",
  });
}
```

#### Styling

- Use Tailwind CSS utility classes
- Follow shadcn/ui patterns
- Mobile-first responsive design
- Support dark mode

```typescript
// ✅ Good
<div className="flex flex-col gap-4 p-4 md:flex-row md:gap-6 md:p-6">
  <Card className="bg-white dark:bg-gray-800">
    {/* Content */}
  </Card>
</div>
```

### File Organization

```
src/
├── components/
│   ├── [feature]/          # Feature-specific components
│   │   ├── Component.tsx
│   │   └── index.tsx       # Re-export components
│   └── ui/                 # shadcn/ui components
├── constants/              # Application constants
├── contexts/               # React contexts
├── hooks/                  # Custom hooks
├── lib/                    # Library configurations
├── services/               # API services
├── types/                  # TypeScript types
└── utils/                  # Utility functions
```

### Naming Conventions

- **Components**: PascalCase (`LeadForm.tsx`)
- **Hooks**: camelCase with `use` prefix (`useLeads.ts`)
- **Utils**: camelCase (`formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (`LEAD_STATUSES`)
- **Types**: PascalCase (`Lead`, `LeadFormData`)

### Git Commit Messages

Follow conventional commits:

```
feat: add franchise management feature
fix: resolve lead status update bug
refactor: extract duplicate helper functions
docs: update README with setup instructions
style: format code with prettier
test: add unit tests for lead helpers
chore: update dependencies
```

### Testing

- Write unit tests for utility functions
- Integration tests for critical flows
- E2E tests for main user journeys

### Performance

- Use React Query caching
- Lazy load routes and components
- Optimize re-renders with memoization
- Database indexes on frequently queried columns

### Security

- Never commit sensitive data
- Use environment variables for secrets
- Validate all user inputs
- Sanitize data before database operations
- Implement proper RLS policies (when enabled)

### Accessibility

- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Screen reader compatibility

### Before Submitting

- [ ] Code follows style guidelines
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No linting errors (`npm run lint`)
- [ ] All tests pass
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] Proper error handling
- [ ] Responsive design tested

### Code Review Checklist

- [ ] Code is readable and maintainable
- [ ] No code duplication
- [ ] Proper error handling
- [ ] Type safety maintained
- [ ] Performance considerations
- [ ] Security best practices
- [ ] Accessibility standards met

## Questions?

If you have questions about these guidelines, please reach out to the team lead.
