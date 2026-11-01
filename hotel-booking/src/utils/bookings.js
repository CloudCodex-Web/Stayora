import { addNotification, addUserNotification } from "./notifications";

import { addActivityLog } from "./activityLogs";

const STORAGE_KEY = "stayora-bookings";

const ALLOWED_STATUSES = ["Pending", "Accepted", "Rejected", "Cancelled"];

// Notify components when bookings change.
function notifyBookingChanges() {
  window.dispatchEvent(new Event("stayora-bookings-updated"));
}

// Get all bookings.
export function getBookings() {
  try {
    const storedBookings = localStorage.getItem(STORAGE_KEY);
    const parsed = storedBookings ? JSON.parse(storedBookings) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to load bookings:", error);
    return [];
  }
}

// Get an individual booking using its ID.
export function getBookingById(bookingId) {
  return getBookings().find(
    (booking) => String(booking.bookingId) === String(bookingId),
  );
}

// Create a new booking.
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

  // Save booking.
  localStorage.setItem(STORAGE_KEY, JSON.stringify([booking, ...bookings]));

  notifyBookingChanges();

  // Notify admin about new booking.
  addNotification({
    title: "New Booking Received",
    message: `${booking.userName || "A guest"} booked ${
      booking.hotelName || "a hotel"
    }.`,
    type: "booking",
    link: "/admin/bookings",
  });
  //TODOs:
  // Notify guest that the booking request was submitted.
  if (booking.userEmail) {
    addUserNotification(booking.userEmail, {
      title: "Booking Request Submitted",
      message: `Your booking request for ${
        booking.hotelName || "your selected hotel"
      } has been submitted and is waiting for admin approval.`,
      type: "booking",
      link: `/my-bookings/${booking.bookingId}`,
    });
  }

  // Record activity.
  addActivityLog({
    action: "Booking Created",
    category: "Booking",
    description: `${booking.userName || "A guest"} created a booking at ${
      booking.hotelName || "a hotel"
    }.`,
    target: booking.bookingId,
  });

  return booking;
}

// Update booking status.
export function updateBookingStatus(bookingId, status) {
  if (!ALLOWED_STATUSES.includes(status)) {
    throw new Error("Invalid booking status.");
  }

  const bookings = getBookings();

  // Find the existing booking.
  const existingBooking = bookings.find(
    (booking) => String(booking.bookingId) === String(bookingId),
  );

  if (!existingBooking) {
    throw new Error("Booking not found.");
  }

  const previousStatus = String(existingBooking.status || "Pending")
    .trim()
    .toLowerCase();

  // Treat legacy Confirmed status as Accepted.
  const normalizedPreviousStatus =
    previousStatus === "confirmed" ? "accepted" : previousStatus;

  const statusChanged = normalizedPreviousStatus !== status.toLowerCase();

  // Update the selected booking.
  const updatedBookings = bookings.map((booking) =>
    String(booking.bookingId) === String(bookingId)
      ? {
          ...booking,
          status,
          updatedAt: new Date().toISOString(),
        }
      : booking,
  );

  // Save updated bookings.
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBookings));

  notifyBookingChanges();

  // Do not generate duplicate notifications for the same status.
  if (!statusChanged) {
    return updatedBookings;
  }

  const hotelName =
    existingBooking.hotelName ||
    existingBooking.hotel?.name ||
    "your selected hotel";

  const guestName =
    existingBooking.userName || existingBooking.guestName || "A guest";

  const guestEmail = (existingBooking.userEmail || existingBooking.email || "")
    .trim()
    .toLowerCase();

  // Guest notification messages for each status.
  const guestMessages = {
    Accepted: {
      title: "Booking Accepted!",
      message: `Great news! Your booking at ${hotelName} has been approved by the admin.`,
      type: "success",
    },

    Rejected: {
      title: "Booking Rejected",
      message: `Your booking request at ${hotelName} has been rejected by the admin.`,
      type: "warning",
    },

    Cancelled: {
      title: "Booking Cancelled",
      message: `Your booking at ${hotelName} has been cancelled.`,
      type: "cancellation",
    },

    Pending: {
      title: "Booking Status Updated",
      message: `Your booking at ${hotelName} is now pending approval.`,
      type: "booking",
    },
  };

  const guestMessage = guestMessages[status];

  // IMPORTANT: Create a NEW guest notification
  // whenever the booking status changes.
  if (guestEmail && guestMessage) {
    addUserNotification(guestEmail, {
      ...guestMessage,
      link: `/my-bookings/${existingBooking.bookingId}`,
    });
  }

  // Record booking status change in activity logs.
  const actionByStatus = {
    Accepted: "Booking Accepted",
    Rejected: "Booking Rejected",
    Cancelled: "Booking Cancelled",
    Pending: "Booking Set to Pending",
  };

  addActivityLog({
    action: actionByStatus[status],
    category: "Booking",
    description: `${guestName}'s booking at ${hotelName} was ${status.toLowerCase()}.`,
    target: existingBooking.bookingId,
  });

  // Notify admin if a booking is cancelled.
  if (status === "Cancelled" && normalizedPreviousStatus !== "cancelled") {
    addNotification({
      title: "Booking Cancelled",
      message: `${guestName} cancelled their booking at ${hotelName}.`,
      type: "cancellation",
      link: "/admin/bookings",
    });
  }

  return updatedBookings;
}

// Cancel a booking.
export function cancelBooking(bookingId) {
  return updateBookingStatus(bookingId, "Cancelled");
}

// Subscribe to booking updates.
export function subscribeToBookingChanges(callback) {
  function handleStorageChange(event) {
    if (event.key === STORAGE_KEY) {
      callback();
    }
  }

  function handleCustomChange() {
    callback();
  }

  window.addEventListener("storage", handleStorageChange);

  window.addEventListener("stayora-bookings-updated", handleCustomChange);

  return () => {
    window.removeEventListener("storage", handleStorageChange);

    window.removeEventListener("stayora-bookings-updated", handleCustomChange);
  };
}
