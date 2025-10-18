import * as React from "react"
import { cn } from "@/lib/utils"

interface SegmentedControlProps {
  value: string
  onValueChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  className?: string
}

export function SegmentedControl({ 
  value, 
  onValueChange, 
  options, 
  className 
}: SegmentedControlProps) {
  return (
    <div className={cn("inline-flex bg-gray-100 p-1", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onValueChange(option.value)}
          className={cn(
            "px-4 py-2.5 text-sm font-medium transition-colors",
            value === option.value
              ? "bg-white text-gray-900 shadow-sm border border-gray-200"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
