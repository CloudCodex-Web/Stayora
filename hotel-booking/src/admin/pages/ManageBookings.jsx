import { useEffect, useMemo, useState } from "react";
import {
  Search,
  X,
  CalendarDays,
  Users,
  Hotel,
  CheckCircle2,
  Clock3,
  XCircle,
  Ban,
  SlidersHorizontal,
  ClipboardList,
  MapPin,
  Coins,
} from "lucide-react";

import {
  getBookings,
  updateBookingStatus,
  subscribeToBookingChanges,
} from "../../utils/bookings";

import { getUsers, subscribeToUserChanges } from "../../utils/users";

const statusStyles = {
  Pending: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  Accepted: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  Rejected: "border-red-400/20 bg-red-400/10 text-red-300",
  Cancelled: "border-slate-400/20 bg-slate-400/10 text-slate-300",
  Unknown: "border-purple-400/20 bg-purple-400/10 text-purple-300",
};

const normalizeStatus = (status) => {
  const value = String(status || "Pending")
    .trim()
    .toLowerCase();

  const statusMap = {
    pending: "Pending",
    accepted: "Accepted",
    confirmed: "Accepted",
    rejected: "Rejected",
    cancelled: "Cancelled",
  };

  return statusMap[value] || "Unknown";
};

const cardStyle =
  "rounded-2xl border border-white/[0.07] bg-[#191727]/80 shadow-lg shadow-black/10";

const inputStyle =
  "rounded-xl border border-white/10 bg-[#11101c]/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-500/10";

