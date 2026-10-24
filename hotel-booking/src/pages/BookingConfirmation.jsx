
import { Link, useLocation } from "react-router-dom";

function BookingConfirmation() {
  const { state } = useLocation();

  if (!state?.hotel) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-5">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900">
            No booking details found
          </h1>
          <Link
            to="/"
            className="mt-4 inline-block text-sm font-semibold text-emerald-700 hover:underline"
          >
            ← Explore hotels
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
  } = state;

  const formatDate = (date) =>
    date
      ? new Date(`${date}T00:00:00`).toLocaleDateString("en-NP", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Not selected";

  const money = (amount) =>
    Number(amount || 0).toLocaleString("en-IN");

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <section className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-700">
            ✓
          </div>

          <h1 className="mt-3 text-xl font-bold text-gray-900">
            Booking summary ready!
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Your Stayora demo booking details
          </p>
        </div>

        <div className="mt-5 flex gap-3 border-b border-gray-100 pb-4">
          <img
            src={hotel.image}
            alt={hotel.name}
            className="h-24 w-28 shrink-0 rounded-xl object-cover"
          />

          <div className="min-w-0 self-center">
            <h2 className="font-bold text-gray-900">{hotel.name}</h2>
            <p className="mt-1 text-sm text-gray-500">{hotel.location}</p>
            <p className="mt-1 text-xs text-emerald-700">
              {hotel.category || "Hotel"}
            </p>
          </div>
        </div>

        <div className="border-b border-gray-100 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Selected room
          </p>

          <div className="mt-2 flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-gray-900">
                {roomType || "Standard Room"}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Capacity: up to {roomCapacity || 2} guests
              </p>
            </div>

            <p className="shrink-0 text-sm font-bold text-emerald-700">
              NPR {money(price ?? hotel.price)} / night
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-b border-gray-100 py-4">
          <div>
            <p className="text-xs text-gray-500">CHECK-IN</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {formatDate(checkIn)}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">CHECK-OUT</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {formatDate(checkOut)}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">DURATION</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {nights} {nights === 1 ? "night" : "nights"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">GUESTS</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {guests} {Number(guests) === 1 ? "guest" : "guests"}
            </p>
          </div>
        </div>

        <div className="py-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-gray-600">Room price</p>
            <p className="text-sm font-semibold text-gray-900">
              NPR {money(price ?? hotel.price)} × {nights} nights
            </p>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="font-semibold text-gray-900">
              Total estimated cost
            </p>
            <p className="text-xl font-extrabold text-emerald-700">
              NPR {money(total)}
            </p>
          </div>
        </div>

        <p className="mb-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
          Demo only — no real reservation or payment has been made. Room
          prices and availability are not verified.
        </p>

        <Link
          to="/"
          className="block rounded-xl bg-emerald-700 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-emerald-800"
        >
          Explore More Hotels →
        </Link>
      </section>
    </main>
  );
}

export default BookingConfirmation;
