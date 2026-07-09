import { cn } from '../../lib/utils'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  ...props
}) {
  const baseStyles = 'rounded-btn font-semibold transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]'
  
  const variants = {
    primary: 'bg-primary text-on-primary hover:opacity-90 shadow-md',
    secondary: 'bg-secondary text-on-secondary hover:opacity-90 shadow-md',
    outline: 'border border-outline bg-transparent text-on-surface hover:bg-surface-container',
    danger: 'bg-error text-on-error hover:opacity-90 shadow-md',
    ghost: 'bg-transparent hover:bg-surface-container text-on-surface',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-label-md',
    md: 'px-4 py-2.5 text-label-md',
    lg: 'px-6 py-3 text-body-lg',
  }

  return (
    <button
      disabled={disabled}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        disabled && 'opacity-50 cursor-not-allowed active:scale-100',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
