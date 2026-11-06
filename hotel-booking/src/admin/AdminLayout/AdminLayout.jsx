import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import {
  getAdminProfile,
  subscribeToAdminProfileChanges,
} from "../../utils/admin";
import GlobalSearch from "../components/GlobalSearch";
import {
  getNotifications,
  subscribeToNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../utils/notifications";

import { addActivityLog } from "../../utils/activityLogs";

import {
  LayoutDashboard,
  Hotel,
  CalendarCheck,
  CalendarDays,
  BedDouble,
  Users,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Bell,
  MessageSquare,
  Settings,
  FileSpreadsheet,
  Activity,
  Sparkles,
  ExternalLink,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { name: "Hotels", path: "/admin/hotels", icon: Hotel },
  { name: "Bookings", path: "/admin/bookings", icon: CalendarCheck },
  { name: "Users", path: "/admin/users", icon: Users },
  { name: "Guest Management", path: "/admin/guests", icon: Users },
  { name: "Reviews", path: "/admin/reviews", icon: MessageSquare },
  { name: "Reports", path: "/admin/reports", icon: FileSpreadsheet },
  { name: "Activity Logs", path: "/admin/activity-logs", icon: Activity },
];

const glass = "border border-white/10 bg-white/[0.05] backdrop-blur-2xl";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminProfile, setAdminProfile] = useState(getAdminProfile);
  const [notifications, setNotifications] = useState(getNotifications);
  const [showNotifications, setShowNotifications] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = subscribeToNotifications(() => {
      setNotifications(getNotifications());
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToAdminProfileChanges(() => {
      setAdminProfile(getAdminProfile());
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        setShowNotifications(false);
        setSidebarOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  const adminInitials = (adminProfile?.name || "Stayora Admin")
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function handleLogout() {
    addActivityLog({
      action: "Admin Logged Out",
      category: "Settings",
      description: `${adminProfile.name} logged out of the Stayora admin panel.`,
      target: adminProfile.email,
    });

    localStorage.removeItem("stayora-admin-auth");

    setSidebarOpen(false);
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#11101c] text-slate-100">
      {/* Background atmosphere */}
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[450px] w-[450px] rounded-full bg-purple-600/15 blur-[140px]" />
        <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-teal-500/10 blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 h-[400px] w-[400px] rounded-full bg-indigo-600/10 blur-[140px]" />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/10 bg-[#191727]/95 text-white shadow-2xl shadow-black/40 backdrop-blur-2xl transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <button
            onClick={() => {
              navigate("/admin");
              setSidebarOpen(false);
            }}
            className="text-left"
          >
            <span className="text-2xl font-extrabold tracking-tight text-white">
              Stayora<span className="text-teal-400">.</span>
            </span>

            <p className="mt-1 text-[10px] font-semibold tracking-[0.25em] text-purple-300/70">
              ADMIN WORKSPACE
            </p>
          </button>

          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Admin profile */}
        <div className="mx-4 mt-5 rounded-2xl border border-purple-300/15 bg-gradient-to-br from-purple-500/15 via-white/[0.04] to-teal-400/10 p-3 shadow-lg shadow-purple-950/10">
          <div className="flex items-center gap-3">
            {adminProfile?.avatarUrl ? (
              <img
                src={adminProfile.avatarUrl}
                alt="Admin"
                className="h-10 w-10 rounded-xl border border-purple-300/30 object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-300/20 bg-gradient-to-br from-purple-500/30 to-teal-400/20 font-bold text-purple-100">
                {adminInitials || "SA"}
              </div>
            )}

            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">
                {adminProfile?.name || "Stayora Admin"}
              </p>

              <div className="mt-1 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
                <p className="text-[10px] text-slate-400">Administrator</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="px-4 pt-7">
          <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            Management
          </p>

          <nav className="space-y-2">
            {navigation.map(({ name, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                end={path === "/admin"}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 overflow-hidden rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "border-purple-400/25 bg-gradient-to-r from-purple-500/25 via-purple-500/10 to-teal-400/10 text-white shadow-lg shadow-purple-950/20"
                      : "border-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.05] hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-gradient-to-b from-purple-400 to-teal-300 shadow-[0_0_12px_rgba(168,85,247,0.7)]" />
                    )}

                    <Icon
                      size={19}
                      className={
                        isActive
                          ? "text-purple-300"
                          : "text-slate-500 transition group-hover:text-slate-200"
                      }
                    />

                    <span>{name}</span>

                    <ChevronRight
                      size={15}
                      className={`ml-auto transition ${
                        isActive
                          ? "text-teal-300"
                          : "text-slate-600 group-hover:text-slate-300"
                      }`}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Sidebar bottom */}
        <div className="mt-auto space-y-1 border-t border-white/10 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-red-400/10 hover:text-red-300"
          >
            <LogOut size={19} />
            Logout Admin
          </button>

          <button
            onClick={() => navigate("/")}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-teal-400/10 hover:text-teal-200"
          >
            <ExternalLink size={18} />
            Back to website
          </button>

          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-teal-300" />
              <span className="text-xs font-semibold text-slate-300">
                Stayora Workspace
              </span>
            </div>

            <p className="mt-1 text-[10px] text-slate-500">
              Manage your hotel business
            </p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="relative min-h-screen lg:pl-64">
        {/* Top navbar */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/10 bg-[#171525]/80 px-4 shadow-lg shadow-black/10 backdrop-blur-2xl sm:px-8">
          {/* Left */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl border border-white/10 bg-white/[0.05] p-2.5 text-slate-300 transition hover:bg-white/10 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            <div>
              <h1 className="text-base font-bold text-white sm:text-lg">
                Stayora Admin
              </h1>

              <p className="hidden text-xs text-slate-500 sm:block">
                Hotel management workspace
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 sm:gap-4">
            <GlobalSearch />
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications((prev) => !prev)}
                aria-label="Notifications"
                aria-expanded={showNotifications}
                className="relative rounded-xl border border-white/10 bg-white/[0.05] p-2.5 text-slate-300 transition hover:border-purple-400/30 hover:bg-purple-400/10 hover:text-purple-200"
              >
                <Bell size={19} />

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border border-[#171525] bg-gradient-to-r from-purple-400 to-teal-300 px-1 text-[10px] font-extrabold text-[#171525]">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-14 z-50 w-[340px] max-w-[90vw] overflow-hidden rounded-2xl border border-purple-300/15 bg-[#211d35]/95 shadow-2xl shadow-black/50 backdrop-blur-2xl sm:w-[380px]">
                  <div className="flex items-center justify-between border-b border-white/10 p-4">
                    <div>
                      <h3 className="font-bold text-white">Notifications</h3>

                      <p className="text-xs text-slate-400">
                        {unreadCount} unread notifications
                      </p>
                    </div>

                    {unreadCount > 0 && (
                      <button
                        onClick={() => {
                          markAllNotificationsAsRead();
                          setNotifications(getNotifications());
                        }}
                        className="text-xs font-semibold text-teal-300 transition hover:text-teal-200"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell
                          size={28}
                          className="mx-auto mb-3 text-slate-600"
                        />

                        <p className="font-medium text-slate-200">
                          No notifications yet
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          New alerts will appear here.
                        </p>
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((notification) => (
                        <button
                          key={notification.id}
                          onClick={() => {
                            if (!notification.read) {
                              markNotificationAsRead(notification.id);
                              setNotifications(getNotifications());
                            }

                            setShowNotifications(false);
                            navigate(notification.link || "/admin");
                          }}
                          className={`flex w-full gap-3 border-b border-white/[0.06] p-4 text-left transition hover:bg-white/[0.05] ${
                            !notification.read
                              ? "bg-purple-400/[0.07]"
                              : "bg-transparent"
                          }`}
                        >
                          <span
                            className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                              notification.read
                                ? "bg-slate-600"
                                : "bg-teal-300 shadow-[0_0_8px_rgba(45,212,191,0.6)]"
                            }`}
                          />

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-100">
                              {notification.title}
                            </p>

                            <p className="mt-1 text-xs leading-5 text-slate-400">
                              {notification.message}
                            </p>

                            <p className="mt-2 text-[10px] text-slate-500">
                              {new Date(
                                notification.createdAt,
                              ).toLocaleString()}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      navigate("/admin/notifications");
                    }}
                    className="w-full border-t border-white/10 bg-white/[0.03] p-3 text-center text-sm font-semibold text-teal-300 transition hover:bg-teal-400/10"
                  >
                    View all notifications
                  </button>
                </div>
              )}
            </div>
            {/* Booking Calendar */}
            <button
              onClick={() => {
                setShowNotifications(false);
                navigate("/admin/calendar");
              }}
              aria-label="Booking Calendar"
              title="Booking Calendar"
              className="rounded-xl border border-white/10 bg-white/[0.05] p-2.5 text-slate-300 transition hover:border-teal-400/30 hover:bg-teal-400/10 hover:text-teal-200"
            >
              <CalendarDays size={19} />
            </button>
            {/* Room Management */}
            <button
              onClick={() => {
                setShowNotifications(false);
                navigate("/admin/rooms");
              }}
              aria-label="Room Management"
              title="Room Management"
              className="rounded-xl border border-white/10 bg-white/[0.05] p-2.5 text-slate-300 transition hover:border-purple-400/30 hover:bg-purple-400/10 hover:text-purple-200"
            >
              <BedDouble size={19} />
            </button>
            {/* Settings */}
            <button
              onClick={() => navigate("/admin/settings")}
              aria-label="Admin Settings"
              title="Settings"
              className="rounded-xl border border-white/10 bg-white/[0.05] p-2.5 text-slate-300 transition hover:border-purple-400/30 hover:bg-purple-400/10 hover:text-purple-200"
            >
              <Settings size={19} />
            </button>

            {/* Admin profile */}
            <button
              onClick={() => navigate("/admin/profile")}
              title="View Admin Profile"
              className="flex items-center gap-2 border-l border-white/10 pl-3 text-left sm:gap-3 sm:pl-4"
            >
              {adminProfile?.avatarUrl ? (
                <img
                  src={adminProfile.avatarUrl}
                  alt="Admin"
                  className="h-10 w-10 rounded-full border-2 border-purple-300/30 object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-purple-300/20 bg-gradient-to-br from-purple-500/30 to-teal-400/20 font-bold text-purple-100">
                  {adminInitials || "SA"}
                </div>
              )}

              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-white">
                  {adminProfile?.name}
                </p>

                <p className="text-xs text-slate-500">{adminProfile?.role}</p>
              </div>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="relative min-h-[calc(100vh-80px)] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
