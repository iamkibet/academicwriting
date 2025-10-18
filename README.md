# Academic Writing Platform

A modern Laravel + React + Inertia.js application for academic writing management.

## 🚀 Quick Start

```bash
# Install dependencies
composer install
npm install

# Setup environment
cp .env.example .env
php artisan key:generate

# Run database migrations
php artisan migrate

# Start development servers
npm run dev
```

## 🏗️ Tech Stack

- **Backend**: Laravel 12.x with Fortify
- **Frontend**: React 19 + TypeScript + Inertia.js
- **UI**: shadcn/ui + Tailwind CSS 4.0
- **Database**: SQLite
- **Testing**: Pest

## 📋 Development Rules & Guidelines

### 🔍 Component Analysis & Reuse Requirements

**MANDATORY: Before creating any new component, you MUST:**

1. **Audit Existing Components** - Check these directories for reusable patterns:
   - `@/components/ui/` - All shadcn/ui components (Button, Card, Input, Dialog, etc.)
   - `@/components/` - Feature-specific components (AppHeader, AppSidebar, UserInfo, etc.)
   - `@/hooks/` - Available utilities (useAppearance, useIsMobile, useClipboard, etc.)

2. **Component Reuse Priority:**
   ```typescript
   // ✅ ALWAYS check if existing components can be extended
   import { Button, buttonVariants } from '@/components/ui/button';
   import { Card, CardContent, CardHeader } from '@/components/ui/card';
   import { useAppearance } from '@/hooks/use-appearance';
   ```

3. **Available Reusable Components:**
   - **UI Primitives**: Button, Card, Input, Dialog, DropdownMenu, Sheet, Tooltip, etc.
   - **Layout Components**: AppShell, AppSidebar, AppHeader, AppContent
   - **Feature Components**: UserInfo, AlertError, Icon, Breadcrumbs
   - **Utility Hooks**: useAppearance, useIsMobile, useClipboard, useInitials, useTwoFactorAuth

### 🎯 Code Consistency & Quality Rules

**1. Component Creation Standards:**
```typescript
// ✅ CORRECT: Use cn() utility and data-slot attributes
function MyComponent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="my-component"
      className={cn("base-styles", className)}
      {...props}
    />
  );
}

// ✅ CORRECT: Use cva for variants
const myComponentVariants = cva(
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
```

**2. Styling Consistency:**
- **ALWAYS** use `cn()` from `@/lib/utils` for className merging
- **ALWAYS** include `data-slot` attribute for components
- **ALWAYS** use CSS variables for colors (e.g., `bg-primary`, `text-muted-foreground`)
- **ALWAYS** include dark mode variants
- **ALWAYS** use consistent spacing (gap-4, px-6, py-4, etc.)

**3. TypeScript Requirements:**
```typescript
// ✅ CORRECT: Extend React.ComponentProps for HTML elements
interface MyComponentProps extends React.ComponentProps<"div"> {
  variant?: 'default' | 'secondary';
  children: React.ReactNode;
}

// ✅ CORRECT: Use proper type exports
export { MyComponent, myComponentVariants };
export type { MyComponentProps };
```

**4. Accessibility & UX Standards:**
- **ALWAYS** include focus-visible styles
- **ALWAYS** include aria-invalid styles for form validation
- **ALWAYS** use semantic HTML elements
- **ALWAYS** include proper ARIA attributes
- **ALWAYS** ensure keyboard navigation works

### 🚀 Component Extension Patterns

**1. Extending Existing Components:**
```typescript
// ✅ CORRECT: Extend Button with new variant
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

// ✅ CORRECT: Compose existing components
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

### 📁 File Organization Rules

**1. Component Placement:**
- **UI Components**: `@/components/ui/` (shadcn/ui style)
- **Feature Components**: `@/components/` (domain-specific)
- **Layout Components**: `@/layouts/`
- **Page Components**: `@/pages/`
- **Custom Hooks**: `@/hooks/`

**2. Import Order:**
```typescript
// 1. React imports
import React from 'react';

// 2. External library imports
import { Link } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

// 3. Internal UI components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 4. Internal feature components
import { UserInfo } from '@/components/user-info';

// 5. Hooks and utilities
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

// 6. Types
import { type User } from '@/types';
```

### 🔧 Development Workflow

**1. Before Creating New Components:**
- [ ] Search existing components for similar functionality
- [ ] Check if existing components can be extended
- [ ] Verify if a composite component would be better
- [ ] Ensure consistent naming conventions

**2. Code Quality Checklist:**
- [ ] Uses `cn()` utility for className merging
- [ ] Includes `data-slot` attribute
- [ ] Supports dark mode
- [ ] Includes proper TypeScript types
- [ ] Follows accessibility standards
- [ ] Uses consistent spacing and colors
- [ ] Exports both component and types

**3. Testing & Validation:**
- [ ] Component renders correctly in both light/dark modes
- [ ] Keyboard navigation works
- [ ] Screen reader accessible
- [ ] Responsive design works
- [ ] TypeScript types are correct

### 🎨 Design System Integration

**Available Design Tokens:**
- **Colors**: `bg-primary`, `text-muted-foreground`, `border-sidebar-border`
- **Spacing**: `gap-4`, `px-6`, `py-4`, `rounded-xl`
- **Typography**: `text-sm`, `font-medium`, `leading-none`
- **Shadows**: `shadow-xs`, `shadow-sm`
- **Transitions**: `transition-shadow`, `transition-[color,box-shadow]`

## 📚 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run format       # Format code with Prettier
npm run lint         # Run ESLint
npm run types        # Type check with TypeScript
```

## 🧪 Testing

```bash
php artisan test     # Run PHP tests with Pest
```

## 📖 Documentation

- [Laravel Documentation](https://laravel.com/docs)
- [React Documentation](https://react.dev)
- [Inertia.js Documentation](https://inertiajs.com)
- [shadcn/ui Documentation](https://ui.shadcn.com)
