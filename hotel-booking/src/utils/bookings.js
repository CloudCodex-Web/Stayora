const STORAGE_KEY = "stayora-bookings";

function notifyBookingChanges() {
  window.dispatchEvent(new Event("stayora-bookings-updated"));
}

export function getBookings() {
  try {
    const storedBookings = localStorage.getItem(STORAGE_KEY);
    return storedBookings ? JSON.parse(storedBookings) : [];
  } catch (error) {
    console.error("Failed to load bookings:", error);
    return [];
  }
}

export function saveBooking(bookingDetails) {
  const bookings = getBookings();

  const booking = {
    ...bookingDetails,
    bookingId:
      bookingDetails.bookingId ||
      `STY-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    status: bookingDetails.status || "Pending",
    createdAt: bookingDetails.createdAt || new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify([booking, ...bookings]));

  notifyBookingChanges();

  return booking;
}

export function updateBookingStatus(bookingId, status) {
  const allowedStatuses = ["Pending", "Accepted", "Rejected", "Cancelled"];

  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid booking status.");
  }

  const bookings = getBookings();

  const updatedBookings = bookings.map((booking) =>
    booking.bookingId === bookingId
      ? {
          ...booking,
          status,
          updatedAt: new Date().toISOString(),
        }
      : booking,
  );

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBookings));

  notifyBookingChanges(); 

  return updatedBookings;
}

export function cancelBooking(bookingId) {
  return updateBookingStatus(bookingId, "Cancelled");
}

export function subscribeToBookingChanges(callback) {
  const handleStorageChange = (event) => {
    if (event.key === STORAGE_KEY) {
      callback();
    }
  };

  const handleCustomChange = () => {
    callback();
  };

  window.addEventListener("storage", handleStorageChange);
  window.addEventListener("stayora-bookings-updated", handleCustomChange);

  return () => {
    window.removeEventListener("storage", handleStorageChange);
    window.removeEventListener("stayora-bookings-updated", handleCustomChange);
  };
}
