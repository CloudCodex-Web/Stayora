import { useEffect, useState } from "react";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotifications,
  subscribeToNotifications,
} from "../../utils/notifications";

function AdminNotifications() {
  const [notifications, setNotifications] = useState(getNotifications);

  useEffect(() => {
    return subscribeToNotifications(() => {
      setNotifications(getNotifications());
    });
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your hotel notifications.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={markAllNotificationsAsRead}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Mark all as read
          </button>

          <button
            onClick={() => {
              if (window.confirm("Clear all notifications?")) {
                clearNotifications();
              }
            }}
            className="rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
          >
            Clear all
          </button>
        </div>
      </div>

      <p className="text-sm text-slate-500">
        {unreadCount} unread notifications
      </p>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <h2 className="font-semibold text-slate-700">
              No notifications yet
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              New booking and cancellation alerts will appear here.
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5 ${
                notification.read
                  ? "border-slate-200 bg-white"
                  : "border-blue-200 bg-blue-50/50"
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-800">
                    {notification.title}
                  </h3>

                  {!notification.read && (
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                  )}
                </div>

                <p className="mt-1 text-sm text-slate-600">
                  {notification.message}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>

              {!notification.read && (
                <button
                  onClick={() => markNotificationAsRead(notification.id)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Mark as read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminNotifications;
