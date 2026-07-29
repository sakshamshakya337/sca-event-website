import React from 'react'
import { Inbox } from 'lucide-react'

export function EmptyState({ 
  icon: Icon = Inbox, 
  title = "No Data Found", 
  description = "There is nothing to display here at the moment.", 
  action 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-on-surface-variant opacity-60" />
      </div>
      <h3 className="text-lg font-bold text-primary mb-2">{title}</h3>
      <p className="text-sm text-on-surface-variant max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {action && (
        <div>{action}</div>
      )}
    </div>
  )
}
