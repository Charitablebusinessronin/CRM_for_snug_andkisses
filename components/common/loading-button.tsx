"use client"

import * as React from 'react'
import { Button } from '@/components/ui/button'

export type LoadingButtonProps = React.ComponentProps<typeof Button> & {
  loading?: boolean
  spinnerClassName?: string
}

export function LoadingButton({
  loading,
  disabled,
  className,
  children,
  spinnerClassName,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      {...props}
      disabled={disabled || loading}
      className={`relative ${className ?? ''}`}
    >
      <span className={loading ? 'opacity-0' : 'opacity-100'}>{children}</span>
      {loading && (
        <span className={`absolute inset-0 flex items-center justify-center ${spinnerClassName ?? ''}`}>
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </span>
      )}
    </Button>
  )
}

export default LoadingButton
