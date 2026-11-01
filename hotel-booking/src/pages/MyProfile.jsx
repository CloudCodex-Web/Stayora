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
} from "lucide-react";

import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

function MyProfile() {
  const { user, accounts, updateProfile, switchAccount, logout } = useAuth();

  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [message, setMessage] = useState("");
  const [imageError, setImageError] = useState(false);
  const [showAccounts, setShowAccounts] = useState(false);

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

  if (!user) return null;

  function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim()) {
      setMessage("Please enter your name.");
      return;
    }

    updateProfile({
      name: name.trim(),
      avatarUrl: avatarUrl.trim(),
    });

    setMessage("Your profile has been updated!");
  }

  function handleSwitchAccount(email) {
    switchAccount(email);
    setShowAccounts(false);
    setMessage("");
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const initial = name.trim().charAt(0).toUpperCase() || "U";

  const showAvatar = avatarUrl.trim() && !imageError;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 font-semibold text-emerald-700 hover:text-emerald-800"
        >
          ← Back to Stayora
        </Link>

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

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Main profile section */}
          <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
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
                    onChange={(event) => setName(event.target.value)}
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
                    value={user.email}
                    readOnly
                    className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-gray-500 outline-none"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  Email cannot be changed in this demo.
                </p>
              </div>

              {/* Avatar URL */}
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
                    }}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-4 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Enter a direct image URL or leave it blank to use your
                  initial.
                </p>
              </div>

              {/* Message */}
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

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white transition hover:bg-emerald-800"
              >
                <Save className="h-5 w-5" />
                Save Changes
              </button>
            </form>
          </section>

          {/* Account sidebar */}
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
                className="mt-4 flex w-full items-center justify-between rounded-xl border border-gray-200 p-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-700" />
                  Choose Account
                </span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {showAccounts && (
                <div className="mt-3 space-y-2">
                  {accounts.map((account) => (
                    <button
                      key={account.email}
                      type="button"
                      disabled={account.email === user.email}
                      onClick={() => handleSwitchAccount(account.email)}
                      className="w-full rounded-xl border border-gray-100 p-3 text-left transition hover:bg-emerald-50 disabled:bg-emerald-50 disabled:text-emerald-800"
                    >
                      <p className="text-sm font-semibold">
                        {account.name}
                        {account.email === user.email ? " (Current)" : ""}
                      </p>
                      <p className="break-all text-xs text-gray-500">
                        {account.email}
                      </p>
                    </button>
                  ))}

                  {accounts.length === 0 && (
                    <p className="text-sm text-gray-500">
                      No saved accounts found.
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
      </main>
    </div>
  );
}

export default MyProfile;
