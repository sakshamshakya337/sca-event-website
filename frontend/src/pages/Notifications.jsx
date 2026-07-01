import React from 'react'
import PageWrapper from '../components/layout/PageWrapper'
import { CheckCircle2, Info, AlertTriangle, AlertCircle, Trash2, MailOpen, Bell, BellOff } from 'lucide-react'
import useNotificationsStore from '../store/notificationsStore'

export default function Notifications() {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    getUnreadCount,
  } = useNotificationsStore()

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
      default:
        return <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
    }
  }

  const getBg = (type, read) => {
    if (read) return 'bg-white border-outline-variant'
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200'
      case 'warning': return 'bg-amber-50 border-amber-200'
      case 'error':   return 'bg-red-50 border-red-200'
      default:        return 'bg-blue-50 border-blue-200'
    }
  }

  const formatTime = (time) => {
    const date = new Date(time)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const unreadCount = getUnreadCount()

  return (
    <PageWrapper>
      <div className="max-w-[800px] mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-headline-lg text-primary flex items-center gap-2">
              <Bell size={24} />
              Notifications
            </h2>
            <p className="text-body-md text-on-surface-variant mt-1">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                : 'You\'re all caught up!'}
            </p>
          </div>

          {notifications.length > 0 && (
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-secondary border border-secondary/30 rounded-lg hover:bg-secondary/10 transition-all"
                >
                  <MailOpen size={16} />
                  Mark all read
                </button>
              )}
              <button
                onClick={clearAll}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-error border border-error/30 rounded-lg hover:bg-error/10 transition-all"
              >
                <Trash2 size={16} />
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* List */}
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="bg-white border border-outline-variant rounded-xl p-16 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center">
                <BellOff size={28} className="text-on-surface-variant opacity-40" />
              </div>
              <div>
                <p className="font-semibold text-on-surface">No notifications yet</p>
                <p className="text-sm text-on-surface-variant mt-1">
                  Notifications will appear here when events are approved, tasks are assigned, or other activity occurs.
                </p>
              </div>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`border rounded-xl p-4 flex items-start gap-3 cursor-pointer transition-all hover:shadow-sm ${getBg(notification.type, notification.read)}`}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                {getIcon(notification.type)}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`font-semibold text-sm leading-snug ${notification.read ? 'text-on-surface' : 'text-on-surface'}`}>
                      {notification.title}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-on-surface-variant whitespace-nowrap">
                        {formatTime(notification.time)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notification.id)
                        }}
                        className="p-1 hover:bg-black/10 rounded-full transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} className="text-on-surface-variant" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-on-surface-variant mt-0.5 leading-relaxed">
                    {notification.message}
                  </p>
                  {!notification.read && (
                    <span className="inline-block mt-2 text-xs font-semibold text-primary">
                      Tap to mark as read
                    </span>
                  )}
                </div>

                {!notification.read && (
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </PageWrapper>
  )
}
