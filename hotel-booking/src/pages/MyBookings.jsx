import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
  cancelBooking,
  getBookings,
  subscribeToBookingChanges,
} from "../utils/bookings";
import Navbar from "../components/Navbar";

const statusStyles = {
  Pending: "bg-amber-100 text-amber-800",
  Accepted: "bg-emerald-100 text-emerald-800",
  Rejected: "bg-red-100 text-red-800",
  Cancelled: "bg-gray-100 text-gray-700",
  Confirmed: "bg-emerald-100 text-emerald-800",
};

function MyBookings() {
  const [bookings, setBookings] = useState(() => getBookings());
  const { user } = useAuth();

  useEffect(() => {
    const refreshBookings = () => {
      setBookings(getBookings());
    };

    const unsubscribe = subscribeToBookingChanges(refreshBookings);
    refreshBookings();

    return unsubscribe;
  }, []);

  const myBookings = user?.email
    ? bookings.filter(
        (booking) =>
          booking.userEmail?.trim().toLowerCase() ===
          user.email.trim().toLowerCase(),
      )
    : [];

  function handleCancel(bookingId) {
    const shouldCancel = window.confirm(
      "Are you sure you want to cancel this demo booking?",
    );

    if (!shouldCancel) return;

    const updatedBookings = cancelBooking(bookingId);
    setBookings(updatedBookings);
  }

  const money = (amount) => Number(amount || 0).toLocaleString("en-NP");

  const formatDate = (date) => {
    if (!date) return "Not selected";

    const parsedDate = new Date(
      String(date).length === 10 ? `${date}T00:00:00` : date,
    );

    return Number.isNaN(parsedDate.getTime())
      ? "Not selected"
      : parsedDate.toLocaleDateString("en-NP", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">
              Stayora
            </p>

            <h1 className="mt-2 text-3xl font-extrabold text-gray-900">
              My Bookings
            </h1>

            <p className="mt-2 text-gray-500">
              View your hotel booking requests and their latest status.
            </p>
          </div>

          {myBookings.length === 0 ? (
            <section className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center shadow-sm">
              <div className="text-5xl">🏨</div>

              <h2 className="mt-4 text-xl font-bold text-gray-900">
                No bookings yet
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Your hotel bookings will appear here after you submit the
                booking form.
              </p>

              <Link
                to="/"
                className="mt-6 inline-block rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800"
              >
                Explore Hotels →
              </Link>
            </section>
          ) : (
            <div className="space-y-5">
              {myBookings.map((booking, index) => {
                const bookingId = booking.bookingId || `booking-${index}`;

                const hotel = booking.hotel || {};
                const hotelName = booking.hotelName || hotel.name || "Hotel";
                const hotelImage = hotel.image || hotel.imageUrl;
                const status = booking.status || "Pending";

                return (
                  <article
                    key={bookingId}
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row">
                      {hotelImage ? (
                        <img
                          src={hotelImage}
                          alt={hotelName}
                          className="h-52 w-full object-cover sm:h-auto sm:w-56"
                        />
                      ) : (
                        <div className="flex h-40 w-full items-center justify-center bg-emerald-50 text-5xl sm:h-auto sm:w-56">
                          🏨
                        </div>
                      )}

                      <div className="min-w-0 flex-1 p-5 sm:p-6">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h2 className="text-xl font-bold text-gray-900">
                              {hotelName}
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                              {hotel.location || "Hotel reservation"}
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              statusStyles[status] ||
                              "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {status}
                          </span>
                        </div>

                        {status === "Pending" && (
                          <p className="mt-3 text-sm text-amber-700">
                            Your request is waiting for admin review.
                          </p>
                        )}

                        {status === "Accepted" && (
                          <p className="mt-3 text-sm text-emerald-700">
                            Your booking request has been accepted.
                          </p>
                        )}

                        {status === "Rejected" && (
                          <p className="mt-3 text-sm text-red-700">
                            Your booking request was rejected.
                          </p>
                        )}

                        <div className="mt-4 rounded-xl bg-gray-50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Booking reference
                          </p>

                          <p className="mt-1 break-all font-bold text-gray-900">
                            {booking.bookingId || "Not available"}
                          </p>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">ROOM TYPE</p>
                            <p className="mt-1 text-sm font-semibold text-gray-900">
                              {booking.roomType || "Standard Room"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500">GUESTS</p>
                            <p className="mt-1 text-sm font-semibold text-gray-900">
                              {booking.guests ?? "—"} guests
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500">CHECK-IN</p>
                            <p className="mt-1 text-sm font-semibold text-gray-900">
                              {formatDate(booking.checkIn)}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500">CHECK-OUT</p>
                            <p className="mt-1 text-sm font-semibold text-gray-900">
                              {formatDate(booking.checkOut)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                          <div>
                            <p className="text-xs text-gray-500">
                              TOTAL ESTIMATED COST
                            </p>

                            <p className="mt-1 text-xl font-extrabold text-emerald-700">
                              NPR {money(booking.total)}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {booking.nights ?? "—"}{" "}
                              {booking.nights === 1 ? "night" : "nights"}
                            </p>
                          </div>

                          {status === "Pending" && (
                            <button
                              type="button"
                              onClick={() => handleCancel(booking.bookingId)}
                              className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-50"
                            >
                              Cancel Request
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <p className="mt-6 text-center text-xs text-gray-500">
            Demo bookings only. No real hotel reservation or payment is made.
          </p>
        </div>
      </main>
    </>
  );
}

export default MyBookings;
