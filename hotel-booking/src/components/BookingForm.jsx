import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveBooking } from "../utils/bookings";

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

function BookingForm({ hotel }) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const [roomId, setRoomId] = useState("standard");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const today = new Date().toLocaleDateString("en-CA");

  const selectedRoom =
    roomTypes.find((room) => room.id === roomId) || roomTypes[0];

  const basePrice = Number(hotel?.price) || 0;
  const price = Math.round(basePrice * selectedRoom.multiplier);

  const nights =
    checkIn && checkOut
      ? Math.round(
          (new Date(`${checkOut}T00:00:00`) - new Date(`${checkIn}T00:00:00`)) /
            (1000 * 60 * 60 * 24),
        )
      : 0;

  const total = Math.max(0, nights) * price;

  function handleBooking(event) {
    event.preventDefault();

    if (!checkIn || !checkOut) {
      setMessage("Please select both dates.");
      return;
    }

    if (checkIn < today) {
      setMessage("Check-in cannot be in the past.");
      return;
    }

    if (nights <= 0) {
      setMessage("Check-out must be after check-in.");
      return;
    }

    if (Number(guests) > selectedRoom.capacity) {
      setMessage(
        `This room accommodates up to ${selectedRoom.capacity} guests.`,
      );
      return;
    }

    const booking = saveBooking({
      hotel,
      checkIn,
      checkOut,
      guests: Number(guests),
      nights,
      total,
      price,
      roomType: selectedRoom.name,
      roomCapacity: selectedRoom.capacity,
    });

    navigate("/booking-confirmation", {
      state: booking,
    });
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
      <p className="text-sm font-medium text-gray-500">Starting from</p>

      <p className="mt-1 text-3xl font-extrabold text-gray-900">
        NPR {basePrice.toLocaleString("en-IN")}
        <span className="text-sm font-normal text-gray-500"> / night</span>
      </p>

      <form onSubmit={handleBooking} className="mt-6 space-y-4">
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
            NPR {price.toLocaleString("en-IN")} / night
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Demo room pricing; actual availability and rates are not verified.
          </p>
        </div>

        {/* Check-in */}
        <div>
          <label
            htmlFor="checkIn"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Check-in
          </label>

          <input
            id="checkIn"
            type="date"
            min={today}
            value={checkIn}
            onChange={(event) => {
              const value = event.target.value;
              setCheckIn(value);
              setMessage("");

              if (checkOut && value >= checkOut) {
                setCheckOut("");
              }
            }}
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
            Check-out
          </label>

          <input
            id="checkOut"
            type="date"
            min={checkIn || today}
            value={checkOut}
            onChange={(event) => {
              setCheckOut(event.target.value);
              setMessage("");
            }}
            required
            className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-emerald-600"
          />
        </div>

        {/* Guest selection */}
        <div>
          <label
            htmlFor="guests"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Guests
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

        {/* Price summary */}
        {nights > 0 && (
          <div className="rounded-xl bg-emerald-50 p-4">
            <p className="mb-3 text-sm font-semibold text-emerald-900">
              Booking summary
            </p>

            <div className="flex justify-between gap-3 text-sm text-gray-600">
              <span>Room</span>
              <span className="text-right font-medium text-gray-900">
                {selectedRoom.name}
              </span>
            </div>

            <div className="mt-2 flex justify-between gap-3 text-sm text-gray-600">
              <span>
                NPR {price.toLocaleString("en-IN")} × {nights} night(s)
              </span>
              <span className="font-semibold text-gray-900">
                NPR {total.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="mt-3 flex justify-between border-t border-emerald-200 pt-3">
              <span className="font-bold text-gray-900">Total</span>
              <span className="text-lg font-extrabold text-emerald-700">
                NPR {total.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white transition hover:bg-emerald-800"
        >
          Check Booking
        </button>

        {message && (
          <p
            role="status"
            className="rounded-xl bg-gray-100 p-3 text-sm font-medium text-gray-700"
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
