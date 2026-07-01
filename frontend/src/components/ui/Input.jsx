import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

const Input = forwardRef(({
  label,
  error,
  helper,
  icon,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-label-md font-semibold text-on-surface">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full py-2.5 rounded-btn border bg-surface-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all',
            icon ? 'pl-10 pr-4' : 'px-4',
            error
              ? 'border-error focus:ring-error/20 focus:border-error'
              : 'border-outline-variant',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-label-sm text-error">{error}</p>}
      {helper && !error && <p className="text-label-sm text-on-surface-variant">{helper}</p>}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
