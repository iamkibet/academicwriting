import * as React from "react"
import { cn } from "@/lib/utils"

interface SegmentedControlProps {
  value: string
  onValueChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  className?: string
  containerClassName?: string
  buttonClassName?: string
  activeButtonClassName?: string
  inactiveButtonClassName?: string
  textSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl'
  padding?: 'sm' | 'md' | 'lg' | 'xl'
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  style?: React.CSSProperties
}

export function SegmentedControl({ 
  value, 
  onValueChange, 
  options, 
  className,
  containerClassName,
  buttonClassName,
  activeButtonClassName,
  inactiveButtonClassName,
  textSize = 'sm',
  padding = 'md',
  rounded = 'none',
  style
}: SegmentedControlProps) {
  // Text size classes
  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  }

  // Padding classes
  const paddingClasses = {
    sm: 'px-2 py-1',
    md: 'px-4 py-2.5',
    lg: 'px-6 py-3',
    xl: 'px-8 py-4'
  }

  // Rounded classes
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
  }

  return (
    <div className={cn(
      "inline-flex ",
      containerClassName || className
    )}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onValueChange(option.value)}
          className={cn(
            "font-medium transition-colors",
            textSizeClasses[textSize],
            paddingClasses[padding],
            roundedClasses[rounded],
            buttonClassName,
            value === option.value
              ? cn(
                  "text-white shadow-sm",
                  activeButtonClassName
                )
              : cn(
                  "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                  inactiveButtonClassName
                )
          )}
          style={value === option.value && (style as any)?.['--active-bg'] ? { backgroundColor: (style as any)['--active-bg'] as string } : undefined}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
