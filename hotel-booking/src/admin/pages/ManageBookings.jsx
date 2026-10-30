import { useEffect, useMemo, useState } from "react";
import {
  getBookings,
  updateBookingStatus,
  subscribeToBookingChanges,
} from "../../utils/bookings";

import { getUsers, subscribeToUserChanges } from "../../utils/users";

const statusStyles = {
  Pending: "bg-amber-100 text-amber-700",
  Accepted: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
  Cancelled: "bg-gray-100 text-gray-600",
};

const normalizeStatus = (status) => {
  const value = String(status || "Pending")
    .trim()
    .toLowerCase();

  const statusMap = {
    pending: "Pending",
    accepted: "Accepted",
    confirmed: "Accepted",
    rejected: "Rejected",
    cancelled: "Cancelled",
  };

  return statusMap[value] || "Unknown";
};

export default function ManageBookings() {
  const [users, setUsers] = useState(() => getUsers());

  const [bookings, setBookings] = useState(() => getBookings());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const refreshBookings = () => setBookings(getBookings());

    const unsubscribe = subscribeToBookingChanges(refreshBookings);

    refreshBookings();

    return unsubscribe;
  }, []);

  useEffect(() => {
    const refreshUsers = () => setUsers(getUsers());

    const unsubscribe = subscribeToUserChanges(refreshUsers);

    refreshUsers();

    return unsubscribe;
  }, []);

  const filteredBookings = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return bookings.filter((booking) => {
      const matchesSearch = [
        booking.bookingId,
        booking.hotelName,
        booking.guestName,
        booking.name,
        booking.email,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(searchText));

      const matchesStatus =
        statusFilter === "All" ||
        normalizeStatus(booking.status) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, statusFilter]);

  function handleStatusChange(bookingId, status) {
    try {
      updateBookingStatus(bookingId, status);
      setBookings(getBookings());
    } catch (error) {
      console.error("Could not update booking:", error);
      alert("Unable to update booking status. Please try again.");
    }
  }

  const counts = {
    All: bookings.length,
    Pending: bookings.filter((b) => normalizeStatus(b.status) === "Pending")
      .length,
    Accepted: bookings.filter((b) => normalizeStatus(b.status) === "Accepted")
      .length,
    Rejected: bookings.filter((b) => normalizeStatus(b.status) === "Rejected")
      .length,
    Cancelled: bookings.filter((b) => normalizeStatus(b.status) === "Cancelled")
      .length,
  };

  function formatDate(date) {
    if (!date) return "—";

    const parsedDate = new Date(
      `${date}`.length === 10 ? `${date}T00:00:00` : date,
    );

    return Number.isNaN(parsedDate.getTime())
      ? "—"
      : parsedDate.toLocaleDateString();
  }

  function formatPrice(amount) {
    const value = Number(amount);

    if (!Number.isFinite(value)) return "—";

    return `NPR ${value.toLocaleString()}`;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-amber-600">
            Stayora Administration
          </p>

          <h1 className="text-3xl font-bold text-gray-900">Manage Bookings</h1>

          <p className="mt-2 text-gray-500">
            Review guest requests and manage their booking status.
          </p>
        </div>

        {/* Booking statistics */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { label: "Total", value: counts.All, color: "text-gray-900" },
            {
              label: "Pending",
              value: counts.Pending,
              color: "text-amber-600",
            },
            {
              label: "Accepted",
              value: counts.Accepted,
              color: "text-green-600",
            },
            {
              label: "Rejected",
              value: counts.Rejected,
              color: "text-red-600",
            },
            {
              label: "Cancelled",
              value: counts.Cancelled,
              color: "text-gray-500",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-gray-500">{item.label} Bookings</p>
              <p className={`mt-2 text-3xl font-bold ${item.color}`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Search and filter */}
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search booking ID, hotel, guest..."
            className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-amber-500"
          >
            {["All", "Pending", "Accepted", "Rejected", "Cancelled"].map(
              (status) => (
                <option key={status} value={status}>
                  {status === "All" ? "All statuses" : status}
                </option>
              ),
            )}
          </select>
        </div>

        {/* Bookings table */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="font-semibold text-gray-900">Booking Requests</h2>
            <span className="text-sm text-gray-500">
              {filteredBookings.length} results
            </span>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-2xl">
                🏨
              </div>

              <h3 className="text-lg font-semibold text-gray-800">
                No bookings found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Booking requests will appear here when guests make reservations.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-4">Booking / Guest</th>
                    <th className="px-5 py-4">Hotel</th>
                    <th className="px-5 py-4">Stay Details</th>
                    <th className="px-5 py-4">Total</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredBookings.map((booking, index) => {
                    const bookingId =
                      booking.bookingId || `booking-${booking.id || index}`;

                    const bookingEmail = (
                      booking.userEmail ||
                      booking.email ||
                      ""
                    )
                      .trim()
                      .toLowerCase();

                    const matchedUser = users.find(
                      (user) =>
                        user.email?.trim().toLowerCase() === bookingEmail,
                    );

                    const guestName =
                      booking.guestName ||
                      matchedUser?.name ||
                      booking.name ||
                      booking.fullName ||
                      "Guest";

                    const guestEmail = bookingEmail || "Email not available";

                    return (
                      <tr
                        key={bookingId}
                        className="transition hover:bg-gray-50"
                      >
                        <td className="px-5 py-5">
                          <p className="font-semibold text-gray-900">
                            {guestName}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {booking.bookingId || "No booking ID"}
                          </p>
                          {booking.email && (
                            <p className="mt-1 break-all text-xs text-gray-500">
                              {guestEmail}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-5">
                          <p className="font-medium text-gray-800">
                            {booking.hotelName ||
                              booking.hotel?.name ||
                              "Hotel"}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {booking.roomType || "Standard room"}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <p className="text-gray-700">
                            {formatDate(booking.checkIn)}
                          </p>
                          <p className="my-1 text-xs text-gray-400">to</p>
                          <p className="text-gray-700">
                            {formatDate(booking.checkOut)}
                          </p>
                          <p className="mt-2 text-xs text-gray-500">
                            {booking.guests ?? "—"} guest(s)
                          </p>
                        </td>

                        <td className="px-5 py-5 font-semibold text-gray-900">
                          {formatPrice(booking.total)}
                        </td>

                        <td className="px-5 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              statusStyles[booking.status] ||
                              statusStyles.Pending
                            }`}
                          >
                            {booking.status || "Pending"}
                          </span>
                        </td>

                        <td className="px-5 py-5">
                          {normalizeStatus(booking.status) === "Pending" ? (
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() =>
                                  handleStatusChange(
                                    booking.bookingId,
                                    "Accepted",
                                  )
                                }
                                className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-700"
                              >
                                Accept
                              </button>

                              <button
                                onClick={() =>
                                  handleStatusChange(
                                    booking.bookingId,
                                    "Rejected",
                                  )
                                }
                                className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">
                              No action needed
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="mt-4 text-xs leading-5 text-gray-400">
          Demo mode: bookings are stored in this browser. A backend and database
          will be needed to securely manage real guest bookings across devices.
        </p>
      </div>
    </div>
  );
}
