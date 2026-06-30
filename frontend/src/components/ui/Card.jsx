import { cn } from '../../lib/utils'

export default function Card({ children, className = '' }) {
  return (
    <div className={cn(
      'bg-white dark:bg-slate-900 rounded-card shadow-card border border-slate-200 dark:border-slate-800',
      className
    )}>
      {children}
    </div>
  )
}
