import { cn } from '../../lib/utils'

export default function Card({ children, className = '' }) {
  return (
    <div className={cn(
      'bg-surface-card rounded-card shadow-card border border-outline-variant',
      className
    )}>
      {children}
    </div>
  )
}
