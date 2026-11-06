
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  Hotel,
  BedDouble,
  IndianRupee,
  X,
  CheckCircle2,
  AlertCircle,
  XCircle,
  CalendarCheck,
  ArrowRight,
} from "lucide-react";

import {
  getBookings,
  subscribeToBookingChanges,
} from "../../utils/bookings";

const STATUS_STYLES = {
  Pending: "bg-amber-500/15 text-amber-300 border-amber-400/20",
  Accepted: "bg-emerald-500/15 text-emerald-300 border-emerald-400/20",
  Rejected: "bg-red-500/15 text-red-300 border-red-400/20",
  Cancelled: "bg-slate-500/15 text-slate-300 border-slate-400/20",
};

const STATUS_DOT = {
  Pending: "bg-amber-400",
  Accepted: "bg-emerald-400",
  Rejected: "bg-red-400",
  Cancelled: "bg-slate-400",
};

const FILTERS = ["All", "Pending", "Accepted", "Rejected", "Cancelled"];

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseLocalDate(value) {
  if (!value) return null;

  const parts = String(value).split("-").map(Number);

  if (
    parts.length !== 3 ||
    parts.some((part) => !Number.isFinite(part))
  ) return null;

  const [year, month, day] = parts;
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) return null;

  return date;
}

function formatDate(value, options = {}) {
  const date = parseLocalDate(value);

  if (!date) return "Date unavailable";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  });
}

function isBookingOnDate(booking, date) {
  const checkIn = parseLocalDate(booking.checkIn);
  const checkOut = parseLocalDate(booking.checkOut);

  if (!checkIn || !checkOut || checkOut <= checkIn) return false;

  return date >= checkIn && date < checkOut;
}

