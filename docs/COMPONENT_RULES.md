# Component Development Rules - Quick Reference

## 🚨 MANDATORY: Before Creating Any Component

### 1. Check Existing Components
```bash
# Search these directories first:
@/components/ui/          # shadcn/ui components
@/components/             # feature components  
@/hooks/                  # utility hooks
```

### 2. Available Reusable Components

#### UI Components
- `Button`, `Card`, `Input`, `Dialog`, `DropdownMenu`, `Sheet`, `Tooltip`
- `Avatar`, `Badge`, `Checkbox`, `Label`, `Select`, `Separator`
- `NavigationMenu`, `Collapsible`, `Toggle`, `ToggleGroup`

#### Layout Components
- `AppShell`, `AppSidebar`, `AppHeader`, `AppContent`

#### Feature Components
- `UserInfo`, `AlertError`, `Icon`, `Breadcrumbs`
- `NavMain`, `NavFooter`, `NavUser`

#### Utility Hooks
- `useAppearance`, `useIsMobile`, `useClipboard`, `useInitials`

## ✅ Component Template

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
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface ComponentProps extends React.ComponentProps<"div">, VariantProps<typeof componentVariants> {}

function Component({ className, variant, ...props }: ComponentProps) {
  return (
    <div
      data-slot="component"
      className={cn(componentVariants({ variant, className }))}
      {...props}
    />
  );
}

export { Component, componentVariants };
export type { ComponentProps };
```

## 🎨 Required Styling Patterns

### Always Include:
- `cn()` utility for className merging
- `data-slot` attribute
- CSS variables for colors (`bg-primary`, `text-muted-foreground`)
- Dark mode variants
- Focus-visible styles
- Accessibility attributes

### Color System:
```typescript
// Primary
bg-primary, text-primary-foreground

// Secondary  
bg-secondary, text-secondary-foreground

// Muted
bg-muted, text-muted-foreground

// Semantic
bg-destructive, text-destructive-foreground
border-input, ring-ring
```

### Spacing:
```typescript
gap-4, px-6, py-4, rounded-xl
```

## 🔧 Extension Patterns

### Extend Existing Component:
```typescript
import { Button, buttonVariants } from '@/components/ui/button';

const academicButtonVariants = cva(
  buttonVariants({ variant: "default" }),
  {
    variants: {
      academic: {
        primary: "bg-academic-primary text-white",
      },
    },
  }
);
```

### Compose Multiple Components:
```typescript
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function AcademicCard({ title, content, actionText }: Props) {
  return (
    <Card>
      <CardHeader>
        <h3>{title}</h3>
      </CardHeader>
      <CardContent>
        <p>{content}</p>
        <Button>{actionText}</Button>
      </CardContent>
    </Card>
  );
}
```

## 📋 Quality Checklist

- [ ] Uses `cn()` utility
- [ ] Includes `data-slot` attribute  
- [ ] Supports dark mode
- [ ] Has proper TypeScript types
- [ ] Includes accessibility attributes
- [ ] Uses consistent spacing/colors
- [ ] Exports component and types
- [ ] Keyboard navigation works
- [ ] Screen reader accessible

## 📁 File Organization

```
resources/js/
├── components/
│   ├── ui/              # shadcn/ui components
│   └── [feature].tsx    # feature components
├── hooks/               # utility hooks
├── layouts/             # layout components
├── pages/               # Inertia.js pages
└── types/               # TypeScript types
```

## 🔗 Import Order

```typescript
// 1. React
import React from 'react';

// 2. External libraries  
import { Link } from '@inertiajs/react';

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

## 🚀 Quick Commands

```bash
# Add new shadcn/ui component
npx shadcn@latest add [component-name]

# Type check
npm run types

# Format code
npm run format

# Lint code
npm run lint
```
