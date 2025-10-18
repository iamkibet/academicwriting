# Contributing Guidelines

This document outlines the development rules and guidelines for the Academic Writing Platform.

## 🔍 Component Development Rules

### MANDATORY: Component Analysis Before Creation

Before creating any new component, you MUST audit existing components for reusable patterns:

1. **Check UI Components**: `@/components/ui/` (shadcn/ui components)
2. **Check Feature Components**: `@/components/` (domain-specific components)
3. **Check Available Hooks**: `@/hooks/` (utility hooks)

### Available Reusable Components

- **UI Primitives**: Button, Card, Input, Dialog, DropdownMenu, Sheet, Tooltip
- **Layout Components**: AppShell, AppSidebar, AppHeader, AppContent
- **Feature Components**: UserInfo, AlertError, Icon, Breadcrumbs
- **Utility Hooks**: useAppearance, useIsMobile, useClipboard, useInitials, useTwoFactorAuth

## 🎯 Code Quality Standards

### Component Creation Checklist

- [ ] Uses `cn()` utility for className merging
- [ ] Includes `data-slot` attribute
- [ ] Supports dark mode
- [ ] Includes proper TypeScript types
- [ ] Follows accessibility standards
- [ ] Uses consistent spacing and colors
- [ ] Exports both component and types

### Styling Rules

- Always use `cn()` from `@/lib/utils`
- Always include `data-slot` attribute
- Always use CSS variables for colors
- Always include dark mode variants
- Always use consistent spacing

## 🚀 Component Extension Patterns

### Extending Existing Components

```typescript
// Extend Button with new variant
import { Button, buttonVariants } from '@/components/ui/button';

const academicButtonVariants = cva(
  buttonVariants({ variant: "default" }),
  {
    variants: {
      academic: {
        primary: "bg-academic-primary text-white",
        secondary: "bg-academic-secondary text-academic-primary",
      },
    },
  }
);
```

### Composing Components

```typescript
// Combine multiple UI components
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

## 📁 File Organization

- **UI Components**: `@/components/ui/`
- **Feature Components**: `@/components/`
- **Layout Components**: `@/layouts/`
- **Page Components**: `@/pages/`
- **Custom Hooks**: `@/hooks/`

## 🔧 Development Workflow

1. **Before Creating New Components:**
   - Search existing components for similar functionality
   - Check if existing components can be extended
   - Verify if a composite component would be better

2. **Code Quality Validation:**
   - Component renders correctly in both light/dark modes
   - Keyboard navigation works
   - Screen reader accessible
   - Responsive design works
   - TypeScript types are correct