export default function ManageBookings() {
  const [users, setUsers] = useState(() => getUsers());
  const [bookings, setBookings] = useState(() => getBookings());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const refreshBookings = () => setBookings(getBookings());

    const unsubscribe = subscribeToBookingChanges(refreshBookings);

    refreshBookings();

    return unsubscribe;
  }, []);

  useEffect(() => {
    const refreshUsers = () => setUsers(getUsers());

    const unsubscribe = subscribeToUserChanges(refreshUsers);

    refreshUsers();

    return unsubscribe;
  }, []);

  const filteredBookings = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return bookings.filter((booking) => {
      const matchesSearch = [
        booking.bookingId,
        booking.hotelName,
        booking.guestName,
        booking.name,
        booking.email,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(searchText));

      const matchesStatus =
        statusFilter === "All" ||
        normalizeStatus(booking.status) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, statusFilter]);

  function handleStatusChange(bookingId, status) {
    if (!bookingId) {
      alert("Booking ID is missing. Unable to update this booking.");
      return;
    }

    try {
      setUpdatingId(bookingId);
      updateBookingStatus(bookingId, status);
      setBookings(getBookings());
    } catch (error) {
      console.error("Could not update booking:", error);
      alert("Unable to update booking status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  }

  const counts = {
    All: bookings.length,
    Pending: bookings.filter((b) => normalizeStatus(b.status) === "Pending")
      .length,
    Accepted: bookings.filter((b) => normalizeStatus(b.status) === "Accepted")
      .length,
    Rejected: bookings.filter((b) => normalizeStatus(b.status) === "Rejected")
      .length,
    Cancelled: bookings.filter((b) => normalizeStatus(b.status) === "Cancelled")
      .length,
  };

  function formatDate(date) {
    if (!date) return "—";

    const parsedDate = new Date(
      `${date}`.length === 10 ? `${date}T00:00:00` : date,
    );

    return Number.isNaN(parsedDate.getTime())
      ? "—"
      : parsedDate.toLocaleDateString();
  }

  function formatPrice(amount) {
    const value = Number(amount);

    if (!Number.isFinite(value)) return "—";

    return `NPR ${value.toLocaleString("en-NP")}`;
  }

  const summaryCards = [
    {
      label: "Total Bookings",
      value: counts.All,
      detail: "All booking requests",
      icon: ClipboardList,
      color: "text-purple-300",
      iconBg: "bg-purple-500/10",
    },
    {
      label: "Pending",
      value: counts.Pending,
      detail: "Awaiting review",
      icon: Clock3,
      color: "text-amber-300",
      iconBg: "bg-amber-500/10",
    },
    {
      label: "Accepted",
      value: counts.Accepted,
      detail: "Approved bookings",
      icon: CheckCircle2,
      color: "text-emerald-300",
      iconBg: "bg-emerald-500/10",
    },
    {
      label: "Rejected",
      value: counts.Rejected,
      detail: "Rejected requests",
      icon: XCircle,
      color: "text-red-300",
      iconBg: "bg-red-500/10",
    },
    {
      label: "Cancelled",
      value: counts.Cancelled,
      detail: "Cancelled bookings",
      icon: Ban,
      color: "text-slate-300",
      iconBg: "bg-slate-500/10",
    },
  ];

  return (
    <div className="space-y-7 text-slate-200">
      {/* Page heading */}
      <div>
        <p className="mb-2 text-xs font-bold tracking-[0.2em] text-teal-300">
          BOOKING MANAGEMENT
        </p>

        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Manage Bookings
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Review guest requests and manage their booking status.
        </p>
      </div>

      {/* Booking statistics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {summaryCards.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className={`${cardStyle} p-5 transition duration-300 hover:-translate-y-1 hover:border-purple-400/20`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-slate-400">{item.label}</p>

                <div className={`rounded-xl p-2 ${item.iconBg}`}>
                  <Icon size={20} className={item.color} />
                </div>
              </div>

              <p className="mt-4 text-3xl font-bold text-white">{item.value}</p>

              <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
            </div>
          );
        })}
      </div>

      {/* Search and filters */}
      <div className={`${cardStyle} p-4 sm:p-5`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-white/10 bg-[#11101c]/70 px-4 py-3 transition focus-within:border-purple-400/50 focus-within:ring-2 focus-within:ring-purple-500/10">
            <Search size={19} className="shrink-0 text-slate-500" />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search booking ID, hotel, guest..."
              aria-label="Search bookings"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="text-slate-500 transition hover:text-white"
              >
                <X size={17} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <SlidersHorizontal size={18} className="text-slate-500" />

            <label htmlFor="booking-status-filter" className="sr-only">
              Filter bookings by status
            </label>

            <select
              id="booking-status-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className={`${inputStyle} min-w-40 bg-[#11101c]`}
            >
              {["All", "Pending", "Accepted", "Rejected", "Cancelled"].map(
                (status) => (
                  <option key={status} value={status}>
                    {status === "All" ? "All statuses" : status}
                  </option>
                ),
              )}
            </select>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("All");
              }}
              className="rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-400 transition hover:border-purple-400/30 hover:bg-purple-500/10 hover:text-white"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Bookings table */}
      <div className={`${cardStyle} overflow-hidden`}>
        <div className="flex flex-col justify-between gap-2 border-b border-white/[0.07] px-5 py-4 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h2 className="font-bold text-white">Booking Requests</h2>

            <p className="mt-1 text-sm text-slate-500">
              Review reservations and update their status.
            </p>
          </div>

          <span className="text-sm text-slate-500">
            Showing {filteredBookings.length} of {bookings.length}
          </span>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10">
              <Hotel size={30} className="text-purple-300" />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-white">
              No bookings found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Booking requests will appear here when guests make reservations.
            </p>

            {(search || statusFilter !== "All") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All");
                }}
                className="mt-4 text-sm font-semibold text-teal-300 transition hover:text-teal-200"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="bg-white/[0.025] text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Booking / Guest</th>
                  <th className="px-5 py-4 font-semibold">Hotel</th>
                  <th className="px-5 py-4 font-semibold">Stay Details</th>
                  <th className="px-5 py-4 font-semibold">Total</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/[0.06]">
                {filteredBookings.map((booking, index) => {
                  const bookingId =
                    booking.bookingId || `booking-${booking.id || index}`;

                  const bookingEmail = (
                    booking.userEmail ||
                    booking.email ||
                    ""
                  )
                    .trim()
                    .toLowerCase();

                  const matchedUser = users.find(
                    (user) => user.email?.trim().toLowerCase() === bookingEmail,
                  );

                  const guestName =
                    booking.guestName ||
                    matchedUser?.name ||
                    booking.name ||
                    booking.fullName ||
                    "Guest";

                  const guestEmail = bookingEmail || "Email not available";
                  const status = normalizeStatus(booking.status);
                  const isUpdating = updatingId === booking.bookingId;

                  return (
                    <tr
                      key={bookingId}
                      className="transition hover:bg-white/[0.025]"
                    >
                      {/* Guest */}
                      <td className="px-5 py-5">
                        <p className="font-semibold text-white">{guestName}</p>

                        <p className="mt-1 text-xs text-purple-300">
                          {booking.bookingId || "No booking ID"}
                        </p>

                        {booking.email && (
                          <p className="mt-1 max-w-[190px] break-all text-xs text-slate-500">
                            {guestEmail}
                          </p>
                        )}
                      </td>

                      {/* Hotel */}
                      <td className="px-5 py-5">
                        <p className="font-medium text-slate-200">
                          {booking.hotelName || booking.hotel?.name || "Hotel"}
                        </p>

                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                          <MapPin size={12} className="text-teal-300" />
                          {booking.roomType || "Standard room"}
                        </p>
                      </td>

                      {/* Stay details */}
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-2 text-slate-300">
                          <CalendarDays size={14} className="text-teal-300" />
                          {formatDate(booking.checkIn)}
                        </div>

                        <p className="my-1 pl-6 text-xs text-slate-500">to</p>

                        <div className="flex items-center gap-2 text-slate-300">
                          <CalendarDays size={14} className="text-teal-300" />
                          {formatDate(booking.checkOut)}
                        </div>

                        <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                          <Users size={13} />
                          {booking.guests ?? "—"} guest(s)
                        </p>
                      </td>

                      {/* Total */}
                      <td className="whitespace-nowrap px-5 py-5">
                        <span className="inline-flex items-center gap-1 font-semibold text-white">
                          <Coins size={15} className="text-teal-300" />
                          {formatPrice(booking.total)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-5">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                            statusStyles[status] || statusStyles.Unknown
                          }`}
                        >
                          {status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-5">
                        {status === "Pending" ? (
                          <div className="flex flex-col gap-2">
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() =>
                                handleStatusChange(
                                  booking.bookingId,
                                  "Accepted",
                                )
                              }
                              className="flex items-center justify-center gap-1.5 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <CheckCircle2 size={14} />
                              {isUpdating ? "Updating..." : "Accept"}
                            </button>

                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() =>
                                handleStatusChange(
                                  booking.bookingId,
                                  "Rejected",
                                )
                              }
                              className="flex items-center justify-center gap-1.5 rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-400/20 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <XCircle size={14} />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">
                            No action needed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Demo notice */}
      <div className="rounded-xl border border-purple-400/10 bg-purple-500/[0.04] px-4 py-3">
        <p className="text-xs leading-5 text-slate-500">
          Demo mode: bookings are stored in this browser. A backend and database
          will be needed to securely manage real guest bookings across devices.
        </p>
      </div>
    </div>
  );
}
