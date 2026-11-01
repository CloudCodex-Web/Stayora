import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";
import { useAuth } from "../context/AuthContext";
import { Bell } from "lucide-react";

import {
  getUserNotifications,
  subscribeToUserNotifications,
} from "../utils/notifications";
function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const { favoriteIds } = useFavorites();
  const { user, accounts = [], logout, switchAccount } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();
  const profileRef = useRef(null);

  const isHome = location.pathname === "/";

  const navLinkClass = (path) =>
    `font-medium transition hover:text-emerald-700 ${
      location.pathname === path ? "text-emerald-700" : "text-gray-600"
    }`;

  function closeMenu() {
    setMenuOpen(false);
    setProfileOpen(false);
  }
  useEffect(() => {
    const email = user?.email?.trim().toLowerCase();

    if (!email) {
      setUnreadNotifications(0);
      return;
    }

    function loadUnreadNotifications() {
      const notifications = getUserNotifications(email);

      setUnreadNotifications(
        notifications.filter((notification) => !notification.read).length,
      );
    }

    loadUnreadNotifications();

    return subscribeToUserNotifications(email, loadUnreadNotifications);
  }, [user?.email]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleLogout() {
    logout();
    closeMenu();
    navigate("/");
  }

  function handleSwitchAccount() {
    closeMenu();
    navigate("/login");
  }

  function handleChooseAccount(email) {
    if (typeof switchAccount !== "function") return;

    switchAccount(email);
    closeMenu();
    navigate("/");
  }

  function ProfileMenu({ mobile = false }) {
    if (!user) return null;

    const otherAccounts = accounts.filter(
      (account) => account.email?.toLowerCase() !== user.email?.toLowerCase(),
    );

    return (
      <div ref={profileRef} className={`relative ${mobile ? "w-full" : ""}`}>
        <button
          type="button"
          onClick={() => setProfileOpen((open) => !open)}
          aria-label="Open profile menu"
          aria-expanded={profileOpen}
          className="flex items-center gap-3 rounded-full transition hover:bg-emerald-50"
        >
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt="Profile"
              className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-emerald-200"
            />
          ) : (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold uppercase text-emerald-800 ring-2 ring-emerald-200">
              {user.name?.trim().charAt(0) || "U"}
            </span>
          )}

          {mobile && (
            <span className="font-semibold text-gray-700">My Account</span>
          )}
        </button>

        {profileOpen && (
          <div
            className={`z-[100] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl ${
              mobile ? "relative mt-3 w-full" : "absolute right-0 top-14 w-80"
            }`}
          >
            {/* Current account details */}
            <div className="border-b border-gray-100 p-4">
              <div className="flex items-center gap-3">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="Profile"
                    className="h-12 w-12 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xl font-bold uppercase text-emerald-800">
                    {user.name?.trim().charAt(0) || "U"}
                  </span>
                )}

                <div className="min-w-0">
                  <p className="truncate font-bold text-gray-900">
                    {user.name || "Stayora User"}
                  </p>
                  <p className="break-all text-sm text-gray-500">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-2">
              {/* My Profile */}
              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  navigate("/profile");
                }}
                className="w-full rounded-xl px-3 py-3 text-left text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                <span className="mr-2">👤</span>
                My Profile
              </button>

              {/* Saved accounts */}
              <div className="mt-2 border-t border-gray-100 pt-2">
                <p className="px-3 py-2 text-xs font-bold uppercase tracking-wide text-gray-400">
                  Switch account
                </p>

                {otherAccounts.length > 0 ? (
                  otherAccounts.map((account) => (
                    <button
                      key={account.email}
                      type="button"
                      onClick={() => handleChooseAccount(account.email)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-emerald-50"
                    >
                      {account.avatarUrl ? (
                        <img
                          src={account.avatarUrl}
                          alt=""
                          className="h-9 w-9 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold uppercase text-emerald-800">
                          {account.name?.trim().charAt(0) || "U"}
                        </span>
                      )}

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-gray-800">
                          {account.name || "Stayora User"}
                        </span>
                        <span className="block break-all text-xs text-gray-500">
                          {account.email}
                        </span>
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-2 text-sm text-gray-500">
                    No other saved accounts yet.
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleSwitchAccount}
                  className="w-full rounded-xl px-3 py-3 text-left text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                >
                  <span className="mr-2">＋</span>
                  Sign in with another account
                </button>
              </div>

              {/* Log out */}
              <button
                type="button"
                onClick={handleLogout}
                className="mt-2 w-full rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <span className="mr-2">↪</span>
                Log Out
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        {/* Logo */}
        <Link to="/" onClick={closeMenu} className="flex items-center gap-2">
          <span className="text-2xl font-extrabold tracking-tight text-emerald-800">
            Stayora<span className="text-amber-500">.</span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-6 md:flex">
          <Link to="/" className={navLinkClass("/")}>
            Home
          </Link>

          <a
            href={isHome ? "#hotels" : "/#hotels"}
            className="font-medium text-gray-600 transition hover:text-emerald-700"
          >
            Explore Hotels
          </a>

          <a
            href={isHome ? "#about" : "/#about"}
            className="font-medium text-gray-600 transition hover:text-emerald-700"
          >
            About Us
          </a>

          <a
            href={isHome ? "#contact" : "/#contact"}
            className="font-medium text-gray-600 transition hover:text-emerald-700"
          >
            Contact
          </a>

          <Link
            to="/wishlist"
            className={`${navLinkClass("/wishlist")} relative inline-flex items-center gap-2`}
          >
            <span className="text-lg">♡</span>
            Wishlist
            {favoriteIds.length > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                {favoriteIds.length}
              </span>
            )}
          </Link>

          <Link to="/my-bookings" className={navLinkClass("/my-bookings")}>
            My Bookings
          </Link>
          {user && (
            <Link
              to="/my-notifications"
              aria-label={`Notifications, ${unreadNotifications} unread`}
              className={`relative inline-flex items-center gap-2 font-medium transition hover:text-emerald-700 ${
                location.pathname === "/my-notifications"
                  ? "text-emerald-700"
                  : "text-gray-600"
              }`}
            >
              <span className="relative">
                <Bell size={21} />

                {unreadNotifications > 0 && (
                  <span className="absolute -right-4 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadNotifications > 99 ? "99+" : unreadNotifications}
                  </span>
                )}
              </span>
            </Link>
          )}
        </div>

        {/* Desktop account section */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <ProfileMenu />
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-gray-700 hover:text-emerald-700"
              >
                Log In
              </Link>

              <Link
                to="/signup"
                className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 md:hidden"
        >
          <span className="text-2xl">{menuOpen ? "✕" : "☰"}</span>
        </button>
      </div>

      {/* Mobile navigation */}
      {menuOpen && (
        <div className="border-t border-gray-100 bg-white px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <Link to="/" onClick={closeMenu} className={navLinkClass("/")}>
              Home
            </Link>

            <a
              href={isHome ? "#hotels" : "/#hotels"}
              onClick={closeMenu}
              className="font-medium text-gray-600"
            >
              Explore Hotels
            </a>

            <a
              href={isHome ? "#about" : "/#about"}
              onClick={closeMenu}
              className="font-medium text-gray-600"
            >
              About Us
            </a>

            <a
              href={isHome ? "#contact" : "/#contact"}
              onClick={closeMenu}
              className="font-medium text-gray-600"
            >
              Contact
            </a>

            <Link
              to="/wishlist"
              onClick={closeMenu}
              className="flex items-center gap-2 font-semibold text-emerald-700"
            >
              <span className="text-xl">♡</span>
              Wishlist
              {favoriteIds.length > 0 && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                  {favoriteIds.length}
                </span>
              )}
            </Link>

            <Link
              to="/my-bookings"
              onClick={closeMenu}
              className="font-semibold text-emerald-700"
            >
              My Bookings
            </Link>
            {user && (
              <Link
                to="/my-notifications"
                onClick={closeMenu}
                className="flex items-center gap-3 font-semibold text-emerald-700"
              >
                <span className="relative">
                  <Bell size={21} />

                  {unreadNotifications > 0 && (
                    <span className="absolute -right-4 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                      {unreadNotifications > 99 ? "99+" : unreadNotifications}
                    </span>
                  )}
                </span>
              </Link>
            )}
            <div className="border-t border-gray-100 pt-4">
              {user ? (
                <ProfileMenu mobile />
              ) : (
                <div className="flex flex-col gap-4">
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="font-semibold text-gray-700"
                  >
                    Log In
                  </Link>

                  <Link
                    to="/signup"
                    onClick={closeMenu}
                    className="font-semibold text-emerald-700"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
