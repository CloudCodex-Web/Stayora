
import React, { useState } from "react";

function SearchBar({ onSearch }) {
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (checkOut <= checkIn) {
      alert("Check-out must be after check-in.");
      return;
    }

    onSearch({
      destination: destination.trim(),
      checkIn,
      checkOut,
      guests: Number(guests),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-4 rounded-2xl bg-white p-5 shadow-xl md:grid-cols-2 lg:grid-cols-5 lg:items-end"
    >
      <div>
        <label
          htmlFor="destination"
          className="mb-2 block text-sm font-semibold text-gray-700"
        >
          Destination
        </label>
        <input
          id="destination"
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Where do you want to go?"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        />
      </div>

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
          onChange={(e) => setCheckIn(e.target.value)}
          required
          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-600"
        />
      </div>

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
          onChange={(e) => setCheckOut(e.target.value)}
          required
          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-emerald-600"
        />
      </div>

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
          onChange={(e) => setGuests(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-emerald-600"
        >
          <option value="1">1 Guest</option>
          <option value="2">2 Guests</option>
          <option value="3">3 Guests</option>
          <option value="4">4 Guests</option>
          <option value="5">5 Guests</option>
          <option value="6">6+ Guests</option>
        </select>
      </div>

      <button
        type="submit"
        className="rounded-xl bg-emerald-700 px-6 py-3 font-bold text-white transition hover:bg-emerald-800"
      >
        Search Hotels
      </button>
    </form>
  );
}

export default SearchBar;
