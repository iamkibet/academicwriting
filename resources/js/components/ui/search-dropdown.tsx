import * as React from "react"
import { cn } from "@/lib/utils"
import { Search, ChevronDown, Check } from "lucide-react"

interface SearchDropdownOption {
  value: string
  label: string
  description?: string
}

interface SearchDropdownProps {
  value: string
  onValueChange: (value: string) => void
  options: SearchDropdownOption[]
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function SearchDropdown({
  value,
  onValueChange,
  options,
  placeholder = "Select...",
  className,
  disabled = false
}: SearchDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [focusedIndex, setFocusedIndex] = React.useState(-1)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // Filter options based on search term
  const filteredOptions = React.useMemo(() => {
    if (!searchTerm) return options
    return options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (option.description && option.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [options, searchTerm])

  // Get selected option
  const selectedOption = options.find(option => option.value === value)

  // Handle option selection
  const handleSelect = (option: SearchDropdownOption) => {
    onValueChange(option.value)
    setIsOpen(false)
    setSearchTerm("")
    setFocusedIndex(-1)
  }

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    
    // If user types and there's a matching option, select it
    const matchingOption = options.find(option => 
      option.label.toLowerCase() === value.toLowerCase()
    )
    if (matchingOption) {
      onValueChange(matchingOption.value)
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        setIsOpen(true)
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
          handleSelect(filteredOptions[focusedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setSearchTerm("")
        setFocusedIndex(-1)
        break
    }
  }

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm("")
        setFocusedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Reset focused index when filtered options change
  React.useEffect(() => {
    setFocusedIndex(-1)
  }, [filteredOptions])

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={isOpen ? searchTerm : (selectedOption ? selectedOption.label : "")}
          onChange={handleSearchChange}
          onFocus={() => !disabled && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-full h-12 pl-10 pr-10 py-3 text-sm bg-white border border-gray-300 rounded-md",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            "hover:border-gray-400 transition-colors",
            disabled && "opacity-50 cursor-not-allowed",
            isOpen && "ring-2 ring-blue-500 border-blue-500"
          )}
        />
        <ChevronDown className={cn(
          "absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-transform",
          isOpen && "rotate-180"
        )} />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-hidden">
          {/* Options List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={cn(
                    "w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none",
                    "flex items-center justify-between",
                    index === focusedIndex && "bg-gray-50",
                    value === option.value && "bg-blue-50"
                  )}
                >
                  <div className="text-sm font-medium text-gray-900">
                    {option.label}
                  </div>
                  {value === option.value && (
                    <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
