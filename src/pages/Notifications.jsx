import React, { useState, useEffect } from 'react'
import PageWrapper from '../components/layout/PageWrapper'
import {
  CheckCircle2,
  Info,
  AlertTriangle,
  AlertCircle,
  Trash2,
  MailOpen,
  Bell,
  BellOff,
  X,
} from "lucide-react";
import useNotificationsStore from '../store/notificationsStore'
import useAuthStore from '../store/authStore'

export default function Notifications() {
  const {
    notifications,
    fetchNotifications,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    getUnreadCount,
    sendAdminNotification,
  } = useNotificationsStore()

  const { user } = useAuthStore()
  const [showSendModal, setShowSendModal] = useState(false)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [targetIds, setTargetIds] = useState('')
  const [type, setType] = useState('info')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

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

          <div className="flex items-center flex-wrap gap-2">
            {['admin', 'superadmin', 'dean', 'hos'].includes(user?.role) && (
              <button
                onClick={() => {
                  setShowSendModal(true)
                  setResult(null)
                  setTitle('')
                  setMessage('')
                  setTargetIds('')
                  setType('info')
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:opacity-90 transition-all shadow-sm"
              >
                <Bell size={16} />
                Send Notification
              </button>
            )}
            {notifications.length > 0 && (
              <>
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
              </>
            )}
          </div>
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

      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !sending && setShowSendModal(false)}></div>
          <div className="bg-surface w-full max-w-lg rounded-2xl shadow-2xl relative z-10 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-on-surface">Broadcast Notification</h2>
              <button onClick={() => !sending && setShowSendModal(false)} className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-full transition-colors" disabled={sending}>
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
              {result && (
                <div className={`p-4 rounded-xl border text-sm ${result.missingIds?.length > 0 ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-green-50 border-green-200 text-green-900'}`}>
                  <p className="font-bold">Notification process complete:</p>
                  <p>Sent to {result.successCount} users.</p>
                  {result.missingIds?.length > 0 && (
                    <div className="mt-2 text-xs">
                      <p className="font-semibold text-amber-700">Unrecognized ID(s):</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {result.missingIds.map(id => (
                          <span key={id} className="bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded font-mono text-[10px]">{id}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-sm font-semibold text-on-surface-variant">Notification Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {['info', 'success', 'warning', 'error'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`py-2 px-3 text-xs font-bold rounded-lg border uppercase transition-all ${
                        type === t
                          ? t === 'info' ? 'bg-blue-100 border-blue-500 text-blue-700' :
                            t === 'success' ? 'bg-green-100 border-green-500 text-green-700' :
                            t === 'warning' ? 'bg-amber-100 border-amber-500 text-amber-700' :
                            'bg-red-100 border-red-500 text-red-700'
                          : 'bg-white border-outline-variant text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-on-surface-variant">Title</label>
                <input
                  className="w-full bg-white border border-outline-variant rounded-xl px-3 py-2 text-body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none placeholder:text-on-surface-variant/40"
                  placeholder="Alert Title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={sending}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-on-surface-variant">Message</label>
                <textarea
                  className="w-full min-h-[100px] bg-white border border-outline-variant rounded-xl p-3 text-body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none placeholder:text-on-surface-variant/40 resize-y"
                  placeholder="Write details of the notification here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={sending}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-on-surface-variant">Target Users (Registration Numbers / Employee IDs)</label>
                <textarea
                  className="w-full min-h-[80px] bg-white border border-outline-variant rounded-xl p-3 text-body-md font-mono placeholder:font-sans focus:ring-2 focus:ring-secondary/20 focus:outline-none placeholder:text-on-surface-variant/40 resize-y"
                  placeholder="e.g. 12210452, 12210542, EMP10294 (comma or space separated)"
                  value={targetIds}
                  onChange={(e) => setTargetIds(e.target.value)}
                  disabled={sending}
                />
              </div>
            </div>

            <div className="p-6 border-t border-outline-variant flex justify-end gap-3 shrink-0 bg-surface">
              <button
                onClick={() => setShowSendModal(false)}
                className="px-5 py-2 border border-outline-variant text-on-surface font-bold rounded-lg hover:bg-surface-container transition-all"
                disabled={sending}
              >
                Close
              </button>
              <button
                onClick={async () => {
                  if (!title.trim() || !message.trim() || !targetIds.trim()) {
                    alert('Please fill out all fields')
                    return
                  }
                  setSending(true)
                  setResult(null)
                  try {
                    const ids = targetIds.split(/[\s,]+/).map(id => id.trim()).filter(Boolean)
                    const data = await sendAdminNotification({
                      title: title.trim(),
                      message: message.trim(),
                      targetIds: ids,
                      type
                    })
                    setResult(data)
                    setTitle('')
                    setMessage('')
                    setTargetIds('')
                  } catch (err) {
                    alert(err.message || 'Failed to send notification')
                  } finally {
                    setSending(false)
                  }
                }}
                disabled={sending || !title.trim() || !message.trim() || !targetIds.trim()}
                className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
              >
                {sending ? 'Sending...' : 'Broadcast'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  )
}
