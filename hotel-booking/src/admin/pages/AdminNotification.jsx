import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  BellRing,
  CheckCheck,
  Search,
  CalendarDays,
  Users,
  Star,
  Settings,
  Info,
  Trash2,
  Clock,
  Inbox,
  CheckCircle2,
  X,
  Filter,
  Sparkles,
} from "lucide-react";

import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotifications,
  subscribeToNotifications,
} from "../../utils/notifications";

const getCategory = (notification) => {
  const text =
    `${notification.title || ""} ${notification.message || ""}`.toLowerCase();

  if (
    text.includes("booking") ||
    text.includes("reservation") ||
    text.includes("check-in") ||
    text.includes("check-out") ||
    text.includes("cancel")
  )
    return "Bookings";

  if (
    text.includes("user") ||
    text.includes("guest") ||
    text.includes("register") ||
    text.includes("account")
  )
    return "Users";

  if (
    text.includes("review") ||
    text.includes("rating") ||
    text.includes("feedback")
  )
    return "Reviews";

  return "System";
};

const categoryConfig = {
  Bookings: {
    icon: CalendarDays,
    color: "text-purple-300",
    bg: "bg-purple-500/10",
    border: "border-purple-400/20",
  },
  Users: {
    icon: Users,
    color: "text-cyan-300",
    bg: "bg-cyan-500/10",
    border: "border-cyan-400/20",
  },
  Reviews: {
    icon: Star,
    color: "text-amber-300",
    bg: "bg-amber-500/10",
    border: "border-amber-400/20",
  },
  System: {
    icon: Settings,
    color: "text-slate-300",
    bg: "bg-slate-500/10",
    border: "border-slate-400/20",
  },
};

const filters = ["All", "Bookings", "Users", "Reviews", "System"];