function AdminNotificationsCalendar() {
  const [bookings, setBookings] = useState(getBookings);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    return subscribeToBookingChanges(() => {
      setBookings(getBookings());
    });
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startOffset = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const calendarDays = Array.from(
    { length: startOffset + daysInMonth },
    (_, index) => {
      if (index < startOffset) return null;
      return new Date(year, month, index - startOffset + 1);
    }
  );

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      if (!parseLocalDate(booking.checkIn) || !parseLocalDate(booking.checkOut)) {
        return false;
      }

      return activeFilter === "All" || booking.status === activeFilter;
    });
  }, [bookings, activeFilter]);

  const stats = useMemo(() => {
    const validBookings = bookings.filter(
      (booking) =>
        parseLocalDate(booking.checkIn) &&
        parseLocalDate(booking.checkOut)
    );

    return {
      total: validBookings.length,
      pending: validBookings.filter((b) => b.status === "Pending").length,
      accepted: validBookings.filter((b) => b.status === "Accepted").length,
      cancelled: validBookings.filter(
        (b) => b.status === "Cancelled" || b.status === "Rejected"
      ).length,
    };
  }, [bookings]);

  const upcomingBookings = useMemo(() => {
    const today = dateKey(new Date());

    return bookings
      .filter((booking) => {
        return (
          booking.status === "Accepted" &&
          booking.checkIn >= today &&
          parseLocalDate(booking.checkIn)
        );
      })
      .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
      .slice(0, 5);
  }, [bookings]);

  const monthBookings = filteredBookings.filter((booking) => {
    const checkIn = parseLocalDate(booking.checkIn);
    const checkOut = parseLocalDate(booking.checkOut);

    return (
      checkIn &&
      checkOut &&
      checkIn <= lastDay &&
      checkOut > firstDay
    );
  });

  const goToMonth = (direction) => {
    setCurrentDate(new Date(year, month + direction, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const openBooking = (booking) => {
    setSelectedBooking(booking);
  };

  return (
    <div className="min-h-screen space-y-7 text-white">

      {/* HEADER */}
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-purple-300">
            <CalendarDays size={16} />
            <span className="text-xs font-semibold uppercase tracking-[0.2em]">
              Stayora Control Center
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            Booking Calendar
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Manage hotel reservations, check-ins and guest schedules.
          </p>
        </div>

        <button
          onClick={goToToday}
          className="flex items-center justify-center gap-2 rounded-xl border border-purple-400/20 bg-purple-500/10 px-5 py-3 text-sm font-semibold text-purple-200 transition hover:bg-purple-500/20"
        >
          <CalendarCheck size={17} />
          Go to Today
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total Bookings",
            value: stats.total,
            icon: CalendarDays,
            color: "text-purple-300",
            bg: "bg-purple-500/10",
          },
          {
            label: "Accepted",
            value: stats.accepted,
            icon: CheckCircle2,
            color: "text-emerald-300",
            bg: "bg-emerald-500/10",
          },
          {
            label: "Pending",
            value: stats.pending,
            icon: Clock,
            color: "text-amber-300",
            bg: "bg-amber-500/10",
          },
          {
            label: "Rejected / Cancelled",
            value: stats.cancelled,
            icon: XCircle,
            color: "text-red-300",
            bg: "bg-red-500/10",
          },
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/[0.07] bg-[#191727] p-5 transition hover:-translate-y-1 hover:border-purple-400/20"
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

      {/* CALENDAR + SIDEBAR */}
      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1fr)_320px]">

        {/* CALENDAR */}
        <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#191727]">

          {/* MONTH NAVIGATION */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] p-5">
            <div>
              <h2 className="text-xl font-bold">
                {currentDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {monthBookings.length} bookings in this month
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => goToMonth(-1)}
                className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-300 transition hover:bg-white/10"
                aria-label="Previous month"
              >
                <ChevronLeft size={19} />
              </button>

              <button
                onClick={goToToday}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-medium text-slate-300 transition hover:bg-white/10"
              >
                Today
              </button>

              <button
                onClick={() => goToMonth(1)}
                className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-300 transition hover:bg-white/10"
                aria-label="Next month"
              >
                <ChevronRight size={19} />
              </button>
            </div>
          </div>

          {/* FILTERS */}
          <div className="flex gap-2 overflow-x-auto border-b border-white/[0.07] px-5 py-4">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-medium transition ${
                  activeFilter === filter
                    ? "bg-purple-500/20 text-purple-200 ring-1 ring-purple-400/30"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* LEGEND */}
          <div className="flex flex-wrap gap-4 px-5 py-4">
            {FILTERS.slice(1).map((status) => (
              <div key={status} className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${STATUS_DOT[status]}`} />
                <span className="text-xs text-slate-400">{status}</span>
              </div>
            ))}
          </div>

          {/* WEEKDAYS */}
          <div className="grid grid-cols-7 border-y border-white/[0.07] bg-white/[0.015]">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="py-3 text-center text-xs font-semibold text-slate-500"
              >
                {day}
              </div>
            ))}
          </div>

          {/* CALENDAR GRID */}
          <div className="grid grid-cols-7">
            {calendarDays.map((date, index) => {
              if (!date) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="min-h-28 border-b border-r border-white/[0.05] bg-black/[0.08] sm:min-h-36"
                  />
                );
              }

              const today = dateKey(new Date()) === dateKey(date);

              const dayBookings = monthBookings.filter((booking) =>
                isBookingOnDate(booking, date)
              );

              return (
                <div
                  key={dateKey(date)}
                  className={`min-h-28 border-b border-r border-white/[0.05] p-1.5 transition sm:min-h-36 sm:p-2 ${
                    today ? "bg-purple-500/[0.07]" : "hover:bg-white/[0.02]"
                  }`}
                >
                  <div className="mb-2 flex justify-center sm:justify-start">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                        today
                          ? "bg-purple-500 text-white"
                          : "text-slate-400"
                      }`}
                    >
                      {date.getDate()}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {dayBookings.slice(0, 3).map((booking) => (
                      <button
                        key={`${booking.bookingId}-${dateKey(date)}`}
                        onClick={() => openBooking(booking)}
                        title={`${booking.userName || "Guest"} · ${booking.hotelName || "Hotel"} · ${booking.status}`}
                        className={`w-full truncate rounded-md border px-1.5 py-1 text-left text-[9px] font-medium transition hover:brightness-125 sm:text-[10px] ${
                          STATUS_STYLES[booking.status] ||
                          STATUS_STYLES.Pending
                        }`}
                      >
                        <span className="hidden sm:inline">
                          {booking.userName || "Guest"}
                        </span>
                        <span className="sm:hidden">
                          {booking.userName?.split(" ")[0] || "Guest"}
                        </span>
                      </button>
                    ))}

                    {dayBookings.length > 3 && (
                      <p className="px-1 text-[9px] text-slate-500">
                        +{dayBookings.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* CALENDAR FOOTER */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-5">
            <p className="text-xs text-slate-500">
              Select a booking to view its details.
            </p>
            <span className="text-xs text-slate-500">
              {year}
            </span>
          </div>
        </div>

        {/* UPCOMING CHECK-INS */}
        <div className="h-fit rounded-2xl border border-white/[0.07] bg-[#191727]">
          <div className="border-b border-white/[0.07] p-5">
            <div className="flex items-center gap-2">
              <CalendarCheck size={19} className="text-purple-300" />
              <h2 className="font-semibold">Upcoming Check-ins</h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Accepted reservations from today onwards
            </p>
          </div>

          <div className="space-y-3 p-4">
            {upcomingBookings.length === 0 ? (
              <div className="py-10 text-center">
                <CalendarDays size={30} className="mx-auto text-slate-600" />
                <p className="mt-3 text-sm text-slate-400">
                  No upcoming check-ins
                </p>
              </div>
            ) : (
              upcomingBookings.map((booking) => (
                <button
                  key={booking.bookingId}
                  onClick={() => openBooking(booking)}
                  className="w-full rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 text-left transition hover:border-purple-400/30 hover:bg-purple-500/[0.05]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-purple-300">
                      {formatDate(booking.checkIn, {
                        weekday: "short",
                      })}
                    </span>
                    <ArrowRight size={15} className="text-slate-500" />
                  </div>

                  <h3 className="mt-3 truncate text-sm font-semibold text-slate-100">
                    {booking.userName || "Guest"}
                  </h3>

                  <p className="mt-1 truncate text-xs text-slate-400">
                    {booking.hotelName || "Hotel"}
                  </p>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Users size={13} />
                      {booking.guests || 1} guests
                    </span>

                    <span className="text-[10px] text-emerald-300">
                      Accepted
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* BOOKING DETAILS MODAL */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#191727] shadow-2xl shadow-black/40"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/[0.07] p-5">
              <div>
                <h2 className="text-lg font-bold">Booking Details</h2>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedBooking.bookingId}
                </p>
              </div>

              <button
                onClick={() => setSelectedBooking(null)}
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 transition hover:text-white"
                aria-label="Close booking details"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-purple-500/10 p-3 text-purple-300">
                  <Hotel size={21} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold">
                    {selectedBooking.hotelName || "Hotel"}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    {selectedBooking.hotel?.location || "Hotel reservation"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
                  <p className="text-xs text-slate-500">Check-in</p>
                  <p className="mt-2 text-sm font-semibold">
                    {formatDate(selectedBooking.checkIn)}
                  </p>
                </div>

                <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
                  <p className="text-xs text-slate-500">Check-out</p>
                  <p className="mt-2 text-sm font-semibold">
                    {formatDate(selectedBooking.checkOut)}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm text-slate-400">
                    <Users size={16} /> Guest
                  </span>
                  <span className="text-sm font-medium">
                    {selectedBooking.userName || "Guest"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm text-slate-400">
                    <BedDouble size={16} /> Room
                  </span>
                  <span className="text-sm font-medium">
                    {selectedBooking.roomType || "Not specified"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm text-slate-400">
                    <Users size={16} /> Guests
                  </span>
                  <span className="text-sm font-medium">
                    {selectedBooking.guests || 1}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm text-slate-400">
                    <Clock size={16} /> Nights
                  </span>
                  <span className="text-sm font-medium">
                    {selectedBooking.nights || "—"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
                <span className="flex items-center gap-2 text-sm text-slate-400">
                  <IndianRupee size={16} /> Total amount
                </span>
                <span className="text-lg font-bold text-purple-300">
                  NPR {Number(selectedBooking.total || selectedBooking.price || 0).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-white/[0.07] pt-4">
                <span className="text-sm text-slate-400">Booking status</span>

                <span
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    STATUS_STYLES[selectedBooking.status] ||
                    STATUS_STYLES.Pending
                  }`}
                >
                  {selectedBooking.status || "Pending"}
                </span>
              </div>
            </div>

            <div className="border-t border-white/[0.07] p-5">
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-full rounded-xl bg-purple-500 py-3 text-sm font-semibold text-white transition hover:bg-purple-600"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminNotificationsCalendar;
