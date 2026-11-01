import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  Users,
  BedDouble,
  Clock,
  XCircle,
  Hotel,
  Search,
  ArrowUpRight,
  ClipboardList,
} from "lucide-react";

import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import {
  getBookings,
  subscribeToBookingChanges,
  cancelBooking,
} from "../utils/bookings";

function formatDate(date) {
  if (!date) return "Not available";

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) return "Not available";

  return parsed.toLocaleDateString("en-NP", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function money(amount) {
  return `NPR ${Number(amount || 0).toLocaleString("en-NP")}`;
}

function normalizeStatus(status) {
  const value = String(status || "Pending").toLowerCase();

  if (value === "confirmed") return "Accepted";

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getStatusStyle(status) {
  switch (normalizeStatus(status).toLowerCase()) {
    case "accepted":
      return "bg-emerald-100 text-emerald-800";

    case "rejected":
      return "bg-red-100 text-red-800";

    case "cancelled":
      return "bg-gray-100 text-gray-600";

    case "pending":
    default:
      return "bg-amber-100 text-amber-800";
  }
}

function MyBookings() {
  const { user } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const email = user?.email?.trim().toLowerCase();

    if (!email) {
      setBookings([]);
      return;
    }

    const loadBookings = () => {
      const allBookings = getBookings();

      const userBookings = allBookings.filter(
        (booking) => booking.userEmail?.trim().toLowerCase() === email,
      );

      setBookings(userBookings);
    };

    loadBookings();

    const unsubscribe = subscribeToBookingChanges(loadBookings);

    return unsubscribe;
  }, [user?.email]);

  const sortedBookings = useMemo(() => {
    return [...bookings].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime() || 0;
      const dateB = new Date(b.createdAt || 0).getTime() || 0;

      return dateB - dateA;
    });
  }, [bookings]);

  function matchesFilter(booking, filter) {
    if (filter === "All") return true;

    const status = normalizeStatus(booking.status).toLowerCase();

    return status === filter.toLowerCase();
  }

  const filteredBookings = sortedBookings.filter((booking) => {
    const matchesStatus = matchesFilter(booking, activeFilter);

    const search = searchTerm.trim().toLowerCase();

    const hotelName = (
      booking.hotelName ||
      booking.hotel?.name ||
      ""
    ).toLowerCase();

    const bookingId = String(
      booking.bookingId || booking.id || "",
    ).toLowerCase();

    const location = String(booking.hotel?.location || "").toLowerCase();

    const matchesSearch =
      !search ||
      hotelName.includes(search) ||
      bookingId.includes(search) ||
      location.includes(search);

    return matchesStatus && matchesSearch;
  });

  const filters = ["All", "Pending", "Accepted", "Rejected", "Cancelled"];

  function countBookings(filter) {
    if (filter === "All") return bookings.length;

    return bookings.filter((booking) => matchesFilter(booking, filter)).length;
  }

  const statistics = [
    {
      label: "Total bookings",
      value: bookings.length,
      color: "text-gray-900",
    },
    {
      label: "Pending",
      value: countBookings("Pending"),
      color: "text-amber-600",
    },
    {
      label: "Accepted",
      value: countBookings("Accepted"),
      color: "text-emerald-700",
    },
    {
      label: "Cancelled",
      value: countBookings("Cancelled"),
      color: "text-gray-500",
    },
  ];

  function handleCancel(bookingId) {
    if (!bookingId) {
      setMessage("Booking reference is unavailable.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?",
    );

    if (!confirmed) return;

    try {
      cancelBooking(bookingId);

      const email = user?.email?.trim().toLowerCase();

      const updatedBookings = getBookings().filter(
        (booking) => booking.userEmail?.trim().toLowerCase() === email,
      );

      setBookings(updatedBookings);
      setMessage("Your booking cancellation request was processed.");
    } catch (error) {
      console.error("Booking cancellation failed:", error);
      setMessage("Could not cancel your booking. Please try again.");
    }
  }

  if (!user) {
    return (
      <>
        <Navbar />

        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
          <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
            <Hotel className="mx-auto mb-4 h-14 w-14 text-emerald-700" />

            <h1 className="text-2xl font-bold text-gray-900">
              Login to view your bookings
            </h1>

            <p className="mt-2 text-gray-500">
              Your booking history will appear here after you sign in.
            </p>

            <Link
              to="/login"
              className="mt-6 inline-block rounded-xl bg-emerald-700 px-6 py-3 font-semibold text-white transition hover:bg-emerald-800"
            >
              Login
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
              Your Stayora account
            </p>

            <h1 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              My Bookings
            </h1>

            <p className="mt-2 text-gray-500">
              Manage your reservations and track booking requests.
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-emerald-300 hover:text-emerald-700"
          >
            Explore Hotels
            <ArrowUpRight size={17} />
          </Link>
        </div>

        {/* Statistics */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statistics.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-gray-500">{item.label}</p>

              <p className={`mt-2 text-3xl font-extrabold ${item.color}`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Search and filters */}
        <section className="mb-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by hotel name, location or booking ID..."
              className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-600"
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeFilter === filter
                    ? "bg-emerald-700 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-800"
                }`}
              >
                {filter}

                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    activeFilter === filter
                      ? "bg-white/20 text-white"
                      : "bg-white text-gray-600"
                  }`}
                >
                  {countBookings(filter)}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Feedback */}
        {message && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800"
          >
            {message}
          </div>
        )}

        {/* Results heading */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">
            {activeFilter === "All"
              ? "All bookings"
              : `${activeFilter} bookings`}
          </h2>

          <span className="text-sm text-gray-500">
            {filteredBookings.length} result(s)
          </span>
        </div>

        {/* Booking cards */}
        {filteredBookings.length > 0 ? (
          <div className="space-y-5">
            {filteredBookings.map((booking) => {
              const hotel = booking.hotel || {};

              const imageCandidate =
                hotel.image ||
                hotel.imageUrl ||
                hotel.coverImage ||
                hotel.images?.[0];

              const image =
                typeof imageCandidate === "string"
                  ? imageCandidate
                  : imageCandidate?.url || imageCandidate?.src || "";

              const hotelName = booking.hotelName || hotel.name || "Hotel";

              const bookingId = booking.bookingId || booking.id;

              const status = normalizeStatus(booking.status);

              const canCancel = status === "Pending" || status === "Accepted";

              return (
                <article
                  key={bookingId}
                  className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="grid md:grid-cols-[250px_1fr]">
                    {/* Hotel image */}
                    <div className="h-52 bg-gray-100 md:h-full md:min-h-[260px]">
                      {image ? (
                        <img
                          src={image}
                          alt={hotelName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Hotel className="h-14 w-14 text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Booking details */}
                    <div className="p-5 sm:p-6">
                      {/* Hotel title and status */}
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-xl font-bold text-gray-900">
                            {hotelName}
                          </h3>

                          <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                            <MapPin size={15} />
                            {hotel.location || "Location unavailable"}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-bold ${getStatusStyle(status)}`}
                        >
                          {status}
                        </span>
                      </div>

                      {/* Stay details */}
                      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3">
                        <div>
                          <p className="text-xs text-gray-400">Check-in</p>

                          <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <CalendarDays
                              size={16}
                              className="shrink-0 text-emerald-700"
                            />
                            {formatDate(booking.checkIn)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400">Check-out</p>

                          <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <CalendarDays
                              size={16}
                              className="shrink-0 text-emerald-700"
                            />
                            {formatDate(booking.checkOut)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400">Guests</p>

                          <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Users
                              size={16}
                              className="shrink-0 text-emerald-700"
                            />
                            {booking.guests}{" "}
                            {Number(booking.guests) === 1 ? "Guest" : "Guests"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400">Room</p>

                          <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <BedDouble
                              size={16}
                              className="shrink-0 text-emerald-700"
                            />
                            {booking.roomType || "Standard Room"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400">Duration</p>

                          <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Clock
                              size={16}
                              className="shrink-0 text-emerald-700"
                            />
                            {booking.nights}{" "}
                            {Number(booking.nights) === 1 ? "Night" : "Nights"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400">Total amount</p>

                          <p className="mt-1 text-sm font-extrabold text-emerald-700">
                            {money(booking.total)}
                          </p>
                        </div>
                      </div>

                      {/* Booking footer */}
                      <div className="mt-6 flex flex-col gap-4 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs text-gray-400">
                            Booking reference
                          </p>

                          <p className="mt-1 break-all text-sm font-bold text-gray-700">
                            {bookingId || "Not available"}
                          </p>
                        </div>
                        <Link
                          to={`/my-bookings/${bookingId}`}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                        >
                          <ClipboardList size={16} />
                          Booking Details
                        </Link>
                        <div className="flex flex-wrap gap-2">
                          {booking.hotelId && (
                            <Link
                              to={`/hotel/${booking.hotelId}`}
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
                            >
                              View Hotel
                              <ArrowUpRight size={16} />
                            </Link>
                          )}

                          {canCancel && (
                            <button
                              type="button"
                              onClick={() => handleCancel(booking.bookingId)}
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                            >
                              <XCircle size={16} />
                              Cancel Booking
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* Empty state */
          <div className="rounded-2xl border border-gray-100 bg-white px-5 py-16 text-center shadow-sm">
            <ClipboardList className="mx-auto h-14 w-14 text-gray-300" />

            <h2 className="mt-4 text-xl font-bold text-gray-900">
              {searchTerm || activeFilter !== "All"
                ? "No matching bookings"
                : "No bookings yet"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-gray-500">
              {searchTerm
                ? "Try another hotel name, location or booking reference."
                : activeFilter !== "All"
                  ? `You don't have any ${activeFilter.toLowerCase()} bookings.`
                  : "Your hotel booking history will appear here after you make your first booking."}
            </p>

            {searchTerm || activeFilter !== "All" ? (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setActiveFilter("All");
                }}
                className="mt-6 rounded-xl border border-gray-200 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Clear filters
              </button>
            ) : (
              <Link
                to="/"
                className="mt-6 inline-block rounded-xl bg-emerald-700 px-6 py-3 font-semibold text-white transition hover:bg-emerald-800"
              >
                Explore Hotels
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyBookings;
``;
