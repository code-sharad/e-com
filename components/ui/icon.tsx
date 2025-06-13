"use client"

import React from 'react'
import * as LucideIcons from 'lucide-react'
import { IconProps } from 'lucide-react'

interface IconComponentProps extends IconProps {
  name: keyof typeof LucideIcons
}

export const Icon = ({ name, ...props }: IconComponentProps) => {
  const LucideIcon = LucideIcons[name]
  return LucideIcon ? <LucideIcon {...props} /> : null
}

// Export all icon names for convenience
export const IconNames = Object.keys(LucideIcons).filter(
  (key) => typeof LucideIcons[key as keyof typeof LucideIcons] === 'function'
) as (keyof typeof LucideIcons)[]

