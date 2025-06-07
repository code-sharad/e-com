"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Filter, Search, SortAsc, X } from "lucide-react"

interface SearchFilterBarProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  minPrice: string
  setMinPrice: (price: string) => void
  maxPrice: string
  setMaxPrice: (price: string) => void
  sortBy: string
  handleSortChange: (value: string) => void
  totalProducts: number
}

export function SearchFilterBar({
  searchQuery,
  setSearchQuery,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  sortBy,
  handleSortChange,
  totalProducts,
}: SearchFilterBarProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState([0, 100000])

  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange(value)
    setMinPrice(value[0].toString())
    setMaxPrice(value[1].toString())
  }

  const clearFilters = () => {
    setSearchQuery("")
    setMinPrice("")
    setMaxPrice("")
    setPriceRange([0, 100000])
  }

  return (
    <div className="mb-8 space-y-4">
      {/* Search and Sort Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-4">
          {/* Filter Toggle */}
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="border-gold-200">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>

          {/* Sort */}
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-48 border-gold-200">
              <SortAsc className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="priceAsc">Price: Low to High</SelectItem>
              <SelectItem value="priceDesc">Price: High to Low</SelectItem>
              <SelectItem value="nameAsc">Name: A to Z</SelectItem>
              <SelectItem value="nameDesc">Name: Z to A</SelectItem>
            </SelectContent>
          </Select>

          <p className="text-muted-foreground text-sm">
            {totalProducts} product{totalProducts !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-card rounded-lg p-6 border border-gold-200/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Filters</h3>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price Range */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Price Range</Label>
              <div className="px-2">
                <Slider
                  value={priceRange}
                  onValueChange={handlePriceRangeChange}
                  max={100000}
                  min={0}
                  step={1000}
                  className="w-full"
                />
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>₹{priceRange[0].toLocaleString()}</span>
                <span>-</span>
                <span>₹{priceRange[1].toLocaleString()}</span>
              </div>
            </div>

            {/* Manual Price Input */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Custom Price Range</Label>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Min price"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  type="number"
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  placeholder="Max price"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  type="number"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
