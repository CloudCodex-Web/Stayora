import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cancelBooking, getBookings } from "../utils/bookings";
import Navbar from "../components/Navbar";

function MyBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    setBookings(getBookings());
  }, []);

  function handleCancel(bookingId) {
    const shouldCancel = window.confirm(
      "Are you sure you want to cancel this demo booking?",
    );

    if (!shouldCancel) return;

    const updatedBookings = cancelBooking(bookingId);
    setBookings(updatedBookings);
  }

  const money = (amount) => Number(amount || 0).toLocaleString("en-IN");

  const formatDate = (date) =>
    date
      ? new Date(`${date}T00:00:00`).toLocaleDateString("en-NP", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Not selected";

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
              View and manage your demo hotel bookings.
            </p>
          </div>

          {bookings.length === 0 ? (
            <section className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center shadow-sm">
              <div className="text-5xl">🏨</div>

              <h2 className="mt-4 text-xl font-bold text-gray-900">
                No bookings yet
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Your hotel bookings will appear here after you complete the
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
              {bookings.map((booking) => (
                <article
                  key={booking.bookingId}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row">
                    <img
                      src={booking.hotel?.image}
                      alt={booking.hotel?.name || "Hotel"}
                      className="h-52 w-full object-cover sm:h-auto sm:w-56"
                    />

                    <div className="flex-1 p-5 sm:p-6">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">
                            {booking.hotel?.name || "Hotel"}
                          </h2>

                          <p className="mt-1 text-sm text-gray-500">
                            {booking.hotel?.location}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            booking.status === "Cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {booking.status || "Confirmed"}
                        </span>
                      </div>

                      <div className="mt-4 rounded-xl bg-gray-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Booking reference
                        </p>

                        <p className="mt-1 break-all font-bold text-gray-900">
                          {booking.bookingId}
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
                            {booking.guests} guests
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
                            {booking.nights}{" "}
                            {booking.nights === 1 ? "night" : "nights"}
                          </p>
                        </div>

                        {booking.status !== "Cancelled" && (
                          <button
                            type="button"
                            onClick={() => handleCancel(booking.bookingId)}
                            className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-50"
                          >
                            Cancel Booking
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
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
