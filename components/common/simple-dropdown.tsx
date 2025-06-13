"use client"

import { useState, useRef, useEffect } from "react"
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SimpleDropdownProps {
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}

export function SimpleDropdown({ onView, onEdit, onDelete }: SimpleDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
      >
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">Open menu</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-8 z-50 min-w-[160px] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
          <button
            className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
            onClick={(e) => {
              e.stopPropagation()
              onView()
              setIsOpen(false)
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Product
          </button>
          <button
            className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
              setIsOpen(false)
            }}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Product
          </button>
          <button
            className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
              setIsOpen(false)
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Product
          </button>
        </div>
      )}
    </div>
  )
}

