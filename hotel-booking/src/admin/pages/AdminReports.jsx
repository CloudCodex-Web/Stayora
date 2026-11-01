import { useEffect, useMemo, useState } from "react";
import {
  FileSpreadsheet,
  CalendarDays,
  Wallet,
  CalendarCheck,
  Hotel,
  Download,
  TrendingUp,
} from "lucide-react";

import { getBookings, subscribeToBookingChanges } from "../../utils/bookings";

const money = (amount) => `NPR ${Number(amount || 0).toLocaleString("en-IN")}`;

const getHotelName = (booking) =>
  booking.hotelName || booking.hotel?.name || booking.hotel || "Unknown Hotel";

const getDate = (booking) => {
  const date = new Date(booking.createdAt);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isAccepted = (booking) =>
  booking.status === "Accepted" || booking.status === "Confirmed";

function AdminReports() {
  const [bookings, setBookings] = useState(getBookings);
  const [dateRange, setDateRange] = useState("30");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToBookingChanges(() => {
      setBookings(getBookings());
    });

    return unsubscribe;
  }, []);

  const filteredBookings = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);

    if (dateRange === "today") {
      // Keep today's start date.
    } else if (dateRange === "7") {
      start.setDate(start.getDate() - 6);
    } else if (dateRange === "30") {
      start.setDate(start.getDate() - 29);
    } else if (dateRange === "month") {
      start.setDate(1);
    }

    return bookings.filter((booking) => {
      const created = getDate(booking);
      if (!created) return false;

      if (dateRange === "all") return true;

      if (dateRange === "custom") {
        if (startDate) {
          const customStart = new Date(`${startDate}T00:00:00`);
          if (created < customStart) return false;
        }

        if (endDate) {
          const customEnd = new Date(`${endDate}T23:59:59.999`);
          if (created > customEnd) return false;
        }

        return true;
      }

      return created >= start && created <= now;
    });
  }, [bookings, dateRange, startDate, endDate]);

  const accepted = filteredBookings.filter(isAccepted);
  const pending = filteredBookings.filter(
    (booking) => booking.status === "Pending",
  );
  const rejected = filteredBookings.filter(
    (booking) => booking.status === "Rejected",
  );
  const cancelled = filteredBookings.filter(
    (booking) => booking.status === "Cancelled",
  );

  // This is estimated booking revenue, not verified payment revenue.
  const totalRevenue = accepted.reduce(
    (total, booking) => total + Number(booking.total || 0),
    0,
  );

  const hotelPerformance = Object.values(
    accepted.reduce((result, booking) => {
      const name = getHotelName(booking);

      if (!result[name]) {
        result[name] = {
          name,
          bookings: 0,
          revenue: 0,
        };
      }

      result[name].bookings += 1;
      result[name].revenue += Number(booking.total || 0);

      return result;
    }, {}),
  ).sort((a, b) => b.revenue - a.revenue);

  const exportCSV = () => {
    const rows = [
      [
        "Booking ID",
        "Guest",
        "Email",
        "Hotel",
        "Check-in",
        "Check-out",
        "Guests",
        "Total (NPR)",
        "Status",
        "Created At",
      ],
      ...filteredBookings.map((booking) => [
        booking.bookingId || "",
        booking.userName || "",
        booking.userEmail || "",
        getHotelName(booking),
        booking.checkIn || "",
        booking.checkOut || "",
        booking.guests || "",
        booking.total || 0,
        booking.status || "",
        booking.createdAt || "",
      ]),
    ];

    const csv = rows
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `stayora-booking-report-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    link.click();
    URL.revokeObjectURL(url);
  };

  const stats = [
    {
      label: "Total Bookings",
      value: filteredBookings.length,
      icon: CalendarCheck,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Accepted Bookings",
      value: accepted.length,
      icon: Hotel,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Pending Bookings",
      value: pending.length,
      icon: CalendarDays,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Estimated Revenue",
      value: money(totalRevenue),
      icon: Wallet,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  const statusItems = [
    { label: "Accepted", count: accepted.length, color: "bg-emerald-500" },
    { label: "Pending", count: pending.length, color: "bg-amber-500" },
    { label: "Rejected", count: rejected.length, color: "bg-red-500" },
    { label: "Cancelled", count: cancelled.length, color: "bg-slate-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-600">Stayora Admin</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Reports</h1>
          <p className="mt-1 text-sm text-slate-500">
            Review booking activity and hotel performance.
          </p>
        </div>

        <button
          onClick={exportCSV}
          disabled={filteredBookings.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Date filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center gap-2">
          <CalendarDays size={19} className="text-indigo-600" />
          <h2 className="font-semibold text-slate-800">Report Period</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            ["today", "Today"],
            ["7", "Last 7 days"],
            ["30", "Last 30 days"],
            ["month", "This month"],
            ["all", "All time"],
            ["custom", "Custom range"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setDateRange(value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                dateRange === value
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {dateRange === "custom" && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-slate-600">
              Start date
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-indigo-500"
              />
            </label>

            <label className="text-sm text-slate-600">
              End date
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(event) => setEndDate(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-indigo-500"
              />
            </label>
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900">
                    {stat.value}
                  </h3>
                </div>

                <div className={`rounded-xl p-3 ${stat.color}`}>
                  <Icon size={22} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Booking status */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-bold text-slate-900">
          Booking Status Report
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Status breakdown for the selected period.
        </p>

        <div className="mt-5 flex h-4 overflow-hidden rounded-full bg-slate-100">
          {statusItems.map((item) => (
            <div
              key={item.label}
              className={item.color}
              style={{
                width: `${
                  filteredBookings.length
                    ? (item.count / filteredBookings.length) * 100
                    : 0
                }%`,
              }}
              title={`${item.label}: ${item.count}`}
            />
          ))}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statusItems.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className={`h-3 w-3 rounded-full ${item.color}`} />
              <div>
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="font-bold text-slate-800">{item.count}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hotel performance */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-100 p-5">
          <TrendingUp size={20} className="text-indigo-600" />
          <div>
            <h2 className="font-bold text-slate-900">Hotel Performance</h2>
            <p className="text-sm text-slate-500">
              Ranked by accepted booking revenue.
            </p>
          </div>
        </div>

        {hotelPerformance.length === 0 ? (
          <div className="p-10 text-center">
            <FileSpreadsheet size={35} className="mx-auto text-slate-300" />
            <p className="mt-3 font-medium text-slate-700">
              No accepted bookings in this period
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Hotel performance will appear when bookings are accepted.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-left">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Hotel</th>
                  <th className="px-5 py-4">Accepted Bookings</th>
                  <th className="px-5 py-4">Estimated Revenue</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {hotelPerformance.map((hotel, index) => (
                  <tr key={hotel.name}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-sm font-bold text-indigo-600">
                          {index + 1}
                        </span>
                        <span className="font-medium text-slate-800">
                          {hotel.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {hotel.bookings}
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {money(hotel.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Report note */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Revenue is calculated from accepted or confirmed booking totals. It
        represents estimated booking value, not verified payment collections.
      </div>
    </div>
  );
}

export default AdminReports;
