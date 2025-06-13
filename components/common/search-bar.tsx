"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
  initialQuery?: string
}

export default function SearchBar({ onSearch, placeholder = "Search products...", className = "", initialQuery = "" }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery)

  // Update search query when initialQuery changes
  useEffect(() => {
    setSearchQuery(initialQuery)
  }, [initialQuery])

  // Effect to trigger search when query changes (with debouncing)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, onSearch])

  const handleClear = () => {
    setSearchQuery("")
    onSearch("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchQuery)
  }

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-20"
        />
        {searchQuery && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-12 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        <Button
          type="submit"
          size="sm"
          className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-gold-500 hover:bg-gold-600 text-black"
        >
          Search
        </Button>
      </div>
    </form>
  )
}


