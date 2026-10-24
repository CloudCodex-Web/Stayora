const STORAGE_KEY = "stayora-bookings";

export function getBookings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveBooking(bookingDetails) {
  const booking = {
    ...bookingDetails,
    bookingId: `STY-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    status: "Confirmed",
    createdAt: new Date().toISOString(),
  };

  const bookings = getBookings();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([booking, ...bookings]));

  return booking;
}

export function cancelBooking(bookingId) {
  const bookings = getBookings().map((booking) =>
    booking.bookingId === bookingId
      ? { ...booking, status: "Cancelled" }
      : booking,
  );

  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  return bookings;
}
