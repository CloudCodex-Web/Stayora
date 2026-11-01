import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Trash2,
  CalendarCheck,
  AlertCircle,
  Info,
  BellOff,
  ArrowRight,
  Clock,
} from "lucide-react";

import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

import {
  getUserNotifications,
  markUserNotificationAsRead,
  markAllUserNotificationsAsRead,
  clearUserNotifications,
  subscribeToUserNotifications,
} from "../utils/notifications";

function formatDate(date) {
  if (!date) return "Recently";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Recently";

  return parsed.toLocaleString("en-NP", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getNotificationStyle(type) {
  switch (type) {
    case "success":
      return {
        icon: CheckCheck,
        color: "bg-emerald-100 text-emerald-700",
      };

    case "warning":
      return {
        icon: AlertCircle,
        color: "bg-amber-100 text-amber-700",
      };

    case "cancellation":
      return {
        icon: AlertCircle,
        color: "bg-red-100 text-red-700",
      };

    case "booking":
      return {
        icon: CalendarCheck,
        color: "bg-blue-100 text-blue-700",
      };

    default:
      return {
        icon: Info,
        color: "bg-gray-100 text-gray-700",
      };
  }
}

function GuestNotifications() {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    const email = user?.email?.trim().toLowerCase();

    if (!email) {
      setNotifications([]);
      return;
    }

    function loadNotifications() {
      setNotifications(getUserNotifications(email));
    }

    loadNotifications();

    const unsubscribe = subscribeToUserNotifications(email, loadNotifications);

    return unsubscribe;
  }, [user?.email]);

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  const filteredNotifications =
    activeFilter === "Unread"
      ? notifications.filter((notification) => !notification.read)
      : notifications;

  function handleMarkAsRead(id) {
    if (!user?.email) return;

    markUserNotificationAsRead(user.email, id);
  }

  function handleMarkAllAsRead() {
    if (!user?.email || unreadCount === 0) return;

    markAllUserNotificationsAsRead(user.email);
  }

  function handleClearAll() {
    if (!user?.email || notifications.length === 0) return;

    const confirmed = window.confirm(
      "Are you sure you want to clear all your notifications?",
    );

    if (!confirmed) return;

    clearUserNotifications(user.email);
  }

  if (!user) {
    return (
      <>
        <Navbar />

        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
            <Bell className="mx-auto h-14 w-14 text-emerald-700" />

            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              Login to view notifications
            </h1>

            <p className="mt-2 text-gray-500">
              Sign in to see your booking updates and notifications.
            </p>

            <Link
              to="/login"
              className="mt-6 inline-block rounded-xl bg-emerald-700 px-6 py-3 font-semibold text-white hover:bg-emerald-800"
            >
              Login
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
              Your Stayora account
            </p>

            <h1 className="mt-2 flex items-center gap-3 text-3xl font-extrabold text-gray-900">
              Notifications
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-700">
                  {unreadCount} new
                </span>
              )}
            </h1>

            <p className="mt-2 text-gray-500">
              Stay updated about your hotel booking requests.
            </p>
          </div>

          <Link
            to="/my-bookings"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-emerald-300 hover:text-emerald-700"
          >
            My Bookings
            <ArrowRight size={17} />
          </Link>
        </div>

        {/* Statistics */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Notifications</p>

            <p className="mt-2 text-3xl font-extrabold text-gray-900">
              {notifications.length}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Unread Notifications</p>

            <p className="mt-2 text-3xl font-extrabold text-emerald-700">
              {unreadCount}
            </p>
          </div>
        </div>

        {/* Controls */}
        <section className="mb-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              {["All", "Unread"].map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                    activeFilter === filter
                      ? "bg-emerald-700 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-emerald-50"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <CheckCheck size={16} />
                Mark all read
              </button>

              <button
                type="button"
                onClick={handleClearAll}
                disabled={notifications.length === 0}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Trash2 size={16} />
                Clear all
              </button>
            </div>
          </div>
        </section>

        {/* Notification List */}
        {filteredNotifications.length > 0 ? (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => {
              const style = getNotificationStyle(notification.type);
              const NotificationIcon = style.icon;

              return (
                <article
                  key={notification.id}
                  className={`rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
                    notification.read
                      ? "border-gray-100"
                      : "border-emerald-200 bg-emerald-50/30"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${style.color}`}
                    >
                      <NotificationIcon size={23} />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-bold text-gray-900">
                          {notification.title}
                        </h2>

                        {!notification.read && (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                            New
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm leading-6 text-gray-600">
                        {notification.message}
                      </p>

                      <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
                        <Clock size={14} />
                        {formatDate(notification.createdAt)}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-4">
                        <Link
                          to={notification.link || "/my-bookings"}
                          onClick={() => {
                            if (!notification.read) {
                              handleMarkAsRead(notification.id);
                            }
                          }}
                          className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:underline"
                        >
                          View details
                          <ArrowRight size={15} />
                        </Link>

                        {!notification.read && (
                          <button
                            type="button"
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-sm font-semibold text-gray-500 hover:text-emerald-700"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>

                    {!notification.read && (
                      <span
                        className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-600"
                        title="Unread notification"
                      />
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-100 bg-white px-5 py-16 text-center shadow-sm">
            <BellOff className="mx-auto h-14 w-14 text-gray-300" />

            <h2 className="mt-4 text-xl font-bold text-gray-900">
              {activeFilter === "Unread"
                ? "You're all caught up!"
                : "No notifications yet"}
            </h2>

            <p className="mt-2 text-gray-500">
              {activeFilter === "Unread"
                ? "You don't have any unread notifications."
                : "Your booking updates and important messages will appear here."}
            </p>

            {activeFilter === "Unread" && notifications.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveFilter("All")}
                className="mt-5 font-semibold text-emerald-700 hover:underline"
              >
                View all notifications
              </button>
            )}

            {notifications.length === 0 && (
              <Link
                to="/"
                className="mt-6 inline-block rounded-xl bg-emerald-700 px-6 py-3 font-semibold text-white transition hover:bg-emerald-800"
              >
                Explore Hotels
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default GuestNotifications;
