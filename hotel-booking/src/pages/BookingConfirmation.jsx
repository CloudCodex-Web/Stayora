import { Link, useLocation } from "react-router-dom";
import {
  CheckCircle2,
  CalendarDays,
  MapPin,
  Users,
  BedDouble,
  ReceiptText,
  Clock,
  ArrowRight,
  Home,
} from "lucide-react";

function formatDate(date) {
  if (!date) return "Not selected";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-NP", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function money(amount) {
  return Number(amount || 0).toLocaleString("en-NP");
}

function formatCreatedAt(date) {
  if (!date) return null;

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return null;

  return parsedDate.toLocaleString("en-NP", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function BookingConfirmation() {
  const { state } = useLocation();

  if (!state?.hotel) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-5">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <ReceiptText size={28} className="text-gray-500" />
          </div>

          <h1 className="mt-4 text-xl font-bold text-gray-900">
            No booking details found
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            We couldn't find booking information. You can explore hotels and
            start a new booking.
          </p>

          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white transition hover:bg-emerald-800"
          >
            <Home size={18} />
            Explore Hotels
          </Link>
        </div>
      </main>
    );
  }

  const {
    hotel,
    checkIn,
    checkOut,
    guests,
    nights,
    total,
    roomType,
    roomCapacity,
    price,
    bookingId,
    id,
    status,
    createdAt,
  } = state;

  const bookingStatus = status || "Pending";
  const statusKey = String(bookingStatus).toLowerCase();

  const statusStyles = {
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    accepted: "bg-emerald-100 text-emerald-800 border-emerald-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
    cancelled: "bg-gray-100 text-gray-700 border-gray-200",
  };

  const statusMessages = {
    pending:
      "Your booking request is waiting for admin approval. Your reservation is not confirmed yet.",
    accepted: "Your booking request has been accepted by the admin.",
    rejected:
      "Your booking request was rejected. You can explore other hotels.",
    cancelled: "This booking request has been cancelled.",
  };

  const referenceNumber = bookingId || id || "Not available";
  const createdDate = formatCreatedAt(createdAt);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto max-w-3xl">
        {/* Confirmation Header */}
        <section className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 size={38} className="text-emerald-700" />
          </div>

          <h1 className="mt-5 text-2xl font-extrabold text-gray-900 sm:text-3xl">
            Booking Request Submitted!
          </h1>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-500">
            Thank you for choosing Stayora. Your booking request has been
            successfully submitted.
          </p>
        </section>

        {/* Booking Status */}
        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-500">Booking reference</p>

              <h2 className="mt-1 break-all text-xl font-extrabold text-gray-900">
                {referenceNumber}
              </h2>
            </div>

            <span
              className={`w-fit rounded-full border px-4 py-2 text-sm font-bold ${
                statusStyles[statusKey] ||
                "border-gray-200 bg-gray-100 text-gray-700"
              }`}
            >
              {bookingStatus}
            </span>
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-xl bg-amber-50 p-4">
            <Clock size={21} className="mt-0.5 shrink-0 text-amber-700" />

            <div>
              <p className="font-bold text-amber-900">Booking status update</p>

              <p className="mt-1 text-sm leading-6 text-amber-800">
                {statusMessages[statusKey] ||
                  "Please check My Bookings for your latest booking status."}
              </p>
            </div>
          </div>

          {createdDate && (
            <p className="mt-4 text-xs text-gray-400">
              Submitted on: {createdDate}
            </p>
          )}
        </section>

        {/* Hotel Information */}
        <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="p-5 sm:p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-900">
              Your selected hotel
            </h2>

            <div className="flex flex-col gap-4 sm:flex-row">
              {hotel.image ? (
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="h-48 w-full rounded-xl object-cover sm:h-32 sm:w-40"
                />
              ) : (
                <div className="flex h-32 w-full items-center justify-center rounded-xl bg-emerald-50 sm:w-40">
                  <BedDouble size={36} className="text-emerald-700" />
                </div>
              )}

              <div className="flex-1">
                <span className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                  {hotel.category || "Hotel"}
                </span>

                <h3 className="mt-1 text-xl font-bold text-gray-900">
                  {hotel.name}
                </h3>

                <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                  <MapPin size={16} className="shrink-0" />
                  {hotel.location || "Location unavailable"}
                </p>

                <p className="mt-3 text-sm font-semibold text-emerald-700">
                  {roomType || "Standard Room"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stay Details */}
        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-gray-900">Stay details</h2>

          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-emerald-50 p-3">
                <CalendarDays size={21} className="text-emerald-700" />
              </div>

              <div>
                <p className="text-xs text-gray-500">CHECK-IN</p>

                <p className="mt-1 font-bold text-gray-900">
                  {formatDate(checkIn)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-emerald-50 p-3">
                <CalendarDays size={21} className="text-emerald-700" />
              </div>

              <div>
                <p className="text-xs text-gray-500">CHECK-OUT</p>

                <p className="mt-1 font-bold text-gray-900">
                  {formatDate(checkOut)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-emerald-50 p-3">
                <BedDouble size={21} className="text-emerald-700" />
              </div>

              <div>
                <p className="text-xs text-gray-500">ROOM TYPE</p>

                <p className="mt-1 font-bold text-gray-900">
                  {roomType || "Standard Room"}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Capacity: up to {roomCapacity ?? 2} guests
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-emerald-50 p-3">
                <Users size={21} className="text-emerald-700" />
              </div>

              <div>
                <p className="text-xs text-gray-500">GUESTS</p>

                <p className="mt-1 font-bold text-gray-900">
                  {guests} {Number(guests) === 1 ? "Guest" : "Guests"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-gray-100 pt-5">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs text-gray-500">DURATION</p>

              <p className="mt-1 text-lg font-bold text-gray-900">
                {nights} {Number(nights) === 1 ? "Night" : "Nights"}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs text-gray-500">PRICE PER NIGHT</p>

              <p className="mt-1 text-lg font-bold text-gray-900">
                NPR {money(price ?? hotel.price)}
              </p>
            </div>
          </div>
        </section>

        {/* Payment Summary */}
        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2">
            <ReceiptText size={21} className="text-emerald-700" />

            <h2 className="text-lg font-bold text-gray-900">Price summary</h2>
          </div>

          <div className="mt-5 flex justify-between gap-3 text-sm">
            <span className="text-gray-500">Room price</span>

            <span className="font-semibold text-gray-900">
              NPR {money(price ?? hotel.price)} × {nights} nights
            </span>
          </div>

          <div className="mt-4 flex justify-between gap-3 border-t border-gray-100 pt-4">
            <span className="font-bold text-gray-900">Estimated total</span>

            <span className="text-2xl font-extrabold text-emerald-700">
              NPR {money(total)}
            </span>
          </div>

          <p className="mt-4 rounded-xl bg-gray-50 p-3 text-xs leading-5 text-gray-500">
            No payment has been collected. This is a demo booking summary; room
            availability, final pricing and payment have not been verified.
          </p>
        </section>

        {/* Navigation Buttons */}
        <section className="mt-8 space-y-3">
          <Link
            to="/my-bookings"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-4 font-bold text-white transition hover:bg-emerald-800"
          >
            View My Bookings
            <ArrowRight size={19} />
          </Link>

          <Link
            to="/"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-4 font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <Home size={19} />
            Explore More Hotels
          </Link>
        </section>

        <p className="mt-6 text-center text-xs text-gray-400">
          Thank you for choosing Stayora!
        </p>
      </div>
    </main>
  );
}

export default BookingConfirmation;
