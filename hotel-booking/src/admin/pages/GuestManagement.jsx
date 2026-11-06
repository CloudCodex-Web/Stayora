
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

import {
  getUsers,
  subscribeToUserChanges,
} from "../../utils/users";

import {
  getBookings,
  subscribeToBookingChanges,
} from "../../utils/bookings";

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
    booking.totalPrice ?? booking.totalAmount ?? booking.price ?? 0
  );

  return Number.isFinite(amount) ? amount : 0;
}

function getGuestEmail(guest) {
  return (guest.email || "").trim().toLowerCase();
}

function getBookingEmail(booking) {
  return (
    booking.userEmail ||
    booking.email ||
    booking.guestEmail ||
    ""
  )
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
        (booking) =>
          email && getBookingEmail(booking) === email
      );

      const accepted = guestBookings.filter(
        (booking) => getBookingStatus(booking) === "accepted"
      ).length;

      const pending = guestBookings.filter(
        (booking) => getBookingStatus(booking) === "pending"
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
    (guest) => guest.bookingCount > 0
  ).length;

  const totalBookings = bookings.length;

  const pendingBookings = bookings.filter(
    (booking) => getBookingStatus(booking) === "pending"
  ).length;

  const selectedGuestBookings = selectedGuest
    ? bookings.filter(
        (booking) =>
          getGuestEmail(selectedGuest) &&
          getBookingEmail(booking) === getGuestEmail(selectedGuest)
      )
    : [];

  const cardStyle =
    "rounded-2xl border border-white/[0.07] bg-[#191727]/80 shadow-[0_8px_30px_rgba(0,0,0,0.15)]";

  const inputStyle =
    "w-full rounded-xl border border-white/[0.08] bg-[#11101c] py-3 pl-10 pr-4 text-sm text-gray-200 outline-none transition placeholder:text-gray-500 focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/10";

  return (
    <div className="min-h-screen space-y-6 bg-[#11101c] p-4 text-gray-200 sm:p-6 lg:p-8">

      {/* Page Heading */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-400">
            Administration
          </p>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white">
            Guest Management
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            View registered guests and their booking activity.
          </p>
        </div>

        <div className="flex w-fit items-center gap-2 rounded-xl border border-teal-500/20 bg-teal-500/10 px-4 py-3 text-sm font-semibold text-teal-300">
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
          color="purple"
        />

        <StatCard
          title="Pending Bookings"
          value={pendingBookings}
          description="Awaiting a decision"
          icon={<Clock3 size={21} />}
          color="amber"
        />
      </div>

      {/* Guest Table */}
      <div className={`${cardStyle} overflow-hidden`}>
        <div className="flex flex-col gap-4 border-b border-white/[0.07] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">
              Registered Guests
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Search guests and inspect their booking history.
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or email..."
              className={inputStyle}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-[#211d35]/70 text-xs uppercase tracking-wider text-gray-400">
              <tr>
                <th className="px-5 py-4 font-semibold">Guest</th>
                <th className="px-5 py-4 font-semibold">Registered</th>
                <th className="px-5 py-4 font-semibold">Bookings</th>
                <th className="px-5 py-4 font-semibold">Accepted</th>
                <th className="px-5 py-4 font-semibold">Pending</th>
                <th className="px-5 py-4 text-right font-semibold">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/[0.06]">
              {filteredGuests.map((guest, index) => (
                <tr
                  key={guest.id || guest.email || index}
                  className="transition hover:bg-white/[0.025]"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={getGuestName(guest)} />

                      <div>
                        <p className="font-semibold text-gray-200">
                          {getGuestName(guest)}
                        </p>

                        <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                          <Mail size={13} />
                          {guest.email || "No email provided"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-400">
                    {formatDate(
                      guest.createdAt ||
                        guest.registeredAt ||
                        guest.joinedAt
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-lg border border-white/[0.07] bg-[#211d35] px-3 py-1.5 text-sm font-semibold text-gray-300">
                      {guest.bookingCount}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-sm font-semibold text-teal-400">
                    {guest.accepted}
                  </td>

                  <td className="px-5 py-4 text-sm font-semibold text-amber-400">
                    {guest.pending}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedGuest(guest)}
                      className="inline-flex items-center gap-2 rounded-lg border border-purple-500/20 bg-purple-500/10 px-3 py-2 text-sm font-semibold text-purple-300 transition hover:border-purple-400/40 hover:bg-purple-500/20"
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
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-[#211d35] text-gray-500">
                      <Users size={25} />
                    </div>

                    <p className="mt-4 font-semibold text-white">
                      No guests found
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
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

        <div className="border-t border-white/[0.07] px-5 py-4 text-sm text-gray-500">
          Showing {filteredGuests.length} of {totalGuests} guests
        </div>
      </div>

      {/* Guest Details Modal */}
      {selectedGuest && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
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
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/[0.09] bg-[#191727] shadow-2xl"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/[0.07] p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <Avatar name={getGuestName(selectedGuest)} />

                <div>
                  <h2
                    id="guest-modal-title"
                    className="text-xl font-bold text-white"
                  >
                    {getGuestName(selectedGuest)}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Guest details and booking history
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedGuest(null)}
                aria-label="Close guest details"
                className="rounded-lg border border-white/[0.07] p-2 text-gray-400 transition hover:bg-white/[0.06] hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 p-5 sm:p-6">

              {/* Guest Information */}
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
                      selectedGuest.joinedAt
                  )}
                />

                <DetailCard
                  label="Total bookings"
                  value={selectedGuestBookings.length}
                />

                <DetailCard
                  label="Total booking value"
                  value={`NPR ${selectedGuestBookings
                    .reduce(
                      (sum, booking) =>
                        sum + getBookingTotal(booking),
                      0
                    )
                    .toLocaleString("en-NP")}`}
                />
              </div>

              {/* Booking History */}
              <div>
                <h3 className="mb-4 text-lg font-bold text-white">
                  Booking History
                </h3>

                {selectedGuestBookings.length > 0 ? (
                  <div className="space-y-3">
                    {selectedGuestBookings.map((booking, index) => {
                      const status = getBookingStatus(booking);

                      return (
                        <div
                          key={
                            booking.id ||
                            booking.bookingId ||
                            index
                          }
                          className="rounded-xl border border-white/[0.07] bg-[#211d35]/60 p-4 transition hover:border-white/[0.12]"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="font-semibold text-white">
                                {booking.hotelName ||
                                  booking.hotel?.name ||
                                  booking.propertyName ||
                                  "Hotel booking"}
                              </p>

                              <p className="mt-1 text-sm text-gray-500">
                                Booking ID:{" "}
                                {booking.id ||
                                  booking.bookingId ||
                                  "—"}
                              </p>
                            </div>

                            <StatusBadge status={status} />
                          </div>

                          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                            <div>
                              <p className="text-gray-500">
                                Check-in
                              </p>

                              <p className="mt-1 font-medium text-gray-300">
                                {formatDate(
                                  booking.checkIn ||
                                    booking.checkInDate
                                )}
                              </p>
                            </div>

                            <div>
                              <p className="text-gray-500">
                                Check-out
                              </p>

                              <p className="mt-1 font-medium text-gray-300">
                                {formatDate(
                                  booking.checkOut ||
                                    booking.checkOutDate
                                )}
                              </p>
                            </div>

                            <div>
                              <p className="text-gray-500">
                                Total
                              </p>

                              <p className="mt-1 font-semibold text-teal-300">
                                NPR{" "}
                                {getBookingTotal(
                                  booking
                                ).toLocaleString("en-NP")}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-white/[0.06] bg-[#211d35]/50 px-4 py-10 text-center">
                    <CalendarCheck
                      size={28}
                      className="mx-auto text-gray-500"
                    />

                    <p className="mt-3 font-semibold text-white">
                      No booking history
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      This guest has no bookings associated with their email.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-white/[0.07] p-5">
              <button
                type="button"
                onClick={() => setSelectedGuest(null)}
                className="rounded-xl border border-white/[0.08] bg-[#211d35] px-5 py-3 text-sm font-semibold text-gray-300 transition hover:bg-white/[0.08] hover:text-white"
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
    teal: "border-teal-500/20 bg-teal-500/10 text-teal-400",
    blue: "border-blue-500/20 bg-blue-500/10 text-blue-400",
    purple: "border-purple-500/20 bg-purple-500/10 text-purple-400",
    amber: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  };

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#191727]/80 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.15)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">
            {title}
          </p>

          <p className="mt-2 text-3xl font-extrabold text-white">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
            colorClasses[color] || colorClasses.teal
          }`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-500">
        {description}
      </p>
    </div>
  );
}

function Avatar({ name }) {
  const initial =
    (name || "U").trim().charAt(0).toUpperCase() || "U";

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-purple-500/20 bg-gradient-to-br from-purple-500/20 to-teal-500/10 font-bold text-purple-300">
      {initial}
    </div>
  );
}

function DetailCard({ label, value }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#211d35]/60 p-4">
      <p className="text-sm text-gray-500">{label}</p>

      <p className="mt-2 break-words font-semibold text-gray-200">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    accepted:
      "border-teal-500/20 bg-teal-500/10 text-teal-300",
    confirmed:
      "border-teal-500/20 bg-teal-500/10 text-teal-300",
    pending:
      "border-amber-500/20 bg-amber-500/10 text-amber-300",
    rejected:
      "border-red-500/20 bg-red-500/10 text-red-300",
    cancelled:
      "border-gray-500/20 bg-gray-500/10 text-gray-400",
  };

  const label = status
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : "Pending";

  return (
    <span
      className={`inline-flex w-fit items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${
        styles[status] ||
        "border-gray-500/20 bg-gray-500/10 text-gray-400"
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
