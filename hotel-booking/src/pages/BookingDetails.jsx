import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Users,
  BedDouble,
  Clock,
  ReceiptText,
  Hotel,
  XCircle,
  CheckCircle2,
} from "lucide-react";

import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import {
  getBookingById,
  subscribeToBookingChanges,
  cancelBooking,
} from "../utils/bookings";

function formatDate(date) {
  if (!date) return "Not available";

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) return "Not available";

  return parsed.toLocaleDateString("en-NP", {
    day: "numeric",
    month: "short",
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
      return "bg-gray-100 text-gray-700";

    default:
      return "bg-amber-100 text-amber-800";
  }
}

function BookingDetails() {
  const { bookingId } = useParams();
  const { user } = useAuth();

  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const email = user?.email?.trim().toLowerCase();

    function loadBooking() {
      if (!email || !bookingId) {
        setBooking(null);
        setIsLoading(false);
        return;
      }

      const foundBooking = getBookingById(bookingId);

      // Only allow the booking owner to view this booking.
      if (foundBooking?.userEmail?.trim().toLowerCase() === email) {
        setBooking(foundBooking);
      } else {
        setBooking(null);
      }

      setIsLoading(false);
    }

    loadBooking();

    const unsubscribe = subscribeToBookingChanges(loadBooking);

    return unsubscribe;
  }, [bookingId, user?.email]);

  function handleCancel() {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?",
    );

    if (!confirmed) return;

    try {
      cancelBooking(booking.bookingId);
      setMessage("Your booking has been cancelled.");
    } catch (error) {
      console.error("Cancellation failed:", error);
      setMessage("Could not cancel your booking. Please try again.");
    }
  }

  if (!user) {
    return (
      <>
        <Navbar />

        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
          <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
            <Hotel size={48} className="mx-auto text-emerald-700" />

            <h1 className="mt-4 text-xl font-bold text-gray-900">
              Login required
            </h1>

            <p className="mt-2 text-gray-500">
              Please log in to view your booking details.
            </p>

            <Link
              to="/login"
              className="mt-6 inline-block rounded-xl bg-emerald-700 px-6 py-3 font-semibold text-white"
            >
              Login
            </Link>
          </div>
        </main>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-screen items-center justify-center bg-gray-50">
          <p className="font-medium text-gray-500">
            Loading booking details...
          </p>
        </main>
      </>
    );
  }

  if (!booking) {
    return (
      <>
        <Navbar />

        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
          <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
            <Hotel size={48} className="mx-auto text-gray-300" />

            <h1 className="mt-4 text-xl font-bold text-gray-900">
              Booking not found
            </h1>

            <p className="mt-2 text-gray-500">
              This booking may not exist or may not belong to your account.
            </p>

            <Link
              to="/my-bookings"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 font-semibold text-white"
            >
              <ArrowLeft size={18} />
              Back to My Bookings
            </Link>
          </div>
        </main>
      </>
    );
  }

  const hotel = booking.hotel || {};
  const hotelName = booking.hotelName || hotel.name || "Hotel";

  const imageCandidate =
    hotel.image || hotel.imageUrl || hotel.coverImage || hotel.images?.[0];

  const hotelImage =
    typeof imageCandidate === "string"
      ? imageCandidate
      : imageCandidate?.url || imageCandidate?.src || "";

  const status = normalizeStatus(booking.status);

  const canCancel = status === "Pending" || status === "Accepted";

  const hotelId = booking.hotelId || hotel.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Back button */}
        <Link
          to="/my-bookings"
          className="mb-6 inline-flex items-center gap-2 font-semibold text-emerald-700 hover:text-emerald-900"
        >
          <ArrowLeft size={18} />
          Back to My Bookings
        </Link>

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
            Your Stayora account
          </p>

          <h1 className="mt-2 text-3xl font-extrabold text-gray-900">
            Booking Details
          </h1>

          <p className="mt-2 text-gray-500">
            View your complete reservation information.
          </p>
        </div>

        {/* Reference and status */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-500">Booking reference</p>

              <h2 className="mt-1 break-all text-xl font-extrabold text-gray-900">
                {booking.bookingId}
              </h2>
            </div>

            <span
              className={`w-fit rounded-full px-4 py-2 text-sm font-bold ${getStatusStyle(status)}`}
            >
              {status}
            </span>
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-xl bg-emerald-50 p-4">
            <CheckCircle2
              size={21}
              className="mt-0.5 shrink-0 text-emerald-700"
            />

            <div>
              <p className="font-bold text-emerald-900">Booking information</p>

              <p className="mt-1 text-sm leading-6 text-emerald-800">
                {status === "Pending"
                  ? "Your booking request is waiting for admin approval."
                  : status === "Accepted"
                    ? "Your booking request has been accepted by the admin."
                    : status === "Rejected"
                      ? "Your booking request was rejected."
                      : status === "Cancelled"
                        ? "This booking has been cancelled."
                        : "Check My Bookings for the latest booking status."}
              </p>
            </div>
          </div>

          {booking.createdAt && (
            <p className="mt-4 text-xs text-gray-400">
              Submitted on:{" "}
              {new Date(booking.createdAt).toLocaleString("en-NP")}
            </p>
          )}
        </section>

        {/* Hotel information */}
        <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="p-5 sm:p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-900">
              Hotel information
            </h2>

            <div className="flex flex-col gap-4 sm:flex-row">
              {hotelImage ? (
                <img
                  src={hotelImage}
                  alt={hotelName}
                  className="h-48 w-full rounded-xl object-cover sm:h-36 sm:w-48"
                />
              ) : (
                <div className="flex h-36 w-full items-center justify-center rounded-xl bg-emerald-50 sm:w-48">
                  <Hotel size={40} className="text-emerald-700" />
                </div>
              )}

              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                  {hotel.category || "Hotel"}
                </p>

                <h3 className="mt-1 text-xl font-bold text-gray-900">
                  {hotelName}
                </h3>

                <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                  <MapPin size={16} />
                  {hotel.location || "Location unavailable"}
                </p>

                {hotelId && (
                  <Link
                    to={`/hotel/${hotelId}`}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:underline"
                  >
                    View Hotel
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Stay details */}
        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-gray-900">Stay details</h2>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <CalendarDays className="text-emerald-700" size={22} />

              <div>
                <p className="text-xs text-gray-500">CHECK-IN</p>
                <p className="mt-1 font-bold text-gray-900">
                  {formatDate(booking.checkIn)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CalendarDays className="text-emerald-700" size={22} />

              <div>
                <p className="text-xs text-gray-500">CHECK-OUT</p>
                <p className="mt-1 font-bold text-gray-900">
                  {formatDate(booking.checkOut)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <BedDouble className="text-emerald-700" size={22} />

              <div>
                <p className="text-xs text-gray-500">ROOM TYPE</p>
                <p className="mt-1 font-bold text-gray-900">
                  {booking.roomType || "Standard Room"}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Capacity: {booking.roomCapacity || 2} guests
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="text-emerald-700" size={22} />

              <div>
                <p className="text-xs text-gray-500">GUESTS</p>
                <p className="mt-1 font-bold text-gray-900">
                  {booking.guests}{" "}
                  {Number(booking.guests) === 1 ? "Guest" : "Guests"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="text-emerald-700" size={22} />

              <div>
                <p className="text-xs text-gray-500">DURATION</p>
                <p className="mt-1 font-bold text-gray-900">
                  {booking.nights}{" "}
                  {Number(booking.nights) === 1 ? "Night" : "Nights"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Price summary */}
        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2">
            <ReceiptText size={21} className="text-emerald-700" />

            <h2 className="text-lg font-bold text-gray-900">Price summary</h2>
          </div>

          <div className="mt-5 flex justify-between gap-3 text-sm">
            <span className="text-gray-500">
              Room price × {booking.nights} nights
            </span>

            <span className="font-semibold text-gray-900">
              {money(booking.price)}
            </span>
          </div>

          <div className="mt-4 flex justify-between gap-3 border-t border-gray-100 pt-4">
            <span className="font-bold text-gray-900">
              Total estimated cost
            </span>

            <span className="text-2xl font-extrabold text-emerald-700">
              {money(booking.total)}
            </span>
          </div>

          <p className="mt-4 rounded-xl bg-gray-50 p-3 text-xs leading-5 text-gray-500">
            Demo booking: no real payment has been collected. Actual hotel
            availability and final pricing are not verified.
          </p>
        </section>

        {/* Actions */}
        <section className="mt-6 flex flex-col gap-3 sm:flex-row">
          {canCancel && (
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 font-semibold text-red-600 transition hover:bg-red-50"
            >
              <XCircle size={18} />
              Cancel Booking
            </button>
          )}

          <Link
            to="/my-bookings"
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white transition hover:bg-emerald-800"
          >
            Back to My Bookings
          </Link>
        </section>

        {message && (
          <p
            role="status"
            className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-800"
          >
            {message}
          </p>
        )}
      </main>
    </div>
  );
}

export default BookingDetails;
