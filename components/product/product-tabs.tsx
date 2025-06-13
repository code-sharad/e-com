"use client"

import { useState } from 'react'
import { cn } from '@/lib/utils/common'
import { Product } from '@/types/product'

interface ProductTabsProps {
  product: Product
}

export function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState('details')

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-8" aria-label="Product details navigation">
          <button
            onClick={() => setActiveTab('details')}
            className={cn(
              "border-b-2 py-4 text-sm font-medium transition-colors hover:text-primary",
              activeTab === 'details'
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground"
            )}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('specifications')}
            className={cn(
              "border-b-2 py-4 text-sm font-medium transition-colors hover:text-primary",
              activeTab === 'specifications'
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground"
            )}
          >
            Specifications
          </button>
          <button
            onClick={() => setActiveTab('care')}
            className={cn(
              "border-b-2 py-4 text-sm font-medium transition-colors hover:text-primary",
              activeTab === 'care'
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground"
            )}
          >
            Care Instructions
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="py-6">
        {activeTab === 'details' && (
          <div className="prose dark:prose-invert max-w-none">
            <p className="whitespace-pre-line">{product.description}</p>
            {product.features && product.features.length > 0 && (
              <>
                <h3 className="text-lg font-semibold mt-6 mb-4">Key Features</h3>
                <ul>
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        {activeTab === 'specifications' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(product.specifications || {}).map(([key, value]) => (
              <div key={key} className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-muted-foreground">{key}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
            {product.weight && (
              <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-muted-foreground">Weight</span>
                <span className="font-medium">{product.weight}</span>
              </div>
            )}
            {product.dimensions && (
              <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-muted-foreground">Dimensions</span>
                <span className="font-medium">{`${product.dimensions.length}x${product.dimensions.width}x${product.dimensions.height}`}</span>
              </div>
            )}
            {product.material && (
              <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-muted-foreground">Material</span>
                <span className="font-medium">{product.material}</span>
              </div>
            )}
          </div>
        )}

        {activeTab === 'care' && (
          <div className="prose dark:prose-invert max-w-none">
            {product.careInstructions ? (
              <p className="whitespace-pre-line">{product.careInstructions}</p>
            ) : (
              <p className="text-muted-foreground">No specific care instructions provided for this product.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 
