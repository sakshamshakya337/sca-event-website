import React from 'react'
import PageWrapper from '../components/layout/PageWrapper'
import { MdCheckCircle, MdInfo, MdWarning, MdError, MdDelete, MdMarkEmailRead } from 'react-icons/md'
import useNotificationsStore from '../store/notificationsStore'

export default function Notifications() {
  const { notifications, markAsRead, markAllAsRead, deleteNotification, getUnreadCount } = useNotificationsStore()

  const getIcon = (type) => {
    switch(type) {
      case 'success':
        return <MdCheckCircle className="w-6 h-6 text-green-600" />
      case 'warning':
        return <MdWarning className="w-6 h-6 text-amber-600" />
      case 'error':
        return <MdError className="w-6 h-6 text-red-600" />
      default:
        return <MdInfo className="w-6 h-6 text-blue-600" />
    }
  }

  const formatTime = (time) => {
    const date = new Date(time)
    return date.toLocaleString()
  }

  const unreadCount = getUnreadCount()

  return (
    <PageWrapper>
      <div className="max-w-[1000px] mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-headline-lg text-headline-lg text-primary">Notifications</h2>
            <p className="text-body-md text-on-surface-variant">{unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-surface-container text-secondary border border-outline-variant rounded-lg hover:bg-surface-container-high transition-all"
            >
              <MdMarkEmailRead size={18} />
              Mark All as Read
            </button>
          )}
        </div>

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="bg-surface-container border border-outline-variant rounded-xl p-8 text-center">
              <MdInfo className="w-12 h-12 text-on-surface-variant mx-auto mb-4" />
              <p className="text-body-md text-on-surface">No notifications yet!</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-surface-container border border-outline-variant rounded-xl p-4 flex items-start gap-4 transition-all ${
                  !notification.read ? 'bg-primary/5 border-primary/20' : ''
                }`}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                {getIcon(notification.type)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-body-lg font-semibold text-primary">{notification.title}</h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notification.id)
                      }}
                      className="p-1 hover:bg-surface-container-high rounded-full"
                    >
                      <MdDelete size={18} className="text-on-surface-variant" />
                    </button>
                  </div>
                  <p className="text-body-md text-on-surface-variant">{notification.message}</p>
                  <p className="text-body-sm text-on-surface-variant mt-1">{formatTime(notification.time)}</p>
                </div>
                {!notification.read && (
                  <div className="w-3 h-3 rounded-full bg-secondary flex-shrink-0" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </PageWrapper>
  )
}