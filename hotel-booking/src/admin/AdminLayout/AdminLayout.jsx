import { useEffect, useState } from "react";
import {
  getAdminProfile,
  subscribeToAdminProfileChanges,
} from "../../utils/admin";
import {
  getNotifications,
  subscribeToNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../utils/notifications";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { addActivityLog } from "../../utils/activityLogs";
import {
  LayoutDashboard,
  Hotel,
  CalendarCheck,
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
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    path: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Hotels",
    path: "/admin/hotels",
    icon: Hotel,
  },
  {
    name: "Bookings",
    path: "/admin/bookings",
    icon: CalendarCheck,
  },
  {
    name: "Users",
    path: "/admin/users",
    icon: Users,
  },
  {
    name: "Guest Management",
    path: "/admin/guests",
    icon: Users,
  },
  {
    name: "Reviews",
    path: "/admin/reviews",
    icon: MessageSquare,
  },
  {
    name: "Reports",
    path: "/admin/reports",
    icon: FileSpreadsheet,
  },
  {
    name: "Activity Logs",
    path: "/admin/activity-logs",
    icon: Activity,
  },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [adminProfile, setAdminProfile] = useState(getAdminProfile);
  const [notifications, setNotifications] = useState(getNotifications);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToNotifications(() => {
      setNotifications(getNotifications());
    });

    return unsubscribe;
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  useEffect(() => {
    const unsubscribe = subscribeToAdminProfileChanges(() => {
      setAdminProfile(getAdminProfile());
    });

    return unsubscribe;
  }, []);

  const adminInitials = adminProfile.name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  // Log out the admin
  const handleLogout = () => {
    addActivityLog({
      action: "Admin Logged Out",
      category: "Settings",
      description: `${adminProfile.name} logged out of the Stayora admin panel.`,
      target: adminProfile.email,
    });

    localStorage.removeItem("stayora-admin-auth");

    setSidebarOpen(false);

    navigate("/admin/login", { replace: true });
  };  

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-950 text-white transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <button
            onClick={() => navigate("/admin")}
            className="text-left text-2xl font-bold tracking-tight"
          >
            Stayora<span className="text-teal-400">.</span>
            <p className="mt-1 text-xs font-normal tracking-widest text-slate-400">
              ADMIN PANEL
            </p>
          </button>

          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 hover:bg-white/10 lg:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <div className="px-4 pt-7">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
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
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-teal-500 text-white shadow-lg shadow-teal-950/30"
                      : "text-slate-400 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon size={19} />
                <span>{name}</span>
                <ChevronRight className="ml-auto" size={16} />
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Logout */}
        <div className="mt-auto border-t border-white/10 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={19} />
            Logout Admin
          </button>

          <button
            onClick={() => navigate("/")}
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <Hotel size={19} />
            Back to website
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="min-h-screen lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={23} />
            </button>

            <div>
              <h1 className="text-lg font-bold text-slate-900">
                Stayora Admin
              </h1>
              <p className="hidden text-xs text-slate-500 sm:block">
                Hotel management workspace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setShowNotifications((prev) => !prev)}
                aria-label="Notifications"
                aria-expanded={showNotifications}
                className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50"
              >
                <Bell size={19} />

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-14 z-50 w-[340px] max-w-[90vw] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl sm:w-[380px]">
                  {/* Dropdown header */}
                  <div className="flex items-center justify-between border-b border-slate-100 p-4">
                    <div>
                      <h3 className="font-bold text-slate-900">
                        Notifications
                      </h3>
                      <p className="text-xs text-slate-500">
                        {unreadCount} unread notifications
                      </p>
                    </div>

                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-xs font-semibold text-teal-600 hover:text-teal-700"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {/* Notification list */}
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell
                          size={28}
                          className="mx-auto mb-3 text-slate-300"
                        />
                        <p className="font-medium text-slate-700">
                          No notifications yet
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
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
                            }

                            setShowNotifications(false);
                            navigate(notification.link || "/admin");
                          }}
                          className={`flex w-full gap-3 border-b border-slate-100 p-4 text-left transition hover:bg-slate-50 ${
                            !notification.read ? "bg-teal-50/50" : ""
                          }`}
                        >
                          <span
                            className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                              notification.read ? "bg-slate-300" : "bg-teal-500"
                            }`}
                          />

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-800">
                              {notification.title}
                            </p>

                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              {notification.message}
                            </p>

                            <p className="mt-2 text-[10px] text-slate-400">
                              {new Date(
                                notification.createdAt,
                              ).toLocaleString()}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>

                  {/* View all */}
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      navigate("/admin/notifications");
                    }}
                    className="w-full bg-slate-50 p-3 text-center text-sm font-semibold text-teal-600 transition hover:bg-teal-50"
                  >
                    View all notifications
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => navigate("/admin/settings")}
              aria-label="Admin Settings"
              title="Settings"
              className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-teal-50 hover:text-teal-700"
            >
              <Settings size={19} />
            </button>

            <button
              onClick={() => navigate("/admin/profile")}
              title="View Admin Profile"
              className="flex items-center gap-3 border-l border-slate-200 pl-4 text-left transition hover:opacity-75"
            >
              {adminProfile.avatarUrl ? (
                <img
                  src={adminProfile.avatarUrl}
                  alt="Admin"
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 font-bold text-teal-700">
                  {adminInitials || "SA"}
                </div>
              )}

              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">
                  {adminProfile.name}
                </p>
                <p className="text-xs text-slate-500">{adminProfile.role}</p>
              </div>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
