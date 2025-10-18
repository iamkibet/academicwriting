# Development Guide

## Component Development Rules

### 🔍 Pre-Development Checklist

**BEFORE creating any new component, you MUST:**

1. **Audit Existing Components**
   - Search `@/components/ui/` for shadcn/ui components
   - Check `@/components/` for feature-specific components
   - Review `@/hooks/` for available utilities

2. **Component Reuse Priority**
   - Can existing components be extended?
   - Can multiple components be composed together?
   - Is a new component truly necessary?

### Available Components & Utilities

#### UI Components (`@/components/ui/`)
- Button, Card, Input, Dialog, DropdownMenu, Sheet, Tooltip
- Avatar, Badge, Checkbox, Label, Select, Separator
- NavigationMenu, Collapsible, Toggle, ToggleGroup

#### Layout Components (`@/components/`)
- AppShell, AppSidebar, AppHeader, AppContent
- AppSidebarHeader, AppSidebar

#### Feature Components (`@/components/`)
- UserInfo, AlertError, Icon, Breadcrumbs
- NavMain, NavFooter, NavUser
- TwoFactorSetupModal, TwoFactorRecoveryCodes

#### Utility Hooks (`@/hooks/`)
- useAppearance - Theme management
- useIsMobile - Responsive breakpoints
- useClipboard - Copy functionality
- useInitials - Name initials generation
- useTwoFactorAuth - 2FA management

## Code Quality Standards

### Component Structure Template

```typescript
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const componentVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "default-styles",
        secondary: "secondary-styles",
      },
      size: {
        sm: "small-styles",
        lg: "large-styles",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  }
);

interface ComponentProps extends React.ComponentProps<"div">, VariantProps<typeof componentVariants> {
  // Additional props
}

function Component({ className, variant, size, ...props }: ComponentProps) {
  return (
    <div
      data-slot="component"
      className={cn(componentVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Component, componentVariants };
export type { ComponentProps };
```

### Styling Guidelines

#### Required Patterns
- Use `cn()` utility for className merging
- Include `data-slot` attribute
- Use CSS variables for colors
- Include dark mode variants
- Use consistent spacing patterns

#### Color System
```typescript
// Primary colors
bg-primary, text-primary-foreground
bg-secondary, text-secondary-foreground

// Muted colors
bg-muted, text-muted-foreground
bg-accent, text-accent-foreground

// Semantic colors
bg-destructive, text-destructive-foreground
border-input, ring-ring

// Sidebar colors
bg-sidebar, text-sidebar-foreground
bg-sidebar-accent, text-sidebar-accent-foreground
```

#### Spacing System
```typescript
// Consistent spacing patterns
gap-4, px-6, py-4, rounded-xl
gap-6, px-8, py-6, rounded-lg
```

## Accessibility Standards

### Required ARIA Attributes
- `aria-label` for icon-only buttons
- `aria-describedby` for form validation
- `aria-invalid` for error states
- `role` attributes for custom components

### Focus Management
- Always include `focus-visible:` styles
- Ensure keyboard navigation works
- Use proper tab order
- Include focus indicators

### Form Validation
```typescript
// Always include validation styles
className={cn(
  "base-styles",
  "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
  "aria-invalid:border-destructive"
)}
```

## Testing Requirements

### Component Testing Checklist
- [ ] Renders correctly in light mode
- [ ] Renders correctly in dark mode
- [ ] Responds to all variant props
- [ ] Handles all size props
- [ ] Keyboard navigation works
- [ ] Screen reader accessible
- [ ] TypeScript types are correct
- [ ] No console errors or warnings

## File Organization

### Directory Structure
```
resources/js/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── app-*.tsx        # App-specific components
│   ├── nav-*.tsx        # Navigation components
│   └── *-error.tsx      # Error handling components
├── hooks/
│   ├── use-*.ts         # Utility hooks
│   └── use-*.tsx        # Component hooks
├── layouts/
│   ├── app-layout.tsx   # Main layout wrapper
│   └── app/             # Layout components
├── pages/               # Inertia.js pages
└── types/               # TypeScript definitions
```

### Import Order
```typescript
// 1. React imports
import React from 'react';

// 2. External libraries
import { Link } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

// 3. Internal UI components
import { Button } from '@/components/ui/button';

// 4. Internal feature components
import { UserInfo } from '@/components/user-info';

// 5. Hooks and utilities
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

// 6. Types
import { type User } from '@/types';
```

## Performance Considerations

### Component Optimization
- Use `React.memo()` for expensive components
- Use `useCallback()` for event handlers
- Use `useMemo()` for expensive calculations
- Avoid unnecessary re-renders

### Bundle Size
- Import only needed components
- Use tree-shaking friendly imports
- Avoid importing entire libraries
- Use dynamic imports for large components

## Common Patterns

### Form Components
```typescript
// Use existing Input component
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function FormField({ label, error, ...props }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={props.id}>{label}</Label>
      <Input {...props} />
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}
```

### Modal Components
```typescript
// Use existing Dialog component
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

function MyModal({ open, onOpenChange, title, children }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
```

### Loading States
```typescript
// Use existing Skeleton component
import { Skeleton } from '@/components/ui/skeleton';

function LoadingCard() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
}
```
