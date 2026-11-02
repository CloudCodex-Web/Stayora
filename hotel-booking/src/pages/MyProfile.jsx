import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  User,
  Mail,
  Camera,
  Save,
  LogOut,
  Users,
  CalendarDays,
  BookOpen,
  ChevronDown,
  Heart,
  Bell,
  CheckCircle2,
  Clock,
  ClipboardList,
} from "lucide-react";

import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";

import { getBookings, subscribeToBookingChanges } from "../utils/bookings";

function normalizeStatus(status) {
  const value = String(status || "Pending").toLowerCase();

  return value === "confirmed" ? "accepted" : value;
}

function MyProfile() {
  const {
    user,
    accounts = [],
    updateProfile,
    switchAccount,
    logout,
  } = useAuth();

  const { favoriteIds = [] } = useFavorites();

  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [message, setMessage] = useState("");
  const [imageError, setImageError] = useState(false);
  const [showAccounts, setShowAccounts] = useState(false);

  const [bookings, setBookings] = useState([]);

  // Redirect guests who are not logged in.
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    setName(user.name || "");
    setAvatarUrl(user.avatarUrl || "");
    setMessage("");
    setImageError(false);
  }, [user, navigate]);

  // Load bookings belonging to the current account only.
  useEffect(() => {
    const email = user?.email?.trim().toLowerCase();

    if (!email) {
      setBookings([]);
      return;
    }

    function refreshBookings() {
      const allBookings = getBookings();

      const userBookings = allBookings.filter(
        (booking) => booking.userEmail?.trim().toLowerCase() === email,
      );

      setBookings(userBookings);
    }

    refreshBookings();

    return subscribeToBookingChanges(refreshBookings);
  }, [user?.email]);

  if (!user) return null;

  // Booking statistics.
  const totalBookings = bookings.length;

  const acceptedBookings = bookings.filter(
    (booking) => normalizeStatus(booking.status) === "accepted",
  ).length;

  const pendingBookings = bookings.filter(
    (booking) => normalizeStatus(booking.status) === "pending",
  ).length;

  const initial = name.trim().charAt(0).toUpperCase() || "U";

  const showAvatar = avatarUrl.trim() && !imageError;

  const otherAccounts = accounts.filter(
    (account) =>
      account.email?.trim().toLowerCase() !== user.email?.trim().toLowerCase(),
  );

  function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim()) {
      setMessage("Please enter your name.");
      return;
    }

    try {
      updateProfile({
        name: name.trim(),
        avatarUrl: avatarUrl.trim(),
      });

      setMessage("Your profile has been updated!");
    } catch (error) {
      console.error("Profile update failed:", error);
      setMessage("Could not update your profile. Please try again.");
    }
  }

  function handleSwitchAccount(email) {
    if (typeof switchAccount !== "function") return;

    switchAccount(email);
    setShowAccounts(false);
    setMessage("");
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const statistics = [
    {
      label: "Total Bookings",
      value: totalBookings,
      icon: ClipboardList,
      color: "bg-blue-50 text-blue-700",
    },
    {
      label: "Accepted",
      value: acceptedBookings,
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Pending",
      value: pendingBookings,
      icon: Clock,
      color: "bg-amber-50 text-amber-700",
    },
    {
      label: "Wishlist",
      value: favoriteIds.length,
      icon: Heart,
      color: "bg-red-50 text-red-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 font-semibold text-emerald-700 hover:text-emerald-800"
        >
          ← Back to Stayora
        </Link>

        {/* Page heading */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">
            Your account
          </p>

          <h1 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            My Profile
          </h1>

          <p className="mt-2 text-gray-500">
            Manage your personal information and account settings.
          </p>
        </div>

        {/* Account overview */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-bold text-gray-900">
            Account Overview
          </h2>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {statistics.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                >
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.color}`}
                  >
                    <Icon size={22} />
                  </div>

                  <p className="mt-4 text-sm text-gray-500">{item.label}</p>

                  <p className="mt-1 text-3xl font-extrabold text-gray-900">
                    {item.value}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Main profile section */}
          <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
            {/* Profile banner */}
            <div className="bg-emerald-800 px-6 py-8 text-white sm:px-10">
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                {showAvatar ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    onError={() => setImageError(true)}
                    className="h-24 w-24 rounded-full border-4 border-white/30 object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/30 bg-emerald-100 text-4xl font-bold text-emerald-800">
                    {initial}
                  </div>
                )}

                <div className="text-center sm:text-left">
                  <h2 className="text-2xl font-bold">
                    {user.name || "Stayora User"}
                  </h2>

                  <p className="mt-1 break-all text-sm text-emerald-100">
                    {user.email}
                  </p>

                  <span className="mt-3 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                    Guest Account
                  </span>
                </div>
              </div>
            </div>

            {/* Edit profile form */}
            <form onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-10">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Personal Information
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Update the information associated with your account.
                </p>
              </div>

              {/* Name */}
              <div>
                <label
                  htmlFor="profile-name"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Full Name
                </label>

                <div className="relative">
                  <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                  <input
                    id="profile-name"
                    type="text"
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      setMessage("");
                    }}
                    placeholder="Enter your full name"
                    required
                    className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-4 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="profile-email"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                  <input
                    id="profile-email"
                    type="email"
                    value={user.email || ""}
                    readOnly
                    className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-gray-500 outline-none"
                  />
                </div>

                <p className="mt-2 text-xs text-gray-400">
                  Email cannot be changed in this demo.
                </p>
              </div>

              {/* Profile image URL */}
              <div>
                <label
                  htmlFor="profile-avatar"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Profile Picture URL
                </label>

                <div className="relative">
                  <Camera className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                  <input
                    id="profile-avatar"
                    type="url"
                    value={avatarUrl}
                    onChange={(event) => {
                      setAvatarUrl(event.target.value);
                      setImageError(false);
                      setMessage("");
                    }}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-4 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Enter a direct image URL or leave it blank to use your
                  initial.
                </p>

                {avatarUrl.trim() && imageError && (
                  <p className="mt-2 text-xs text-red-600">
                    This image could not be loaded. Please check the URL.
                  </p>
                )}

                {showAvatar && (
                  <div className="mt-4 flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <img
                      src={avatarUrl}
                      alt="Profile preview"
                      className="h-14 w-14 rounded-full object-cover"
                    />

                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        Profile picture preview
                      </p>
                      <p className="text-xs text-gray-500">
                        This picture will appear on your account.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Form feedback */}
              {message && (
                <div
                  role="status"
                  className={`rounded-xl p-3 text-sm font-medium ${
                    message.includes("updated")
                      ? "bg-emerald-50 text-emerald-800"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {message}
                </div>
              )}

              {/* Save */}
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white transition hover:bg-emerald-800"
              >
                <Save size={20} />
                Save Changes
              </button>
            </form>
          </section>

          {/* Sidebar */}
          <aside className="space-y-5">
            {/* Account information */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="font-bold text-gray-900">Account Information</h3>

              <div className="mt-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-50 p-3">
                    <User className="h-5 w-5 text-emerald-700" />
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">Account Name</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {user.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-50 p-3">
                    <Mail className="h-5 w-5 text-emerald-700" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">Email Address</p>
                    <p className="break-all text-sm font-semibold text-gray-800">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick links */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="font-bold text-gray-900">Quick Links</h3>

              <div className="mt-4 space-y-2">
                <Link
                  to="/my-bookings"
                  className="flex items-center gap-3 rounded-xl p-3 text-sm font-semibold text-gray-700 transition hover:bg-emerald-50 hover:text-emerald-800"
                >
                  <BookOpen className="h-5 w-5" />
                  My Bookings
                </Link>

                <Link
                  to="/my-notifications"
                  className="flex items-center gap-3 rounded-xl p-3 text-sm font-semibold text-gray-700 transition hover:bg-emerald-50 hover:text-emerald-800"
                >
                  <Bell className="h-5 w-5" />
                  Notifications
                </Link>

                <Link
                  to="/wishlist"
                  className="flex items-center gap-3 rounded-xl p-3 text-sm font-semibold text-gray-700 transition hover:bg-emerald-50 hover:text-emerald-800"
                >
                  <Heart className="h-5 w-5" />
                  My Wishlist
                </Link>

                <Link
                  to="/"
                  className="flex items-center gap-3 rounded-xl p-3 text-sm font-semibold text-gray-700 transition hover:bg-emerald-50 hover:text-emerald-800"
                >
                  <CalendarDays className="h-5 w-5" />
                  Explore Hotels
                </Link>
              </div>
            </div>

            {/* Switch account */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="font-bold text-gray-900">Switch Account</h3>

              <p className="mt-1 text-xs text-gray-500">
                Switch between your saved demo accounts.
              </p>

              <button
                type="button"
                onClick={() => setShowAccounts(!showAccounts)}
                aria-expanded={showAccounts}
                className="mt-4 flex w-full items-center justify-between rounded-xl border border-gray-200 p-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-700" />
                  Choose Account
                </span>

                <ChevronDown
                  className={`h-4 w-4 transition ${
                    showAccounts ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showAccounts && (
                <div className="mt-3 space-y-2">
                  {otherAccounts.map((account) => (
                    <button
                      key={account.email}
                      type="button"
                      onClick={() => handleSwitchAccount(account.email)}
                      className="w-full rounded-xl border border-gray-100 p-3 text-left transition hover:bg-emerald-50"
                    >
                      <p className="text-sm font-semibold text-gray-800">
                        {account.name || "Stayora User"}
                      </p>

                      <p className="break-all text-xs text-gray-500">
                        {account.email}
                      </p>
                    </button>
                  ))}

                  <Link
                    to="/login"
                    className="block w-full rounded-xl px-3 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                  >
                    + Sign in with another account
                  </Link>

                  {otherAccounts.length === 0 && (
                    <p className="text-xs text-gray-500">
                      No other saved accounts are available.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Logout */}
            <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
              <h3 className="font-bold text-gray-900">Sign Out</h3>

              <p className="mt-1 text-xs text-gray-500">
                Sign out of your current Stayora account.
              </p>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          </aside>
        </div>

        {/* Account footer */}
        <p className="mt-8 text-center text-xs text-gray-400">
          Your Stayora account information is managed through this demo
          application.
        </p>
      </main>
    </div>
  );
}

export default MyProfile;
