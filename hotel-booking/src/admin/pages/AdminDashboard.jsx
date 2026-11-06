
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  Hotel,
  CalendarCheck,
  Wallet,
  ArrowUpRight,
  Clock3,
  Star,
  CheckCircle2,
  XCircle,
  X,
  Eye,
  Users,
  UserRound,
  Plus,
  FileBarChart,
} from "lucide-react";

import hotels from "../../data/hotels";
import {
  getStoredHotels,
  subscribeToHotelChanges,
} from "../../data/hotelStorage";

import {
  getUsers,
  subscribeToUserChanges,
} from "../../utils/users";

import {
  getBookings,
  subscribeToBookingChanges,
  updateBookingStatus,
} from "../../utils/bookings";

const money = (amount) =>
  `NPR ${Number(amount || 0).toLocaleString("en-NP")}`;

const statusStyles = {
  Pending: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  Accepted: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  Confirmed: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  Rejected: "border-red-400/20 bg-red-400/10 text-red-300",
  Cancelled: "border-slate-400/20 bg-slate-400/10 text-slate-300",
};

const glassCard =
  "rounded-2xl border border-white/10 bg-white/[0.06] shadow-xl shadow-black/10 backdrop-blur-xl";

function formatDate(date) {
  if (!date) return "—";

  const parsed = new Date(
    String(date).length === 10 ? `${date}T00:00:00` : date
  );

  return Number.isNaN(parsed.getTime())
    ? "—"
    : parsed.toLocaleDateString("en-NP", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

function getGuestName(booking, users) {
  const email = (
    booking.userEmail ||
    booking.email ||
    ""
  ).trim().toLowerCase();

  const matchedUser = users.find(
    (user) => user.email?.trim().toLowerCase() === email
  );

  return (
    booking.guestName ||
    matchedUser?.name ||
    booking.name ||
    booking.fullName ||
    "Guest"
  );
}

function getHotelName(booking) {
  return (
    booking.hotelName ||
    booking.hotel?.name ||
    (typeof booking.hotel === "string" ? booking.hotel : "") ||
    "Hotel"
  );
}

export default function AdminDashboard() {
  const [allHotels, setAllHotels] = useState(() =>
    getStoredHotels(hotels)
  );

  const [users, setUsers] = useState(() => getUsers());
  const [bookings, setBookings] = useState(() => getBookings());

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [bookingFilter, setBookingFilter] = useState("All");
  const [updatingBooking, setUpdatingBooking] = useState(false);

  // Keep hotel data updated
  useEffect(() => {
    const refreshHotels = () => {
      setAllHotels(getStoredHotels(hotels));
    };

    refreshHotels();

    return subscribeToHotelChanges(refreshHotels);
  }, []);

  // Keep users updated
  useEffect(() => {
    const refreshUsers = () => {
      setUsers(getUsers());
    };

    refreshUsers();

    return subscribeToUserChanges(refreshUsers);
  }, []);

  // Keep bookings updated
  useEffect(() => {
    const refreshBookings = () => {
      const latestBookings = getBookings();

      setBookings(latestBookings);

      setSelectedBooking((current) => {
        if (!current) return null;

        return (
          latestBookings.find(
            (booking) =>
              booking.bookingId === current.bookingId
          ) || current
        );
      });
    };

    refreshBookings();

    return subscribeToBookingChanges(refreshBookings);
  }, []);

  // Close modal using Escape key
  useEffect(() => {
    if (!selectedBooking) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedBooking(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedBooking]);

  // Accept or reject booking
  async function handleBookingStatus(status) {
    if (!selectedBooking?.bookingId || updatingBooking) return;

    setUpdatingBooking(true);
    setStatusMessage("");

    try {
      await updateBookingStatus(
        selectedBooking.bookingId,
        status
      );

      const updatedBooking = {
        ...selectedBooking,
        status,
        updatedAt: new Date().toISOString(),
      };

      setSelectedBooking(updatedBooking);
      setBookings(getBookings());

      setStatusMessage(
        `Booking ${status.toLowerCase()} successfully.`
      );
    } catch (error) {
      console.error("Failed to update booking:", error);

      setStatusMessage(
        "Could not update the booking. Please try again."
      );
    } finally {
      setUpdatingBooking(false);
    }
  }

  // Hotel calculations
  const activeHotels = allHotels.filter(
    (hotel) => hotel.status?.toLowerCase() !== "inactive"
  );

  const inactiveHotels = allHotels.length - activeHotels.length;

  const ratedHotels = allHotels.filter(
    (hotel) => Number(hotel.rating) > 0
  );

  const averageRating = ratedHotels.length
    ? (
        ratedHotels.reduce(
          (total, hotel) => total + Number(hotel.rating),
          0
        ) / ratedHotels.length
      ).toFixed(1)
    : "—";

  // Booking calculations
  const pendingBookings = bookings.filter(
    (booking) => (booking.status || "Pending") === "Pending"
  );

  const acceptedBookings = bookings.filter(
    (booking) =>
      booking.status === "Accepted" ||
      booking.status === "Confirmed"
  );

  const rejectedBookings = bookings.filter(
    (booking) => booking.status === "Rejected"
  );

  const cancelledBookings = bookings.filter(
    (booking) => booking.status === "Cancelled"
  );

  const demoRevenue = acceptedBookings.reduce(
    (total, booking) =>
      total + Number(booking.total || 0),
    0
  );

  // Guest insights
  const guestsWithBookings = new Set(
    bookings
      .map((booking) =>
        (
          booking.userEmail ||
          booking.email ||
          ""
        )
          .trim()
          .toLowerCase()
      )
      .filter(Boolean)
  ).size;

  // Monthly analytics
  const monthlyAnalytics = Array.from(
    { length: 6 },
    (_, index) => {
      const date = new Date();

      date.setDate(1);
      date.setMonth(date.getMonth() - (5 - index));

      const year = date.getFullYear();
      const month = date.getMonth();

      const monthBookings = bookings.filter((booking) => {
        const createdAt = new Date(booking.createdAt);

        return (
          !Number.isNaN(createdAt.getTime()) &&
          createdAt.getFullYear() === year &&
          createdAt.getMonth() === month
        );
      });

      const monthAccepted = monthBookings.filter(
        (booking) =>
          booking.status === "Accepted" ||
          booking.status === "Confirmed"
      );

      return {
        label: date.toLocaleDateString("en", {
          month: "short",
        }),
        bookings: monthBookings.length,
        revenue: monthAccepted.reduce(
          (total, booking) =>
            total + Number(booking.total || 0),
          0
        ),
      };
    }
  );

  const maxMonthlyBookings = Math.max(
    1,
    ...monthlyAnalytics.map((item) => item.bookings)
  );

  const maxMonthlyRevenue = Math.max(
    1,
    ...monthlyAnalytics.map((item) => item.revenue)
  );

  // Booking status breakdown
  const bookingStatuses = [
    {
      label: "Pending",
      count: pendingBookings.length,
      color: "bg-amber-400",
    },
    {
      label: "Accepted",
      count: acceptedBookings.length,
      color: "bg-emerald-400",
    },
    {
      label: "Rejected",
      count: rejectedBookings.length,
      color: "bg-red-400",
    },
    {
      label: "Cancelled",
      count: cancelledBookings.length,
      color: "bg-slate-400",
    },
  ];

  const totalStatusBookings = Math.max(1, bookings.length);

  // Top performing hotels
  const topHotels = Object.values(
    acceptedBookings.reduce((result, booking) => {
      const name = getHotelName(booking);

      if (!result[name]) {
        result[name] = {
          name,
          bookings: 0,
          revenue: 0,
        };
      }

      result[name].bookings += 1;
      result[name].revenue += Number(booking.total || 0);

      return result;
    }, {})
  )
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Dashboard statistics
  const stats = [
    {
      title: "Total Hotels",
      value: allHotels.length.toLocaleString("en-NP"),
      detail: `${activeHotels.length} active · ${inactiveHotels} inactive`,
      icon: Hotel,
      accent: "from-blue-500/20 to-cyan-400/10",
      iconColor: "text-cyan-300",
    },
    {
      title: "Total Bookings",
      value: bookings.length.toLocaleString("en-NP"),
      detail: `${acceptedBookings.length} accepted`,
      icon: CalendarCheck,
      accent: "from-teal-500/20 to-emerald-400/10",
      iconColor: "text-teal-300",
    },
    {
      title: "Pending Requests",
      value: pendingBookings.length.toLocaleString("en-NP"),
      detail: `${rejectedBookings.length} rejected`,
      icon: Clock3,
      accent: "from-amber-500/20 to-orange-400/10",
      iconColor: "text-amber-300",
    },
    {
      title: "Estimated Revenue",
      value: money(demoRevenue),
      detail: "From accepted bookings only",
      icon: Wallet,
      accent: "from-purple-500/20 to-pink-400/10",
      iconColor: "text-purple-300",
    },
    {
      title: "Registered Users",
      value: users.length.toLocaleString("en-NP"),
      detail: "Accounts registered on Stayora",
      icon: Users,
      accent: "from-indigo-500/20 to-purple-400/10",
      iconColor: "text-indigo-300",
    },
  ];

  // Sort bookings newest first
  const allSortedBookings = [...bookings].sort(
    (a, b) =>
      new Date(b.createdAt || 0).getTime() -
      new Date(a.createdAt || 0).getTime()
  );

  const filteredBookings = allSortedBookings.filter(
    (booking) => {
      if (bookingFilter === "All") return true;

      return (
        (booking.status || "Pending").toLowerCase() ===
        bookingFilter.toLowerCase()
      );
    }
  );

  // Selected booking details
  const bookingDetails = selectedBooking
    ? [
        {
          label: "Guest",
          value: getGuestName(selectedBooking, users),
        },
        {
          label: "Email",
          value:
            selectedBooking.userEmail ||
            selectedBooking.email ||
            "Not provided",
        },
        {
          label: "Hotel",
          value: getHotelName(selectedBooking),
        },
        {
          label: "Room type",
          value: selectedBooking.roomType || "Not specified",
        },
        {
          label: "Check-in",
          value: formatDate(selectedBooking.checkIn),
        },
        {
          label: "Check-out",
          value: formatDate(selectedBooking.checkOut),
        },
        {
          label: "Guests",
          value: selectedBooking.guests ?? "Not specified",
        },
        {
          label: "Number of nights",
          value: selectedBooking.nights ?? "Not specified",
        },
        {
          label: "Booking total",
          value: money(selectedBooking.total),
        },
        {
          label: "Booking status",
          value: selectedBooking.status || "Pending",
        },
        {
          label: "Created on",
          value: formatDate(selectedBooking.createdAt),
        },
      ]
    : [];

  const quickActions = [
    {
      title: "Add New Hotel",
      description: "Expand your hotel collection",
      icon: Plus,
      link: "/admin/hotels",
      color: "text-purple-300",
    },
    {
      title: "Manage Bookings",
      description: `${pendingBookings.length} pending request(s)`,
      icon: CalendarCheck,
      link: "/admin/bookings",
      color: "text-teal-300",
    },
    {
      title: "Manage Users",
      description: `${users.length} registered user(s)`,
      icon: Users,
      link: "/admin/users",
      color: "text-indigo-300",
    },
    {
      title: "View Reports",
      description: "Explore booking performance",
      icon: FileBarChart,
      link: "/admin/reports",
      color: "text-amber-300",
    },
  ];

  return (
    <div className="relative isolate mx-auto max-w-7xl space-y-8 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#17152b] via-[#211d3b] to-[#101827] p-4 text-white shadow-2xl shadow-purple-950/30 sm:p-6 lg:p-8">

      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-32 -top-32 -z-10 h-80 w-80 rounded-full bg-purple-600/20 blur-[100px]" />

      <div className="pointer-events-none absolute -right-32 top-40 -z-10 h-80 w-80 rounded-full bg-teal-400/10 blur-[100px]" />

      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold tracking-[0.2em] text-teal-300">
            OVERVIEW
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Dashboard
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Welcome back! Here's your Stayora hotel business overview.
          </p>
        </div>

        <div className={`${glassCard} px-5 py-3 text-sm text-slate-300`}>
          <span className="font-semibold text-white">Today</span>
          <span className="mx-2 text-white/30">|</span>

          {new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </div>
      </div>

      {/* Statistics */}
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className={`${glassCard} group p-5 transition duration-300 hover:-translate-y-1 hover:border-purple-400/30 hover:bg-white/[0.10]`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`rounded-xl border border-white/10 bg-gradient-to-br ${stat.accent} p-3 ${stat.iconColor}`}
                >
                  <Icon size={22} />
                </div>

                <ArrowUpRight
                  size={18}
                  className="text-slate-500 transition group-hover:text-teal-300"
                />
              </div>

              <p className="mt-5 text-sm text-slate-400">
                {stat.title}
              </p>

              <h3 className="mt-1 break-words text-2xl font-bold text-white">
                {stat.value}
              </h3>

              <p className="mt-2 text-xs text-slate-400">
                {stat.detail}
              </p>
            </div>
          );
        })}
      </section>

      {/* Quick Actions */}
      <section className="space-y-5">
        <div>
          <p className="text-sm font-semibold tracking-[0.2em] text-teal-300">
            SHORTCUTS
          </p>

          <h3 className="mt-1 text-2xl font-bold text-white">
            Quick Actions
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            Quickly access important admin tools.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <Link
                key={action.title}
                to={action.link}
                className={`${glassCard} group flex items-center gap-4 p-5 transition duration-300 hover:-translate-y-1 hover:border-purple-400/30 hover:bg-white/[0.10]`}
              >
                <div className="rounded-xl border border-white/10 bg-white/[0.06] p-3">
                  <Icon size={22} className={action.color} />
                </div>

                <div className="min-w-0">
                  <h4 className="font-semibold text-white">
                    {action.title}
                  </h4>

                  <p className="mt-1 text-xs text-slate-400">
                    {action.description}
                  </p>
                </div>

                <ArrowUpRight
                  size={18}
                  className="ml-auto shrink-0 text-slate-500 transition group-hover:text-teal-300"
                />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Hotel Inventory */}
      <section className={`${glassCard} p-5 sm:p-6`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white">
              Hotel Inventory
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Current hotel availability in your admin list.
            </p>
          </div>

          <Hotel className="text-teal-300" size={24} />
        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 transition-all"
            style={{
              width: allHotels.length
                ? `${(activeHotels.length / allHotels.length) * 100}%`
                : "0%",
            }}
          />
        </div>

        <div className="mt-3 flex flex-wrap justify-between gap-2 text-sm">
          <span className="flex items-center gap-2 text-slate-300">
            <CheckCircle2 size={16} className="text-teal-300" />
            {activeHotels.length} active hotels
          </span>

          <span className="flex items-center gap-2 text-slate-400">
            <XCircle size={16} />
            {inactiveHotels} inactive hotels
          </span>
        </div>

        <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-4">
          <Star size={20} className="text-amber-300" />

          <div>
            <p className="text-sm font-semibold text-white">
              Average hotel rating: {averageRating}
            </p>

            <p className="text-xs text-slate-400">
              Based on {ratedHotels.length} rated hotels
            </p>
          </div>
        </div>
      </section>

      {/* Guest Insights */}
      <section className={`${glassCard} p-5 sm:p-6`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">
              Guest Insights
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Overview of registered users and booking activity.
            </p>
          </div>

          <UserRound size={24} className="text-purple-300" />
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm text-slate-400">
              Registered users
            </p>

            <h4 className="mt-2 text-2xl font-bold text-white">
              {users.length.toLocaleString("en-NP")}
            </h4>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm text-slate-400">
              Guests with bookings
            </p>

            <h4 className="mt-2 text-2xl font-bold text-white">
              {guestsWithBookings.toLocaleString("en-NP")}
            </h4>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm text-slate-400">
              Average hotel rating
            </p>

            <h4 className="mt-2 text-2xl font-bold text-amber-300">
              {averageRating}

              {averageRating !== "—" && (
                <span className="ml-1 text-sm text-slate-400">
                  / 5
                </span>
              )}
            </h4>
          </div>
        </div>
      </section>

      {/* Booking Analytics */}
      <section className="space-y-5">
        <div>
          <p className="text-sm font-semibold tracking-[0.2em] text-teal-300">
            PERFORMANCE
          </p>

          <h3 className="mt-1 text-2xl font-bold text-white">
            Booking Analytics
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            Performance insights based on your stored booking records.
          </p>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">

          {/* Monthly Bookings */}
          <div className={`${glassCard} p-5 sm:p-6`}>
            <h4 className="font-bold text-white">
              Monthly Bookings
            </h4>

            <p className="mt-1 text-xs text-slate-400">
              Booking requests over the last six months
            </p>

            <div className="mt-7 flex h-52 items-end justify-between gap-2">
              {monthlyAnalytics.map((item, index) => (
                <div
                  key={`${item.label}-${index}`}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                >
                  <span className="text-xs font-semibold text-slate-300">
                    {item.bookings}
                  </span>

                  <div className="flex h-36 w-full items-end justify-center">
                    <div
                      className="w-full max-w-10 rounded-t-lg bg-gradient-to-t from-purple-600 to-violet-400 transition-all"
                      style={{
                        height: `${Math.max(
                          item.bookings > 0 ? 8 : 0,
                          (item.bookings / maxMonthlyBookings) * 100
                        )}%`,
                      }}
                    />
                  </div>

                  <span className="text-xs text-slate-400">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Revenue */}
          <div className={`${glassCard} p-5 sm:p-6`}>
            <h4 className="font-bold text-white">
              Monthly Revenue
            </h4>

            <p className="mt-1 text-xs text-slate-400">
              Estimated value of accepted bookings
            </p>

            <div className="mt-7 flex h-52 items-end justify-between gap-2">
              {monthlyAnalytics.map((item, index) => (
                <div
                  key={`${item.label}-${index}`}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                >
                  <span className="text-center text-[10px] font-semibold text-slate-300">
                    {item.revenue > 0
                      ? `${(item.revenue / 1000).toFixed(1)}k`
                      : "0"}
                  </span>

                  <div className="flex h-36 w-full items-end justify-center">
                    <div
                      className="w-full max-w-10 rounded-t-lg bg-gradient-to-t from-emerald-600 to-teal-300 transition-all"
                      style={{
                        height: `${Math.max(
                          item.revenue > 0 ? 8 : 0,
                          (item.revenue / maxMonthlyRevenue) * 100
                        )}%`,
                      }}
                    />
                  </div>

                  <span className="text-xs text-slate-400">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Values shown in thousands of NPR where applicable.
            </p>
          </div>
        </div>

        {/* Status and Top Hotels */}
        <div className="grid gap-5 xl:grid-cols-2">

          {/* Booking Status */}
          <div className={`${glassCard} p-5 sm:p-6`}>
            <h4 className="font-bold text-white">
              Booking Status
            </h4>

            <p className="mt-1 text-xs text-slate-400">
              Breakdown of all booking requests
            </p>

            <div className="mt-6 flex h-3 overflow-hidden rounded-full bg-white/10">
              {bookingStatuses.map((item) => (
                <div
                  key={item.label}
                  className={`${item.color} transition-all`}
                  style={{
                    width: `${(item.count / totalStatusBookings) * 100}%`,
                  }}
                />
              ))}
            </div>

            <div className="mt-6 space-y-4">
              {bookingStatuses.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-3 w-3 rounded-full ${item.color}`}
                    />

                    <span className="text-sm text-slate-300">
                      {item.label}
                    </span>
                  </div>

                  <span className="text-sm font-bold text-white">
                    {item.count}

                    <span className="ml-2 text-xs font-normal text-slate-400">
                      (
                      {((item.count / totalStatusBookings) * 100).toFixed(0)}
                      %)
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Hotels */}
          <div className={`${glassCard} p-5 sm:p-6`}>
            <h4 className="font-bold text-white">
              Top Performing Hotels
            </h4>

            <p className="mt-1 text-xs text-slate-400">
              Ranked by accepted booking revenue
            </p>

            {topHotels.length === 0 ? (
              <div className="py-12 text-center">
                <Hotel
                  className="mx-auto text-slate-500"
                  size={32}
                />

                <p className="mt-3 text-sm font-medium text-slate-300">
                  No accepted bookings yet
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Hotel performance will appear here.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-5">
                {topHotels.map((hotel, index) => (
                  <div key={hotel.name}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-purple-400/20 bg-purple-400/10 text-sm font-bold text-purple-300">
                          {index + 1}
                        </span>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">
                            {hotel.name}
                          </p>

                          <p className="text-xs text-slate-400">
                            {hotel.bookings} accepted booking(s)
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 text-xs font-bold text-slate-200">
                        {money(hotel.revenue)}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-teal-400"
                        style={{
                          width: `${
                            (hotel.revenue /
                              Math.max(1, topHotels[0].revenue)) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Recent Bookings */}
      <section className={`${glassCard} overflow-hidden`}>
        <div className="flex flex-col justify-between gap-3 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h3 className="text-lg font-bold text-white">
              Recent Bookings
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Select a booking row to view its details.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Clock3 size={17} />
            Live browser data
          </div>
        </div>

        {/* Booking Filters */}
        <div className="flex flex-wrap items-center gap-3 border-b border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-slate-300 sm:px-6">
          {[
            "All",
            "Pending",
            "Accepted",
            "Rejected",
            "Cancelled",
          ].map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setBookingFilter(filter)}
              className={`rounded-xl border px-4 py-2 text-xs font-semibold transition ${
                bookingFilter === filter
                  ? "border-purple-400/30 bg-purple-500/30 text-white shadow-lg shadow-purple-950/20"
                  : "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/10"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {filteredBookings.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <CalendarCheck
              size={36}
              className="mx-auto text-slate-500"
            />

            <h4 className="mt-3 font-semibold text-white">
              No bookings found
            </h4>

            <p className="mt-1 text-sm text-slate-400">
              No bookings match the selected filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-white/[0.04] text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">
                    Booking ID
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Guest
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Hotel
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Check-in
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Amount
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Status
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    View
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/[0.07]">
                {filteredBookings.map((booking, index) => {
                  const bookingId =
                    booking.bookingId || `booking-${index}`;

                  const status = booking.status || "Pending";

                  return (
                    <tr
                      key={bookingId}
                      onClick={() => {
                        setStatusMessage("");
                        setSelectedBooking(booking);
                      }}
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" ||
                          event.key === " "
                        ) {
                          event.preventDefault();
                          setStatusMessage("");
                          setSelectedBooking(booking);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`View booking ${bookingId}`}
                      className="cursor-pointer transition hover:bg-purple-400/[0.08] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-400"
                    >
                      <td className="px-6 py-4 font-semibold text-teal-300">
                        {booking.bookingId || "—"}
                      </td>

                      <td className="px-6 py-4 font-medium text-white">
                        {getGuestName(booking, users)}
                      </td>

                      <td className="px-6 py-4 text-slate-300">
                        {getHotelName(booking)}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-slate-300">
                        {formatDate(booking.checkIn)}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 font-medium text-white">
                        {money(booking.total)}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold ${
                            statusStyles[status] ||
                            "border-white/10 bg-white/10 text-slate-300"
                          }`}
                        >
                          {status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-teal-300">
                        <Eye size={18} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-white/10 px-6 py-4 text-xs text-slate-400">
          Revenue is an estimate based on accepted bookings, not verified payments.
        </div>
      </section>

      {/* Dashboard Note */}
      <div className="rounded-2xl border border-teal-300/20 bg-gradient-to-r from-teal-500/10 to-purple-500/10 p-5 backdrop-blur-xl sm:p-6">
        <h3 className="font-bold text-teal-200">
          Stayora Booking Overview
        </h3>

        <p className="mt-1 text-sm leading-6 text-slate-300">
          Review pending requests in Manage Bookings or open a recent
          booking to inspect its details and update its status.
        </p>

        <Link
          to="/admin/bookings"
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-teal-300/20 bg-teal-400/10 px-4 py-2.5 text-sm font-semibold text-teal-200 transition hover:bg-teal-400/20"
        >
          Manage Bookings
          <ArrowUpRight size={16} />
        </Link>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md"
          onClick={() => setSelectedBooking(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-modal-title"
            onClick={(event) => event.stopPropagation()}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#211d3b]/95 shadow-2xl shadow-black/50 backdrop-blur-2xl"
          >
            {/* Modal Header */}
            <div className="sticky top-0 flex items-start justify-between border-b border-white/10 bg-[#211d3b]/95 p-5 backdrop-blur-xl sm:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-teal-300">
                  Booking Details
                </p>

                <h3
                  id="booking-modal-title"
                  className="mt-1 break-all text-xl font-bold text-white"
                >
                  {selectedBooking.bookingId || "Booking"}
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Review the guest's reservation information.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                aria-label="Close booking details"
                className="rounded-xl border border-white/10 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <X size={21} />
              </button>
            </div>

            {/* Booking Information */}
            <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
              {bookingDetails.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-white/10 bg-white/[0.06] p-4"
                >
                  <p className="text-xs font-medium text-slate-400">
                    {item.label}
                  </p>

                  <p className="mt-1 break-words text-sm font-semibold text-white">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Status Message */}
            {statusMessage && (
              <p
                role="status"
                className="mx-5 mb-4 rounded-xl border border-teal-300/20 bg-teal-400/10 px-4 py-3 text-sm text-teal-200 sm:mx-6"
              >
                {statusMessage}
              </p>
            )}

            {/* Booking Actions */}
            {selectedBooking.status === "Pending" && (
              <div className="flex flex-col gap-3 px-5 pb-5 sm:flex-row sm:justify-end sm:px-6">
                <button
                  type="button"
                  disabled={updatingBooking}
                  onClick={() => handleBookingStatus("Rejected")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <XCircle size={18} />
                  {updatingBooking ? "Updating..." : "Reject Booking"}
                </button>

                <button
                  type="button"
                  disabled={updatingBooking}
                  onClick={() => handleBookingStatus("Accepted")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-950/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckCircle2 size={18} />
                  {updatingBooking ? "Updating..." : "Accept Booking"}
                </button>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-white/10 p-5">
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="rounded-xl border border-white/10 bg-white/[0.07] px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
              >
                Close Details
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
