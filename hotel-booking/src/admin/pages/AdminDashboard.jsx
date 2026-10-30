import { useEffect, useState } from "react";
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
} from "lucide-react";

import hotels from "../../data/hotels";
import {
  getStoredHotels,
  subscribeToHotelChanges,
} from "../../data/hotelStorage";
import { getUsers, subscribeToUserChanges } from "../../utils/users";
import {
  getBookings,
  subscribeToBookingChanges,
  updateBookingStatus,
} from "../../utils/bookings";

const money = (amount) => `NPR ${Number(amount || 0).toLocaleString("en-NP")}`;

const statusStyles = {
  Pending: "bg-amber-50 text-amber-700",
  Accepted: "bg-emerald-50 text-emerald-700",
  Confirmed: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-red-50 text-red-700",
  Cancelled: "bg-gray-100 text-gray-600",
};

function formatDate(date) {
  if (!date) return "—";

  const parsed = new Date(
    String(date).length === 10 ? `${date}T00:00:00` : date,
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
  const email = (booking.userEmail || booking.email || "").trim().toLowerCase();

  const matchedUser = users.find(
    (user) => user.email?.trim().toLowerCase() === email,
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
  const [allHotels, setAllHotels] = useState(() => getStoredHotels(hotels));
  const [users, setUsers] = useState(() => getUsers());
  const [bookings, setBookings] = useState(() => getBookings());
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [bookingFilter, setBookingFilter] = useState("All");

  useEffect(() => {
    const refreshHotels = () => setAllHotels(getStoredHotels(hotels));
    refreshHotels();
    return subscribeToHotelChanges(refreshHotels);
  }, []);

  useEffect(() => {
    const refreshUsers = () => setUsers(getUsers());
    refreshUsers();
    return subscribeToUserChanges(refreshUsers);
  }, []);

  useEffect(() => {
    const refreshBookings = () => {
      const latestBookings = getBookings();
      setBookings(latestBookings);

      setSelectedBooking((current) => {
        if (!current) return null;

        return (
          latestBookings.find(
            (booking) => booking.bookingId === current.bookingId,
          ) || current
        );
      });
    };

    refreshBookings();
    return subscribeToBookingChanges(refreshBookings);
  }, []);

  useEffect(() => {
    if (!selectedBooking) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setSelectedBooking(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedBooking]);

  function handleBookingStatus(status) {
    if (!selectedBooking?.bookingId) return;

    try {
      updateBookingStatus(selectedBooking.bookingId, status);

      const updatedBooking = {
        ...selectedBooking,
        status,
        updatedAt: new Date().toISOString(),
      };

      setSelectedBooking(updatedBooking);
      setBookings(getBookings());
      setStatusMessage(`Booking ${status.toLowerCase()} successfully.`);
    } catch (error) {
      console.error("Failed to update booking:", error);
      setStatusMessage("Could not update the booking. Please try again.");
    }
  }

  const activeHotels = allHotels.filter(
    (hotel) => hotel.status?.toLowerCase() !== "inactive",
  );

  const inactiveHotels = allHotels.length - activeHotels.length;

  const ratedHotels = allHotels.filter((hotel) => Number(hotel.rating) > 0);

  const averageRating = ratedHotels.length
    ? (
        ratedHotels.reduce((total, hotel) => total + Number(hotel.rating), 0) /
        ratedHotels.length
      ).toFixed(1)
    : "—";

  const pendingBookings = bookings.filter(
    (booking) => (booking.status || "Pending") === "Pending",
  );

  const acceptedBookings = bookings.filter(
    (booking) =>
      booking.status === "Accepted" || booking.status === "Confirmed",
  );

  const rejectedBookings = bookings.filter(
    (booking) => booking.status === "Rejected",
  );

  const demoRevenue = acceptedBookings.reduce(
    (total, booking) => total + Number(booking.total || 0),
    0,
  );

  const stats = [
    {
      title: "Total Hotels",
      value: allHotels.length.toLocaleString("en-NP"),
      detail: `${activeHotels.length} active · ${inactiveHotels} inactive`,
      icon: Hotel,
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "Total Bookings",
      value: bookings.length.toLocaleString("en-NP"),
      detail: `${acceptedBookings.length} accepted`,
      icon: CalendarCheck,
      color: "bg-teal-100 text-teal-700",
    },
    {
      title: "Pending Requests",
      value: pendingBookings.length.toLocaleString("en-NP"),
      detail: `${rejectedBookings.length} rejected`,
      icon: Clock3,
      color: "bg-amber-100 text-amber-700",
    },
    {
      title: "Estimated Revenue",
      value: money(demoRevenue),
      detail: "From accepted bookings only",
      icon: Wallet,
      color: "bg-emerald-100 text-emerald-700",
    },
  ];

  const allSortedBookings = [...bookings].sort(
    (a, b) =>
      new Date(b.createdAt || 0).getTime() -
      new Date(a.createdAt || 0).getTime(),
  );

  const filteredBookings = allSortedBookings.filter((booking) => {
    if (bookingFilter === "All") return true;

    return (
      (booking.status || "Pending").toLowerCase() ===
      bookingFilter.toLowerCase()
    );
  });

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

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-teal-700">OVERVIEW</p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Welcome back! Here's your Stayora hotel business overview.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          <span className="font-medium">Today</span>
          <span className="mx-2 text-slate-300">|</span>
          {new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className={`rounded-xl p-3 ${stat.color}`}>
                  <Icon size={22} />
                </div>
                <ArrowUpRight size={18} className="text-slate-400" />
              </div>

              <p className="mt-5 text-sm text-slate-500">{stat.title}</p>
              <h3 className="mt-1 break-words text-2xl font-bold text-slate-900">
                {stat.value}
              </h3>
              <p className="mt-2 text-xs text-slate-500">{stat.detail}</p>
            </div>
          );
        })}
      </div>

      {/* Hotel inventory */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Hotel inventory
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Current hotel availability in your admin list.
            </p>
          </div>
          <Hotel className="text-teal-700" size={24} />
        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-teal-600 transition-all"
            style={{
              width: allHotels.length
                ? `${(activeHotels.length / allHotels.length) * 100}%`
                : "0%",
            }}
          />
        </div>

        <div className="mt-3 flex flex-wrap justify-between gap-2 text-sm">
          <span className="flex items-center gap-2 text-slate-600">
            <CheckCircle2 size={16} className="text-teal-600" />
            {activeHotels.length} active hotels
          </span>
          <span className="flex items-center gap-2 text-slate-600">
            <XCircle size={16} className="text-slate-400" />
            {inactiveHotels} inactive hotels
          </span>
        </div>

        <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
          <Star size={20} className="text-amber-500" />
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Average hotel rating: {averageRating}
            </p>
            <p className="text-xs text-slate-500">
              Based on {ratedHotels.length} rated hotels
            </p>
          </div>
        </div>
      </section>

      {/* Recent bookings */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Recent Bookings
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Select a booking row to view its details.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock3 size={17} />
            Live browser data
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-white px-6 py-3 text-sm text-slate-600">
          {["All", "Pending", "Accepted", "Rejected", "Cancelled"].map(
            (filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setBookingFilter(filter)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  bookingFilter === filter
                    ? "bg-teal-700 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {filter}
              </button>
            ),
          )}
        </div>

        {filteredBookings.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <CalendarCheck size={36} className="mx-auto text-slate-300" />
            <h4 className="mt-3 font-semibold text-slate-800">
              No bookings yet
            </h4>
            <p className="mt-1 text-sm text-slate-500">
              New booking requests will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Booking ID</th>
                  <th className="px-6 py-4 font-semibold">Guest</th>
                  <th className="px-6 py-4 font-semibold">Hotel</th>
                  <th className="px-6 py-4 font-semibold">Check-in</th>
                  <th className="px-6 py-4 font-semibold">Amount</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">View</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((booking, index) => {
                  const bookingId = booking.bookingId || `booking-${index}`;
                  const status = booking.status || "Pending";

                  return (
                    <tr
                      key={bookingId}
                      onClick={() => {
                        setStatusMessage("");
                        setSelectedBooking(booking);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setStatusMessage("");
                          setSelectedBooking(booking);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`View booking ${bookingId}`}
                      className="cursor-pointer transition hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
                    >
                      <td className="px-6 py-4 font-semibold text-teal-700">
                        {booking.bookingId || "—"}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {getGuestName(booking, users)}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {getHotelName(booking)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                        {formatDate(booking.checkIn)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-800">
                        {money(booking.total)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                            statusStyles[status] ||
                            "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-teal-700">
                        <Eye size={18} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-slate-100 px-6 py-4 text-xs text-slate-500">
          Revenue is an estimate based on accepted bookings, not verified
          payments.
        </div>
      </section>

      {/* Dashboard note */}
      <div className="rounded-2xl border border-teal-100 bg-teal-50 p-5 sm:p-6">
        <h3 className="font-bold text-teal-950">Stayora booking overview</h3>
        <p className="mt-1 text-sm leading-6 text-teal-900">
          Review pending requests in Manage Bookings or open a recent booking to
          inspect its details and update its status.
        </p>
      </div>

      {/* Booking details modal */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedBooking(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-modal-title"
            onClick={(event) => event.stopPropagation()}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="sticky top-0 flex items-start justify-between border-b border-slate-100 bg-white p-5 sm:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
                  Booking details
                </p>
                <h3
                  id="booking-modal-title"
                  className="mt-1 break-all text-xl font-bold text-slate-900"
                >
                  {selectedBooking.bookingId || "Booking"}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Review the guest's reservation information.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                aria-label="Close booking details"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={21} />
              </button>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
              {bookingDetails.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                >
                  <p className="text-xs font-medium text-slate-500">
                    {item.label}
                  </p>
                  <p className="mt-1 break-words text-sm font-semibold text-slate-900">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {statusMessage && (
              <p
                role="status"
                className="mx-5 mb-4 rounded-lg bg-teal-50 px-4 py-3 text-sm text-teal-800 sm:mx-6"
              >
                {statusMessage}
              </p>
            )}

            {selectedBooking.status === "Pending" && (
              <div className="flex flex-col gap-3 px-5 pb-5 sm:flex-row sm:justify-end sm:px-6">
                <button
                  type="button"
                  onClick={() => handleBookingStatus("Rejected")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                >
                  <XCircle size={18} />
                  Reject booking
                </button>

                <button
                  type="button"
                  onClick={() => handleBookingStatus("Accepted")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800"
                >
                  <CheckCircle2 size={18} />
                  Accept booking
                </button>
              </div>
            )}

            <div className="flex justify-end border-t border-slate-100 p-5">
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                Close details
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
