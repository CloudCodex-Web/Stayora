import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  Mail,
  CalendarCheck,
  Clock3,
  CheckCircle2,
  Eye,
  X,
  UserRound,
} from "lucide-react";

import { getUsers, subscribeToUserChanges } from "../../utils/users";

import { getBookings, subscribeToBookingChanges } from "../../utils/bookings";

function formatDate(date) {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getGuestName(guest) {
  return guest.name || guest.fullName || "Unnamed Guest";
}

function getBookingStatus(booking) {
  return (booking.status || "Pending").toLowerCase();
}

function getBookingTotal(booking) {
  const amount = Number(
    booking.totalPrice ?? booking.totalAmount ?? booking.price ?? 0,
  );

  return Number.isFinite(amount) ? amount : 0;
}

function getGuestEmail(guest) {
  return (guest.email || "").trim().toLowerCase();
}

function getBookingEmail(booking) {
  return (booking.userEmail || booking.email || booking.guestEmail || "")
    .trim()
    .toLowerCase();
}

function GuestManagement() {
  const [guests, setGuests] = useState(() => getUsers() || []);
  const [bookings, setBookings] = useState(() => getBookings() || []);
  const [search, setSearch] = useState("");
  const [selectedGuest, setSelectedGuest] = useState(null);

  useEffect(() => {
    const unsubscribeUsers = subscribeToUserChanges(() => {
      setGuests(getUsers() || []);
    });

    const unsubscribeBookings = subscribeToBookingChanges(() => {
      setBookings(getBookings() || []);
    });

    return () => {
      if (typeof unsubscribeUsers === "function") {
        unsubscribeUsers();
      }

      if (typeof unsubscribeBookings === "function") {
        unsubscribeBookings();
      }
    };
  }, []);

  const guestRows = useMemo(() => {
    return guests.map((guest) => {
      const email = getGuestEmail(guest);

      const guestBookings = bookings.filter(
        (booking) => email && getBookingEmail(booking) === email,
      );

      const accepted = guestBookings.filter(
        (booking) => getBookingStatus(booking) === "accepted",
      ).length;

      const pending = guestBookings.filter(
        (booking) => getBookingStatus(booking) === "pending",
      ).length;

      return {
        ...guest,
        guestBookings,
        accepted,
        pending,
        bookingCount: guestBookings.length,
      };
    });
  }, [guests, bookings]);

  const filteredGuests = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return guestRows;

    return guestRows.filter((guest) => {
      return (
        getGuestName(guest).toLowerCase().includes(query) ||
        getGuestEmail(guest).includes(query)
      );
    });
  }, [guestRows, search]);

  const totalGuests = guests.length;

  const guestsWithBookings = guestRows.filter(
    (guest) => guest.bookingCount > 0,
  ).length;

  const totalBookings = bookings.length;

  const pendingBookings = bookings.filter(
    (booking) => getBookingStatus(booking) === "pending",
  ).length;

  const selectedGuestBookings = selectedGuest
    ? bookings.filter(
        (booking) =>
          getGuestEmail(selectedGuest) &&
          getBookingEmail(booking) === getGuestEmail(selectedGuest),
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Guest Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View registered guests and their booking activity.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-teal-50 px-4 py-3 text-sm font-medium text-teal-700">
          <Users size={18} />
          {totalGuests} registered guests
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Guests"
          value={totalGuests}
          description="Registered user accounts"
          icon={<Users size={21} />}
          color="teal"
        />

        <StatCard
          title="Guests With Bookings"
          value={guestsWithBookings}
          description="Guests with at least one booking"
          icon={<UserRound size={21} />}
          color="blue"
        />

        <StatCard
          title="Total Bookings"
          value={totalBookings}
          description="All recorded bookings"
          icon={<CalendarCheck size={21} />}
          color="violet"
        />

        <StatCard
          title="Pending Bookings"
          value={pendingBookings}
          description="Awaiting a decision"
          icon={<Clock3 size={21} />}
          color="amber"
        />
      </div>

      {/* Guest table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Registered Guests
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Search guests and inspect their booking history.
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or email..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Guest</th>
                <th className="px-5 py-4 font-semibold">Registered</th>
                <th className="px-5 py-4 font-semibold">Bookings</th>
                <th className="px-5 py-4 font-semibold">Accepted</th>
                <th className="px-5 py-4 font-semibold">Pending</th>
                <th className="px-5 py-4 text-right font-semibold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredGuests.map((guest, index) => (
                <tr
                  key={guest.id || guest.email || index}
                  className="transition hover:bg-slate-50"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-50 font-bold text-teal-700">
                        {getGuestName(guest).charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <p className="font-semibold text-slate-800">
                          {getGuestName(guest)}
                        </p>

                        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                          <Mail size={13} />
                          {guest.email || "No email provided"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {formatDate(
                      guest.createdAt || guest.registeredAt || guest.joinedAt,
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
                      {guest.bookingCount}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-sm font-medium text-emerald-700">
                    {guest.accepted}
                  </td>

                  <td className="px-5 py-4 text-sm font-medium text-amber-700">
                    {guest.pending}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedGuest(guest)}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
                    >
                      <Eye size={16} />
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {filteredGuests.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <Users size={25} />
                    </div>

                    <p className="mt-4 font-semibold text-slate-800">
                      No guests found
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {search
                        ? "Try a different name or email."
                        : "Registered guest accounts will appear here."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-500">
          Showing {filteredGuests.length} of {totalGuests} guests
        </div>
      </div>

      {/* Guest details modal */}
      {selectedGuest && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedGuest(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="guest-modal-title"
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 font-bold text-teal-700">
                  {getGuestName(selectedGuest).charAt(0).toUpperCase()}
                </div>

                <div>
                  <h2
                    id="guest-modal-title"
                    className="text-xl font-bold text-slate-900"
                  >
                    {getGuestName(selectedGuest)}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Guest details and booking history
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedGuest(null)}
                aria-label="Close guest details"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 p-5 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailCard
                  label="Email address"
                  value={selectedGuest.email || "Not provided"}
                />

                <DetailCard
                  label="Registration date"
                  value={formatDate(
                    selectedGuest.createdAt ||
                      selectedGuest.registeredAt ||
                      selectedGuest.joinedAt,
                  )}
                />

                <DetailCard
                  label="Total bookings"
                  value={selectedGuestBookings.length}
                />

                <DetailCard
                  label="Total booking value"
                  value={`NPR ${selectedGuestBookings
                    .reduce((sum, booking) => sum + getBookingTotal(booking), 0)
                    .toLocaleString("en-NP")}`}
                />
              </div>

              <div>
                <h3 className="mb-4 text-lg font-bold text-slate-900">
                  Booking History
                </h3>

                {selectedGuestBookings.length > 0 ? (
                  <div className="space-y-3">
                    {selectedGuestBookings.map((booking, index) => {
                      const status = getBookingStatus(booking);

                      return (
                        <div
                          key={booking.id || booking.bookingId || index}
                          className="rounded-xl border border-slate-200 p-4"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="font-semibold text-slate-900">
                                {booking.hotelName ||
                                  booking.hotel?.name ||
                                  booking.propertyName ||
                                  "Hotel booking"}
                              </p>

                              <p className="mt-1 text-sm text-slate-500">
                                Booking ID:{" "}
                                {booking.id || booking.bookingId || "—"}
                              </p>
                            </div>

                            <StatusBadge status={status} />
                          </div>

                          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                            <div>
                              <p className="text-slate-500">Check-in</p>
                              <p className="mt-1 font-medium text-slate-800">
                                {formatDate(
                                  booking.checkIn || booking.checkInDate,
                                )}
                              </p>
                            </div>

                            <div>
                              <p className="text-slate-500">Check-out</p>
                              <p className="mt-1 font-medium text-slate-800">
                                {formatDate(
                                  booking.checkOut || booking.checkOutDate,
                                )}
                              </p>
                            </div>

                            <div>
                              <p className="text-slate-500">Total</p>
                              <p className="mt-1 font-semibold text-slate-900">
                                NPR{" "}
                                {getBookingTotal(booking).toLocaleString(
                                  "en-NP",
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl bg-slate-50 px-4 py-10 text-center">
                    <CalendarCheck
                      size={28}
                      className="mx-auto text-slate-400"
                    />

                    <p className="mt-3 font-semibold text-slate-800">
                      No booking history
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      This guest has no bookings associated with their email.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 p-5">
              <button
                type="button"
                onClick={() => setSelectedGuest(null)}
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, description, icon, color }) {
  const colorClasses = {
    teal: "bg-teal-50 text-teal-700",
    blue: "bg-blue-50 text-blue-700",
    violet: "bg-violet-50 text-violet-700",
    amber: "bg-amber-50 text-amber-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            colorClasses[color] || colorClasses.teal
          }`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function DetailCard({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 break-words font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    accepted: "bg-emerald-50 text-emerald-700",
    confirmed: "bg-emerald-50 text-emerald-700",
    pending: "bg-amber-50 text-amber-700",
    rejected: "bg-red-50 text-red-700",
    cancelled: "bg-slate-100 text-slate-600",
  };

  const label = status
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : "Pending";

  return (
    <span
      className={`inline-flex w-fit items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      {(status === "accepted" || status === "confirmed") && (
        <CheckCircle2 size={13} />
      )}
      {label}
    </span>
  );
}

export default GuestManagement;
