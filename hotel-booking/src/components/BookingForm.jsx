import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveBooking } from "../utils/bookings";
import { useAuth } from "../context/AuthContext";

const roomTypes = [
  {
    id: "standard",
    name: "Standard Room",
    capacity: 2,
    multiplier: 1,
    description: "A comfortable room for solo travelers or couples.",
  },
  {
    id: "deluxe",
    name: "Deluxe Room",
    capacity: 3,
    multiplier: 1.35,
    description: "Extra space and comfort for a relaxing stay.",
  },
  {
    id: "family",
    name: "Family Room",
    capacity: 6,
    multiplier: 1.7,
    description: "A spacious option for families and groups.",
  },
];

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getNextDateString(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + 1);
  return getLocalDateString(date);
}

function calculateNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;

  const start = new Date(`${checkIn}T00:00:00`);
  const end = new Date(`${checkOut}T00:00:00`);

  return Math.round((end - start) / (1000 * 60 * 60 * 24));
}

function formatDate(dateString) {
  if (!dateString) return "";

  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-NP", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function BookingForm({ hotel }) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const [roomId, setRoomId] = useState("standard");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  const today = getLocalDateString();

  const selectedRoom =
    roomTypes.find((room) => room.id === roomId) || roomTypes[0];

  const basePrice = Number(hotel?.price) || 0;
  const price = Math.round(basePrice * selectedRoom.multiplier);

  const nights = calculateNights(checkIn, checkOut);
  const hasValidDates = Boolean(checkIn && checkOut && nights > 0);

  const total = hasValidDates ? nights * price : 0;

  const minimumCheckOut = getNextDateString(
    checkIn && checkIn >= today ? checkIn : today,
  );

  function handleCheckInChange(value) {
    setCheckIn(value);
    setMessage("");

    if (checkOut && value >= checkOut) {
      setCheckOut("");
    }
  }

  function handleBooking(event) {
    event.preventDefault();
    setMessage("");

    if (!hotel?.id && hotel?.id !== 0) {
      setMessage("Hotel information is unavailable. Please try again.");
      return;
    }

    if (!hotel?.name) {
      setMessage("Hotel information is unavailable. Please try again.");
      return;
    }

    if (!user?.email) {
      navigate("/login");
      return;
    }

    if (!checkIn || !checkOut) {
      setMessage("Please select both check-in and check-out dates.");
      return;
    }

    if (checkIn < today) {
      setMessage("Check-in cannot be in the past.");
      return;
    }

    if (nights <= 0) {
      setMessage("Check-out must be at least one day after check-in.");
      return;
    }

    if (Number(guests) < 1 || Number(guests) > selectedRoom.capacity) {
      setMessage(
        `This room accommodates 1 to ${selectedRoom.capacity} guests.`,
      );
      return;
    }

    if (
      !Number.isFinite(price) ||
      price <= 0 ||
      !Number.isFinite(total) ||
      total <= 0
    ) {
      setMessage("The booking price is invalid. Please try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const booking = saveBooking({
        hotel,
        hotelId: hotel.id,
        hotelName: hotel.name,
        userName: user.name,
        userEmail: user.email.trim().toLowerCase(),
        checkIn,
        checkOut,
        guests: Number(guests),
        nights,
        total,
        price,
        roomType: selectedRoom.name,
        roomCapacity: selectedRoom.capacity,
        status: "Pending",
        createdAt: new Date().toISOString(),
      });

      if (!booking) {
        throw new Error("The booking could not be saved.");
      }

      navigate("/booking-confirmation", {
        state: {
          ...booking,
          status: booking.status || "Pending",
        },
      });
    } catch (error) {
      console.error("Booking submission failed:", error);
      setMessage("We couldn't save your booking. Please try again.");
      setIsSubmitting(false);
    }
  }

  function handleRoomChange(event) {
    const nextRoom =
      roomTypes.find((room) => room.id === event.target.value) || roomTypes[0];

    setRoomId(nextRoom.id);

    if (Number(guests) > nextRoom.capacity) {
      setGuests(String(nextRoom.capacity));
    }

    setMessage("");
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
      {/* Price */}
      <div>
        <p className="text-sm font-medium text-gray-500">Starting from</p>

        <p className="mt-1 text-3xl font-extrabold text-gray-900">
          NPR {basePrice.toLocaleString("en-NP")}
          <span className="text-sm font-normal text-gray-500"> / night</span>
        </p>
      </div>

      <form onSubmit={handleBooking} className="mt-6 space-y-5">
        {/* Room selection */}
        <div>
          <label
            htmlFor="roomType"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Choose your room
          </label>

          <select
            id="roomType"
            value={roomId}
            onChange={handleRoomChange}
            className="w-full rounded-xl border border-gray-300 bg-white p-3 outline-none focus:border-emerald-600"
          >
            {roomTypes.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name} — up to {room.capacity} guests
              </option>
            ))}
          </select>

          <p className="mt-2 text-sm text-gray-500">
            {selectedRoom.description}
          </p>

          <p className="mt-2 font-bold text-emerald-700">
            NPR {price.toLocaleString("en-NP")} / night
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Demo pricing. Actual room availability is not verified.
          </p>
        </div>

        {/* Check-in */}
        <div>
          <label
            htmlFor="checkIn"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Check-in date
          </label>

          <input
            id="checkIn"
            type="date"
            min={today}
            value={checkIn}
            onChange={(event) => handleCheckInChange(event.target.value)}
            required
            className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-emerald-600"
          />
        </div>

        {/* Check-out */}
        <div>
          <label
            htmlFor="checkOut"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Check-out date
          </label>

          <input
            id="checkOut"
            type="date"
            min={minimumCheckOut}
            value={checkOut}
            onChange={(event) => {
              setCheckOut(event.target.value);
              setMessage("");
            }}
            required
            className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-emerald-600"
          />

          <p className="mt-1 text-xs text-gray-500">
            Check-out must be at least one day after check-in.
          </p>
        </div>

        {/* Guests */}
        <div>
          <label
            htmlFor="guests"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Number of guests
          </label>

          <select
            id="guests"
            value={guests}
            onChange={(event) => {
              setGuests(event.target.value);
              setMessage("");
            }}
            className="w-full rounded-xl border border-gray-300 bg-white p-3 outline-none focus:border-emerald-600"
          >
            {Array.from(
              { length: selectedRoom.capacity },
              (_, index) => index + 1,
            ).map((count) => (
              <option key={count} value={String(count)}>
                {count} {count === 1 ? "Guest" : "Guests"}
              </option>
            ))}
          </select>

          <p className="mt-1 text-xs text-gray-500">
            Maximum capacity: {selectedRoom.capacity} guests
          </p>
        </div>

        {/* Booking summary */}
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-3 font-bold text-gray-900">Your booking summary</h3>

          {hasValidDates ? (
            <>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Check-in</span>
                  <span className="font-semibold text-gray-900">
                    {formatDate(checkIn)}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Check-out</span>
                  <span className="font-semibold text-gray-900">
                    {formatDate(checkOut)}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Room</span>
                  <span className="font-semibold text-gray-900">
                    {selectedRoom.name}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Guests</span>
                  <span className="font-semibold text-gray-900">
                    {guests} {Number(guests) === 1 ? "Guest" : "Guests"}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-semibold text-gray-900">
                    {nights} {nights === 1 ? "Night" : "Nights"}
                  </span>
                </div>
              </div>

              <div className="mt-4 border-t border-gray-200 pt-4">
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-gray-500">
                    NPR {price.toLocaleString("en-NP")} × {nights} nights
                  </span>

                  <span className="font-semibold text-gray-900">
                    NPR {total.toLocaleString("en-NP")}
                  </span>
                </div>

                <div className="mt-3 flex justify-between gap-3">
                  <span className="font-bold text-gray-900">Total amount</span>

                  <span className="text-xl font-extrabold text-emerald-700">
                    NPR {total.toLocaleString("en-NP")}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm leading-6 text-gray-500">
              Select your check-in and check-out dates to see your booking
              details and total price.
            </p>
          )}
        </div>

        {/* Admin approval */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="font-semibold text-amber-900">
            Admin approval required
          </p>

          <p className="mt-1 text-sm leading-6 text-amber-800">
            Your booking request will remain pending until the admin accepts or
            rejects it. Submitting this request does not guarantee room
            availability.
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-emerald-700 px-5 py-3.5 font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Submitting..." : "Submit Booking Request"}
        </button>

        {message && (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700"
          >
            {message}
          </p>
        )}
      </form>

      <p className="mt-4 text-center text-xs text-gray-500">
        No payment required for this demo.
      </p>
    </div>
  );
}

export default BookingForm;