function AdminNotifications() {
  const [notifications, setNotifications] = useState(getNotifications);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [readFilter, setReadFilter] = useState("All");

  useEffect(() => {
    return subscribeToNotifications(() => {
      setNotifications(getNotifications());
    });
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  const readCount = notifications.length - unreadCount;

  const categoryCounts = useMemo(() => {
    return {
      Bookings: notifications.filter((item) => getCategory(item) === "Bookings")
        .length,
      Users: notifications.filter((item) => getCategory(item) === "Users")
        .length,
      Reviews: notifications.filter((item) => getCategory(item) === "Reviews")
        .length,
      System: notifications.filter((item) => getCategory(item) === "System")
        .length,
    };
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const category = getCategory(notification);

      const matchesCategory =
        activeFilter === "All" || category === activeFilter;

      const matchesRead =
        readFilter === "All" ||
        (readFilter === "Unread" && !notification.read) ||
        (readFilter === "Read" && notification.read);

      const searchText = search.toLowerCase();

      const matchesSearch =
        (notification.title || "").toLowerCase().includes(searchText) ||
        (notification.message || "").toLowerCase().includes(searchText);

      return matchesCategory && matchesRead && matchesSearch;
    });
  }, [notifications, activeFilter, readFilter, search]);

  const handleMarkAllRead = () => {
    if (unreadCount > 0) {
      markAllNotificationsAsRead();
    }
  };

  const handleClearAll = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all notifications? This action cannot be undone.",
      )
    ) {
      clearNotifications();
    }
  };

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const stats = [
    {
      label: "Total Notifications",
      value: notifications.length,
      icon: Bell,
      color: "text-purple-300",
      bg: "bg-purple-500/10",
    },
    {
      label: "Unread",
      value: unreadCount,
      icon: BellRing,
      color: "text-cyan-300",
      bg: "bg-cyan-500/10",
    },
    {
      label: "Read",
      value: readCount,
      icon: CheckCircle2,
      color: "text-emerald-300",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Booking Alerts",
      value: categoryCounts.Bookings,
      icon: CalendarDays,
      color: "text-amber-300",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="min-h-screen space-y-7 text-white">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-purple-300">
            <Sparkles size={16} />
            <span className="text-xs font-semibold uppercase tracking-[0.2em]">
              Stayora Control Center
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            Notification Center
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Stay updated with bookings, users, reviews and system activity.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-purple-400/30 hover:bg-purple-500/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CheckCheck size={17} />
            Mark all read
          </button>

          <button
            onClick={handleClearAll}
            disabled={notifications.length === 0}
            className="flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 size={17} />
            Clear all
          </button>
        </div>
      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/[0.07] bg-[#191727] p-5 shadow-xl shadow-black/10 transition hover:-translate-y-1 hover:border-purple-400/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <h2 className="mt-3 text-3xl font-bold">{stat.value}</h2>
                </div>

                <div className={`rounded-2xl p-3 ${stat.bg} ${stat.color}`}>
                  <Icon size={23} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CATEGORY OVERVIEW */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#191727] p-5">
        <div className="mb-5 flex items-center gap-2">
          <Filter size={18} className="text-purple-300" />
          <h2 className="font-semibold">Notification Categories</h2>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {filters.slice(1).map((category) => {
            const config = categoryConfig[category];
            const Icon = config.icon;

            return (
              <button
                key={category}
                onClick={() => setActiveFilter(category)}
                className={`flex items-center justify-between rounded-xl border p-4 text-left transition ${
                  activeFilter === category
                    ? "border-purple-400/40 bg-purple-500/10"
                    : "border-white/[0.06] bg-white/[0.02] hover:border-white/15"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-xl p-2 ${config.bg} ${config.color}`}
                  >
                    <Icon size={19} />
                  </div>

                  <span className="text-sm font-medium text-slate-200">
                    {category}
                  </span>
                </div>

                <span className="text-sm font-semibold text-slate-400">
                  {categoryCounts[category]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* NOTIFICATION LIST */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#191727]">
        {/* TOOLBAR */}
        <div className="flex flex-col justify-between gap-4 border-b border-white/[0.07] p-5 xl:flex-row xl:items-center">
          <div>
            <h2 className="text-lg font-semibold">All Notifications</h2>
            <p className="mt-1 text-xs text-slate-500">
              {filteredNotifications.length} notifications displayed
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notifications..."
                className="w-full rounded-xl border border-white/10 bg-[#11101c] py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-purple-400/50 sm:w-64"
              />
            </div>

            <select
              value={readFilter}
              onChange={(e) => setReadFilter(e.target.value)}
              className="rounded-xl border border-white/10 bg-[#11101c] px-4 py-3 text-sm text-slate-300 outline-none focus:border-purple-400/50"
            >
              <option value="All">All status</option>
              <option value="Unread">Unread only</option>
              <option value="Read">Read only</option>
            </select>
          </div>
        </div>

        {/* CATEGORY TABS */}
        <div className="flex gap-2 overflow-x-auto border-b border-white/[0.07] px-5 py-4">
          {filters.map((filter) => {
            const count =
              filter === "All" ? notifications.length : categoryCounts[filter];

            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition ${
                  activeFilter === filter
                    ? "bg-purple-500/20 text-purple-200 ring-1 ring-purple-400/30"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {filter}
                <span className="ml-2 text-xs opacity-60">{count}</span>
              </button>
            );
          })}
        </div>

        {/* LIST */}
        <div className="divide-y divide-white/[0.05]">
          {filteredNotifications.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-500">
                <Inbox size={30} />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-slate-200">
                {notifications.length === 0
                  ? "No notifications yet"
                  : "No matching notifications"}
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                {notifications.length === 0
                  ? "New booking, registration and review alerts will appear here."
                  : "Try changing your search or filters to find notifications."}
              </p>

              {(search || activeFilter !== "All" || readFilter !== "All") && (
                <button
                  onClick={() => {
                    setSearch("");
                    setActiveFilter("All");
                    setReadFilter("All");
                  }}
                  className="mt-5 rounded-xl bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-300 transition hover:bg-purple-500/20"
                >
                  Reset filters
                </button>
              )}
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const category = getCategory(notification);
              const config = categoryConfig[category];
              const Icon = config.icon;

              return (
                <div
                  key={notification.id}
                  className={`group flex flex-col gap-4 p-5 transition hover:bg-white/[0.025] sm:flex-row sm:items-start ${
                    !notification.read ? "bg-purple-500/[0.035]" : ""
                  }`}
                >
                  {/* ICON */}
                  <div className="relative shrink-0">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${config.bg} ${config.border} ${config.color}`}
                    >
                      <Icon size={21} />
                    </div>

                    {!notification.read && (
                      <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#191727] bg-purple-400" />
                    )}
                  </div>

                  {/* CONTENT */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-100">
                        {notification.title || "Notification"}
                      </h3>

                      {!notification.read && (
                        <span className="rounded-full border border-purple-400/20 bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-purple-300">
                          New
                        </span>
                      )}

                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${config.bg} ${config.border} ${config.color}`}
                      >
                        {category}
                      </span>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {notification.message ||
                        "No additional details available."}
                    </p>

                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                      <Clock size={13} />
                      {formatDate(notification.createdAt)}
                    </div>
                  </div>

                  {/* ACTION */}
                  <div className="flex shrink-0 items-center gap-2 sm:self-center">
                    {notification.read ? (
                      <span className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300">
                        <CheckCircle2 size={14} />
                        Read
                      </span>
                    ) : (
                      <button
                        onClick={() => markNotificationAsRead(notification.id)}
                        className="flex items-center gap-2 rounded-xl border border-purple-400/20 bg-purple-500/10 px-3 py-2 text-xs font-medium text-purple-300 transition hover:bg-purple-500/20"
                      >
                        <CheckCheck size={15} />
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* FOOTER */}
        {notifications.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] bg-white/[0.015] px-5 py-4">
            <p className="text-xs text-slate-500">
              Showing {filteredNotifications.length} of {notifications.length}{" "}
              notifications
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Info size={14} />
              Notifications are stored locally in this demo.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminNotifications;
