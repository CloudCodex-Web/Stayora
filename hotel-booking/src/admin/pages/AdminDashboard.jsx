import { useEffect, useState } from "react";
import {
  Hotel,
  CalendarCheck,
  Users,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Clock3,
  Star,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import hotels from "../../data/hotels";
import {
  getStoredHotels,
  subscribeToHotelChanges,
} from "../../data/hotelStorage";

const bookings = [
  {
    id: "#ST-1024",
    guest: "Aarav Sharma",
    hotel: "Himalayan Grand",
    date: "24 Oct 2026",
    amount: 12000,
    status: "Confirmed",
  },
  {
    id: "#ST-1023",
    guest: "Sanjana Thapa",
    hotel: "Pokhara Lakeside Resort",
    date: "23 Oct 2026",
    amount: 8500,
    status: "Pending",
  },
  {
    id: "#ST-1022",
    guest: "Rohan Shrestha",
    hotel: "Kathmandu Heritage Inn",
    date: "22 Oct 2026",
    amount: 6200,
    status: "Cancelled",
  },
  {
    id: "#ST-1021",
    guest: "Priya Karki",
    hotel: "Everest View Lodge",
    date: "21 Oct 2026",
    amount: 15000,
    status: "Confirmed",
  },
];

const statusStyles = {
  Confirmed: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Cancelled: "bg-red-50 text-red-700",
};

const money = (amount) => `NPR ${Number(amount || 0).toLocaleString("en-NP")}`;

export default function AdminDashboard() {
  const [allHotels, setAllHotels] = useState(() => getStoredHotels(hotels));

  useEffect(() => {
    const refreshHotels = () => {
      setAllHotels(getStoredHotels(hotels));
    };

    refreshHotels();

    return subscribeToHotelChanges(refreshHotels);
  }, []);

  const activeHotels = allHotels.filter(
    (hotel) => hotel.status?.toLowerCase() !== "inactive",
  );

  const inactiveHotels = allHotels.length - activeHotels.length;

  const ratedHotels = allHotels.filter((hotel) => Number(hotel.rating) > 0);

  const averageRating = ratedHotels.length
    ? (
        ratedHotels.reduce((total, hotel) => total + Number(hotel.rating), 0) /
        ratedHotels.length
      ).toFixed(1)
    : "—";

  const confirmedBookings = bookings.filter(
    (booking) => booking.status === "Confirmed",
  ).length;

  const demoRevenue = bookings
    .filter((booking) => booking.status === "Confirmed")
    .reduce((total, booking) => total + booking.amount, 0);

  const stats = [
    {
      title: "Total Hotels",
      value: allHotels.length.toLocaleString("en-NP"),
      detail: `${activeHotels.length} active · ${inactiveHotels} inactive`,
      icon: Hotel,
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "Demo Bookings",
      value: bookings.length.toLocaleString("en-NP"),
      detail: `${confirmedBookings} confirmed`,
      icon: CalendarCheck,
      color: "bg-teal-100 text-teal-700",
    },
    {
      title: "Average Rating",
      value: averageRating,
      detail: `${ratedHotels.length} hotels rated`,
      icon: Star,
      color: "bg-violet-100 text-violet-700",
    },
    {
      title: "Demo Revenue",
      value: money(demoRevenue),
      detail: "From confirmed demo bookings",
      icon: Wallet,
      color: "bg-amber-100 text-amber-700",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-teal-700">OVERVIEW</p>

          <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Welcome back! Here's your Stayora hotel business overview.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          <span className="font-medium">Today</span>
          <span className="mx-2 text-slate-300">|</span>
          {new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className={`rounded-xl p-3 ${stat.color}`}>
                  <Icon size={22} />
                </div>

                <ArrowUpRight size={18} className="text-slate-400" />
              </div>

              <p className="mt-5 text-sm text-slate-500">{stat.title}</p>

              <h3 className="mt-1 break-words text-2xl font-bold text-slate-900">
                {stat.value}
              </h3>

              <p className="mt-2 text-xs text-slate-500">{stat.detail}</p>
            </div>
          );
        })}
      </div>

      {/* Hotel inventory summary */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Hotel inventory
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Current hotel availability in your admin list.
            </p>
          </div>

          <Hotel className="text-teal-700" size={24} />
        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-teal-600 transition-all"
            style={{
              width: allHotels.length
                ? `${(activeHotels.length / allHotels.length) * 100}%`
                : "0%",
            }}
          />
        </div>

        <div className="mt-3 flex flex-wrap justify-between gap-2 text-sm">
          <span className="flex items-center gap-2 text-slate-600">
            <CheckCircle2 size={16} className="text-teal-600" />
            {activeHotels.length} active hotels
          </span>

          <span className="flex items-center gap-2 text-slate-600">
            <XCircle size={16} className="text-slate-400" />
            {inactiveHotels} inactive hotels
          </span>
        </div>
      </section>

      {/* Recent demo bookings */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Recent Bookings
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Sample reservations for dashboard preview.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock3 size={17} />
            Demo activity
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Booking ID</th>
                <th className="px-6 py-4 font-semibold">Guest</th>
                <th className="px-6 py-4 font-semibold">Hotel</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {bookings.map((booking) => (
                <tr key={booking.id} className="transition hover:bg-slate-50">
                  <td className="px-6 py-4 font-semibold text-teal-700">
                    {booking.id}
                  </td>

                  <td className="px-6 py-4 font-medium text-slate-800">
                    {booking.guest}
                  </td>

                  <td className="px-6 py-4 text-slate-600">{booking.hotel}</td>

                  <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                    {booking.date}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-800">
                    {money(booking.amount)}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                        statusStyles[booking.status] ||
                        "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-6 py-4 text-xs text-slate-500">
          Demo records only. Actual reservations and revenue will be connected
          when the booking data layer is implemented.
        </div>
      </section>

      {/* Next steps */}
      <div className="rounded-2xl border border-teal-100 bg-teal-50 p-5 sm:p-6">
        <h3 className="font-bold text-teal-950">Next step</h3>

        <p className="mt-1 text-sm leading-6 text-teal-900">
          Upgrade hotel management with searchable listings, category filters,
          improved add/edit forms, and safer delete actions.
        </p>
      </div>
    </div>
  );
}
