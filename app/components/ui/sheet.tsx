'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/app/lib/utils'

// Simplified Sheet component without Radix UI
export function Sheet({ 
  children, 
  open, 
  onOpenChange 
}: { 
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  if (!open) return null
  
  return (
    <div className="fixed inset-0 z-50">
      <div 
        className="fixed inset-0 bg-black/80" 
        onClick={() => onOpenChange?.(false)}
      />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 p-6 shadow-xl overflow-y-auto">
        {children}
      </div>
    </div>
  )
}

export function SheetTrigger({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return <div onClick={onClick} className="cursor-pointer">{children}</div>
}

export function SheetContent({ 
  children, 
  className,
  side = 'right'
}: { 
  children: React.ReactNode
  className?: string
  side?: 'top' | 'bottom' | 'left' | 'right'
}) {
  return (
    <div className={cn(
      'relative w-full',
      className
    )}>
      {children}
    </div>
  )
}

export function SheetHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex flex-col space-y-2', className)}>{children}</div>
}

export function SheetTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn('text-lg font-semibold', className)}>{children}</h2>
}

export function SheetDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('text-sm text-gray-500', className)}>{children}</p>
}

export function SheetFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}>{children}</div>
}

export function SheetClose({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return <button onClick={onClick}>{children}</button>
                              } 
