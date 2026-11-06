import { useEffect, useMemo, useState } from "react";
import {
  FileSpreadsheet,
  CalendarDays,
  Wallet,
  CalendarCheck,
  Hotel,
  Download,
  TrendingUp,
  Clock3,
  CheckCircle2,
  XCircle,
  Ban,
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

const inputStyle =
  "mt-2 w-full rounded-xl border border-white/10 bg-[#11101c] px-4 py-3 text-sm text-slate-200 outline-none transition focus:border-violet-500";

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
      // Today's start date is already set.
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

  // Estimated booking revenue, not verified payment revenue.
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
      iconColor: "text-blue-400",
      iconBg: "bg-blue-500/10",
      accent: "from-blue-500 to-cyan-500",
    },
    {
      label: "Accepted Bookings",
      value: accepted.length,
      icon: Hotel,
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/10",
      accent: "from-emerald-500 to-teal-500",
    },
    {
      label: "Pending Bookings",
      value: pending.length,
      icon: CalendarDays,
      iconColor: "text-amber-400",
      iconBg: "bg-amber-500/10",
      accent: "from-amber-500 to-orange-500",
    },
    {
      label: "Estimated Revenue",
      value: money(totalRevenue),
      icon: Wallet,
      iconColor: "text-violet-400",
      iconBg: "bg-violet-500/10",
      accent: "from-violet-500 to-purple-500",
    },
  ];

  const statusItems = [
    {
      label: "Accepted",
      count: accepted.length,
      color: "bg-emerald-500",
      textColor: "text-emerald-400",
      icon: CheckCircle2,
    },
    {
      label: "Pending",
      count: pending.length,
      color: "bg-amber-500",
      textColor: "text-amber-400",
      icon: Clock3,
    },
    {
      label: "Rejected",
      count: rejected.length,
      color: "bg-rose-500",
      textColor: "text-rose-400",
      icon: XCircle,
    },
    {
      label: "Cancelled",
      count: cancelled.length,
      color: "bg-slate-500",
      textColor: "text-slate-400",
      icon: Ban,
    },
  ];

  const dateOptions = [
    ["today", "Today"],
    ["7", "Last 7 days"],
    ["30", "Last 30 days"],
    ["month", "This month"],
    ["all", "All time"],
    ["custom", "Custom range"],
  ];

  return (
    <div className="min-h-screen space-y-7 text-slate-200">
      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-violet-400" />
            <p className="text-sm font-medium text-violet-400">Stayora Admin</p>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white">
            Reports
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Track booking activity, revenue estimates, and hotel performance.
          </p>
        </div>

        <button
          onClick={exportCSV}
          disabled={filteredBookings.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:from-violet-500 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Date Filters */}
      <section className="rounded-2xl border border-white/[0.07] bg-[#191727] p-5 shadow-xl shadow-black/10">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-violet-500/10 p-2.5">
            <CalendarDays size={19} className="text-violet-400" />
          </div>

          <div>
            <h2 className="font-semibold text-white">Report Period</h2>
            <p className="mt-1 text-xs text-slate-500">
              Choose the date range for your report.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {dateOptions.map(([value, label]) => (
            <button
              key={value}
              onClick={() => setDateRange(value)}
              className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                dateRange === value
                  ? "border-violet-500/40 bg-violet-500/15 text-violet-300 shadow-lg shadow-violet-950/10"
                  : "border-white/[0.06] bg-[#11101c] text-slate-400 hover:border-violet-500/30 hover:bg-violet-500/5 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {dateRange === "custom" && (
          <div className="mt-5 grid gap-4 border-t border-white/[0.06] pt-5 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-400">
              Start date
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className={inputStyle}
              />
            </label>

            <label className="text-sm font-medium text-slate-400">
              End date
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(event) => setEndDate(event.target.value)}
                className={inputStyle}
              />
            </label>
          </div>
        )}
      </section>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#191727] p-5 shadow-xl shadow-black/10 transition hover:-translate-y-1 hover:border-violet-500/20"
            >
              <div
                className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${stat.accent} opacity-70`}
              />

              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-slate-400">{stat.label}</p>

                  <h3 className="mt-3 break-words text-2xl font-bold text-white">
                    {stat.value}
                  </h3>
                </div>

                <div className={`shrink-0 rounded-xl p-3 ${stat.iconBg}`}>
                  <Icon size={23} className={stat.iconColor} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Booking Status Report */}
      <section className="rounded-2xl border border-white/[0.07] bg-[#191727] p-5 shadow-xl shadow-black/10">
        <div>
          <h2 className="text-lg font-bold text-white">
            Booking Status Report
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Booking distribution for the selected period.
          </p>
        </div>

        {/* Status Bar */}
        <div className="mt-6 flex h-4 overflow-hidden rounded-full bg-[#11101c]">
          {statusItems.map((item) => (
            <div
              key={item.label}
              className={`${item.color} transition-all duration-500`}
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

        {/* Status Details */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statusItems.map((item) => {
            const Icon = item.icon;

            const percentage = filteredBookings.length
              ? ((item.count / filteredBookings.length) * 100).toFixed(1)
              : "0.0";

            return (
              <div
                key={item.label}
                className="rounded-xl border border-white/[0.05] bg-[#11101c]/70 p-4 transition hover:border-white/10"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${item.color}`}
                    />
                    <span className="text-sm text-slate-400">{item.label}</span>
                  </div>

                  <Icon size={17} className={item.textColor} />
                </div>

                <div className="mt-3 flex items-end justify-between">
                  <p className="text-2xl font-bold text-white">{item.count}</p>

                  <p className="text-xs text-slate-500">{percentage}%</p>
                </div>
              </div>
            );
          })}
        </div>

        {filteredBookings.length === 0 && (
          <p className="mt-5 text-center text-sm text-slate-500">
            No bookings found for this period.
          </p>
        )}
      </section>

      {/* Hotel Performance */}
      <section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#191727] shadow-xl shadow-black/10">
        <div className="flex flex-col gap-3 border-b border-white/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-teal-500/10 p-2.5">
              <TrendingUp size={20} className="text-teal-400" />
            </div>

            <div>
              <h2 className="font-bold text-white">Hotel Performance</h2>
              <p className="mt-1 text-sm text-slate-400">
                Ranked by accepted booking revenue.
              </p>
            </div>
          </div>

          <span className="w-fit rounded-lg border border-teal-500/20 bg-teal-500/10 px-3 py-1.5 text-xs font-medium text-teal-400">
            {hotelPerformance.length} Hotels
          </span>
        </div>

        {hotelPerformance.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10">
              <FileSpreadsheet size={30} className="text-violet-400" />
            </div>

            <h3 className="mt-4 font-semibold text-white">
              No accepted bookings
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Hotel performance will appear here when bookings are accepted.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[550px] text-left">
              <thead className="bg-[#11101c]/70 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Hotel</th>
                  <th className="px-5 py-4 font-semibold">Accepted Bookings</th>
                  <th className="px-5 py-4 font-semibold">Estimated Revenue</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/[0.05]">
                {hotelPerformance.map((hotel, index) => (
                  <tr
                    key={hotel.name}
                    className="transition hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold ${
                            index === 0
                              ? "bg-violet-500/15 text-violet-300"
                              : "bg-[#252238] text-slate-400"
                          }`}
                        >
                          {index + 1}
                        </span>

                        <span className="font-medium text-slate-200">
                          {hotel.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-lg bg-blue-500/10 px-3 py-1.5 text-sm font-medium text-blue-400">
                        {hotel.bookings}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-semibold text-emerald-400">
                      {money(hotel.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Revenue Notice */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-500/15 bg-amber-500/[0.06] p-4">
        <Wallet size={19} className="mt-0.5 shrink-0 text-amber-400" />

        <div>
          <p className="text-sm font-semibold text-amber-300">
            Revenue Calculation Notice
          </p>

          <p className="mt-1 text-sm leading-relaxed text-slate-400">
            Revenue is calculated from accepted or confirmed booking totals. It
            represents estimated booking value, not verified payment
            collections.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminReports;
