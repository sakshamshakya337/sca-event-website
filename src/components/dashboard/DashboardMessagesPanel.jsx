import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Circle } from 'lucide-react';
import useNotificationsStore from '../../store/notificationsStore';
import useAuthStore from '../../store/authStore';

export default function DashboardMessagesPanel() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { notifications, fetchNotifications, isLoading } = useNotificationsStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const displayNotifications = notifications.slice(0, 5);

  const formatTime = (time) => {
    const date = new Date(time);
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleNavigate = () => {
    if (!user) return;
    let path = `/${user.role}/notifications`;
    if (user.role === 'superadmin') path = '/admin/notifications';
    if (user.role === 'hod') path = '/faculty/notifications';
    navigate(path);
  };

  return (
    <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant overflow-hidden flex flex-col h-[550px] sticky top-6">
      {/* Header */}
      <div className="bg-[#f27420] text-white px-4 py-3 flex items-center gap-2">
        <MessageSquare size={20} className="shrink-0" />
        <h3 className="font-bold text-base">My Messages</h3>
      </div>

      {/* Messages List */}
      <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
        {isLoading ? (
          <div className="text-center text-sm text-on-surface-variant my-auto py-4">Loading messages...</div>
        ) : displayNotifications.length === 0 ? (
          <div className="text-center text-sm text-on-surface-variant my-auto py-4">No new messages.</div>
        ) : (
          displayNotifications.map((notif, index) => (
            <React.Fragment key={notif._id}>
              {index > 0 && <hr className="border-t border-black/10 my-0" />}
              <div 
                className="flex items-start gap-2 cursor-pointer group"
                onClick={handleNavigate}
              >
              <Circle size={10} className={`shrink-0 mt-1.5 ${notif.isRead ? 'text-outline-variant' : 'text-primary fill-primary'}`} />
              <div className="min-w-0">
                <p className="text-sm text-on-surface font-semibold leading-snug group-hover:text-primary transition-colors">
                  {notif.title}
                </p>
                <p className="text-xs text-on-surface-variant mt-0.5 mb-1 line-clamp-1">
                  By {notif.sender?.firstName ? `${notif.sender.firstName} ${notif.sender.lastName}` : 'System'} ({formatTime(notif.createdAt || notif.time)})
                </p>
                <p className="text-xs text-on-surface-variant line-clamp-3 text-justify leading-relaxed">
                  {notif.message}
                </p>
              </div>
            </div>
          </React.Fragment>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="bg-surface-container-lowest p-3 border-t border-outline-variant/50 flex justify-between items-center mt-auto shrink-0">
        <span className="text-[10px] text-on-surface-variant italic">* Messages Sent by System</span>
        <button 
          onClick={handleNavigate}
          className="bg-[#f27420] hover:bg-[#d9661a] text-white text-xs font-bold py-1.5 px-4 rounded-full transition-colors"
        >
          All Messages
        </button>
      </div>
    </div>
  );
}
