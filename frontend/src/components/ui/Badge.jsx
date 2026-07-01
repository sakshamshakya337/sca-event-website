import { cn } from '../../lib/utils'

export default function BadgeCheck({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-surface-container text-on-surface-variant',
    pending: 'bg-primary-fixed text-on-primary-fixed',
    approved: 'bg-secondary-container text-on-secondary-container',
    rejected: 'bg-error-container text-on-error-container',
    completed: 'bg-tertiary-container text-on-tertiary-container',
  }

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-medium',
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}
