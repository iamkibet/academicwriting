import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface NumberInputProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  className?: string
}

export function NumberInput({ 
  value, 
  onChange, 
  min = 0, 
  max = 100, 
  step = 1,
  className 
}: NumberInputProps) {
  const handleIncrement = () => {
    const newValue = Math.min(value + step, max)
    onChange(newValue)
  }

  const handleDecrement = () => {
    const newValue = Math.max(value - step, min)
    onChange(newValue)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || min
    const clampedValue = Math.min(Math.max(newValue, min), max)
    onChange(clampedValue)
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleDecrement}
        disabled={value <= min}
        className="h-10 w-10 p-0 rounded-none border-gray-300"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        type="number"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        step={step}
        className="w-16 h-10 text-center rounded-none border-gray-300"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleIncrement}
        disabled={value >= max}
        className="h-10 w-10 p-0 rounded-none border-gray-300"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
