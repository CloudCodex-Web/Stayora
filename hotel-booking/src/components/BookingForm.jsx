import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  saveBooking,
  getBookings,
  subscribeToBookingChanges,
} from "../utils/bookings";
import { getRooms, subscribeToRoomChanges } from "../utils/rooms";
import { useAuth } from "../context/AuthContext";

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

// Check whether two booking periods overlap.
// Check-out is exclusive, so one guest can check out
// on the same date another guest checks in.
function datesOverlap(startA, endA, startB, endB) {
  return startA < endB && endA > startB;
}

function BookingForm({ hotel }) {
  const [rooms, setRooms] = useState(() => getRooms());
  const [bookings, setBookings] = useState(() => getBookings());

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const [roomId, setRoomId] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  const today = getLocalDateString();

  useEffect(() => {
    const refreshRooms = () => setRooms(getRooms());
    const refreshBookings = () => setBookings(getBookings());

    refreshRooms();
    refreshBookings();

    const unsubscribeRooms = subscribeToRoomChanges(refreshRooms);
    const unsubscribeBookings = subscribeToBookingChanges(refreshBookings);

    return () => {
      unsubscribeRooms();
      unsubscribeBookings();
    };
  }, []);

  // Only include rooms belonging to this hotel.
  const hotelRooms = useMemo(() => {
    return rooms.filter(
      (room) =>
        String(room.hotelId) === String(hotel?.id) &&
        room.status === "Available",
    );
  }, [rooms, hotel?.id]);
  console.log("Booking hotel:", hotel);
  console.log("All saved rooms:", rooms);
  console.log("Matching hotel rooms:", hotelRooms);

  // A room is unavailable when a pending or accepted booking
  // overlaps the selected dates.
  const availableRooms = useMemo(() => {
    if (!checkIn || !checkOut || calculateNights(checkIn, checkOut) <= 0) {
      return hotelRooms;
    }

    return hotelRooms.filter((room) => {
      const hasConflict = bookings.some((booking) => {
        const sameRoom = String(booking.roomId) === String(room.id);

        const activeBooking = ["Pending", "Accepted"].includes(booking.status);

        if (!sameRoom || !activeBooking) return false;

        return datesOverlap(
          checkIn,
          checkOut,
          booking.checkIn,
          booking.checkOut,
        );
      });

      return !hasConflict;
    });
  }, [hotelRooms, bookings, checkIn, checkOut]);

  // Keep the selected room valid when availability changes.
  useEffect(() => {
    if (!availableRooms.some((room) => String(room.id) === String(roomId))) {
      setRoomId(availableRooms[0] ? String(availableRooms[0].id) : "");
    }
  }, [availableRooms, roomId]);

  const selectedRoom =
    availableRooms.find((room) => String(room.id) === String(roomId)) || null;

  const price = Number(selectedRoom?.price) || 0;
  const capacity = Number(selectedRoom?.capacity) || 1;

  const nights = calculateNights(checkIn, checkOut);
  const hasValidDates = Boolean(checkIn && checkOut && nights > 0);
  const total = hasValidDates && selectedRoom ? nights * price : 0;

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

    if (!selectedRoom) {
      setMessage(
        "No available rooms for these dates. Please choose other dates.",
      );
      return;
    }

    if (!availableRooms.some((room) => String(room.id) === String(roomId))) {
      setMessage(
        "This room is no longer available. Please select another room.",
      );
      return;
    }

    if (Number(guests) < 1 || Number(guests) > capacity) {
      setMessage(`This room accommodates 1 to ${capacity} guests.`);
      return;
    }

    if (
      !Number.isFinite(price) ||
      price <= 0 ||
      !Number.isFinite(total) ||
      total <= 0
    ) {
      setMessage("The room price is invalid. Please contact the property.");
      return;
    }

    // Recheck availability immediately before saving.
    const latestRooms = getRooms();
    const latestBookings = getBookings();

    const roomStillAvailable = latestRooms.some(
      (room) =>
        String(room.id) === String(roomId) &&
        String(room.hotelId) === String(hotel.id) &&
        room.status === "Available",
    );

    const hasLatestConflict = latestBookings.some((booking) => {
      return (
        String(booking.roomId) === String(roomId) &&
        ["Pending", "Accepted"].includes(booking.status) &&
        datesOverlap(checkIn, checkOut, booking.checkIn, booking.checkOut)
      );
    });

    if (!roomStillAvailable || hasLatestConflict) {
      setRooms(latestRooms);
      setBookings(latestBookings);
      setMessage(
        "Sorry, this room has just become unavailable. Please select another room or date.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const booking = saveBooking({
        hotel,
        hotelId: hotel.id,
        hotelName: hotel.name,

        roomId: selectedRoom.id,
        roomNumber: selectedRoom.roomNumber,
        roomType: selectedRoom.roomType,
        roomCapacity: capacity,

        userName: user.name,
        userEmail: user.email.trim().toLowerCase(),

        checkIn,
        checkOut,
        guests: Number(guests),
        nights,
        total,
        price,
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

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
      {/* Price */}
      <div>
        <p className="text-sm font-medium text-gray-500">
          Room prices starting from
        </p>

        <p className="mt-1 text-3xl font-extrabold text-gray-900">
          NPR {Number(hotel?.price || 0).toLocaleString("en-NP")}
          <span className="text-sm font-normal text-gray-500"> / night</span>
        </p>
      </div>

      <form onSubmit={handleBooking} className="mt-6 space-y-5">
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

        {/* Room selection */}
        <div>
          <label
            htmlFor="roomId"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Choose your room
          </label>

          {availableRooms.length > 0 ? (
            <select
              id="roomId"
              value={roomId}
              onChange={(event) => {
                setRoomId(event.target.value);
                setMessage("");
              }}
              className="w-full rounded-xl border border-gray-300 bg-white p-3 outline-none focus:border-emerald-600"
            >
              {availableRooms.map((room) => (
                <option key={room.id} value={String(room.id)}>
                  Room {room.roomNumber} — {room.roomType}
                </option>
              ))}
            </select>
          ) : (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
              {hotelRooms.length === 0
                ? "No available rooms have been added to this hotel yet."
                : hasValidDates
                  ? "No rooms are available for your selected dates. Try different dates."
                  : "There are currently no available rooms at this hotel."}
            </div>
          )}

          {selectedRoom && (
            <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-gray-900">
                    {selectedRoom.roomType}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Room {selectedRoom.roomNumber}
                  </p>
                </div>

                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                  Available
                </span>
              </div>

              <p className="mt-3 text-sm text-gray-600">
                Maximum capacity: {capacity} guests
              </p>

              {selectedRoom.description && (
                <p className="mt-2 text-sm text-gray-500">
                  {selectedRoom.description}
                </p>
              )}

              <p className="mt-3 font-bold text-emerald-700">
                NPR {price.toLocaleString("en-NP")} / night
              </p>
            </div>
          )}
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
            disabled={!selectedRoom}
            onChange={(event) => {
              setGuests(event.target.value);
              setMessage("");
            }}
            className="w-full rounded-xl border border-gray-300 bg-white p-3 outline-none focus:border-emerald-600 disabled:bg-gray-100"
          >
            {Array.from({ length: capacity }, (_, index) => index + 1).map(
              (count) => (
                <option key={count} value={String(count)}>
                  {count} {count === 1 ? "Guest" : "Guests"}
                </option>
              ),
            )}
          </select>

          <p className="mt-1 text-xs text-gray-500">
            {selectedRoom
              ? `Maximum capacity: ${capacity} guests`
              : "Select an available room first."}
          </p>
        </div>

        {/* Booking summary */}
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-3 font-bold text-gray-900">Your booking summary</h3>

          {hasValidDates && selectedRoom ? (
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
                    {selectedRoom.roomNumber} — {selectedRoom.roomType}
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
              Select your dates and an available room to see your booking
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
            rejects it.
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || !selectedRoom || !hasValidDates}
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
