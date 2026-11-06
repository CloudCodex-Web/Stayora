import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Search,
  Trash2,
  CalendarDays,
  RefreshCw,
  Hotel,
  CalendarCheck,
  Users,
  Star,
  Settings,
  Clock3,
} from "lucide-react";

import {
  getActivityLogs,
  clearActivityLogs,
  subscribeToActivityLogs,
} from "../../utils/activityLogs";

const formatDate = (date) => {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Invalid date";
  }

  return parsedDate.toLocaleString();
};

const categoryStyles = {
  Booking: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Hotel: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  Review: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  User: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  Settings: "bg-pink-500/10 text-pink-400 border-pink-500/20",
};

const getCategoryStyle = (category) =>
  categoryStyles[category] ||
  "bg-slate-500/10 text-slate-400 border-slate-500/20";

function ActivityLogs() {
  const [logs, setLogs] = useState(getActivityLogs);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");

  useEffect(() => {
    const unsubscribe = subscribeToActivityLogs(() => {
      setLogs(getActivityLogs());
    });

    return unsubscribe;
  }, []);

  const filteredLogs = useMemo(() => {
    const now = new Date();

    return logs.filter((log) => {
      const searchText = [log.action, log.category, log.description, log.target]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());

      const matchesCategory = category === "All" || log.category === category;

      const logDate = new Date(log.createdAt);

      if (Number.isNaN(logDate.getTime())) {
        return false;
      }

      let matchesDate = true;

      if (dateFilter === "Today") {
        matchesDate = logDate.toDateString() === now.toDateString();
      } else if (dateFilter === "Last 7 days") {
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);

        matchesDate = logDate >= sevenDaysAgo && logDate <= now;
      } else if (dateFilter === "Last 30 days") {
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);

        matchesDate = logDate >= thirtyDaysAgo && logDate <= now;
      }

      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [logs, search, category, dateFilter]);

  const handleClearLogs = () => {
    if (logs.length === 0) return;

    const confirmed = window.confirm(
      "Are you sure you want to clear all activity logs?",
    );

    if (confirmed) {
      clearActivityLogs();
    }
  };

  const stats = [
    {
      label: "Total Activities",
      value: logs.length,
      icon: Activity,
      iconColor: "text-blue-400",
      iconBg: "bg-blue-500/10",
      accent: "from-blue-500 to-cyan-500",
    },
    {
      label: "Hotel Activities",
      value: logs.filter((log) => log.category === "Hotel").length,
      icon: Hotel,
      iconColor: "text-violet-400",
      iconBg: "bg-violet-500/10",
      accent: "from-violet-500 to-purple-500",
    },
    {
      label: "Booking Activities",
      value: logs.filter((log) => log.category === "Booking").length,
      icon: CalendarCheck,
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/10",
      accent: "from-emerald-500 to-teal-500",
    },
  ];

  const categories = ["All", "Booking", "Hotel", "Review", "User", "Settings"];

  const dateOptions = ["All", "Today", "Last 7 days", "Last 30 days"];

  return (
    <div className="min-h-screen space-y-7 text-slate-200">
      {/* Header */}
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-violet-400" />

            <p className="text-sm font-medium text-violet-400">Stayora Admin</p>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white">
            Activity Logs
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Track activities and changes made across Stayora.
          </p>
        </div>

        <button
          onClick={handleClearLogs}
          disabled={logs.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-5 py-3 text-sm font-semibold text-rose-400 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2 size={17} />
          Clear Logs
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">{stat.label}</p>

                  <h2 className="mt-3 text-3xl font-bold text-white">
                    {stat.value}
                  </h2>
                </div>

                <div className={`rounded-xl p-3 ${stat.iconBg}`}>
                  <Icon size={23} className={stat.iconColor} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity Table */}
      <section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#191727] shadow-xl shadow-black/10">
        {/* Filters Header */}
        <div className="border-b border-white/[0.06] p-5">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-white">All Activities</h2>

              <p className="mt-1 text-sm text-slate-400">
                Search and filter your admin activity history.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Live updates enabled
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {/* Search */}
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                placeholder="Search activities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-white/[0.07] bg-[#11101c] py-3 pl-10 pr-4 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-violet-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border border-white/[0.07] bg-[#11101c] px-4 py-3 text-sm text-slate-300 outline-none transition focus:border-violet-500"
            >
              {categories.map((item) => (
                <option key={item} value={item} className="bg-[#191727]">
                  {item === "All" ? "All Categories" : item}
                </option>
              ))}
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="rounded-xl border border-white/[0.07] bg-[#11101c] px-4 py-3 text-sm text-slate-300 outline-none transition focus:border-violet-500"
            >
              {dateOptions.map((item) => (
                <option key={item} value={item} className="bg-[#191727]">
                  {item === "All" ? "All Time" : item}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-[#11101c]/70 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Activity</th>
                <th className="px-5 py-4 font-semibold">Category</th>
                <th className="px-5 py-4 font-semibold">Description</th>
                <th className="px-5 py-4 font-semibold">Target</th>
                <th className="px-5 py-4 font-semibold">Date & Time</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/[0.05]">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="transition hover:bg-white/[0.02]">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
                          <Activity size={17} className="text-violet-400" />
                        </div>

                        <span className="text-sm font-semibold text-slate-200">
                          {log.action || "Activity"}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getCategoryStyle(
                          log.category,
                        )}`}
                      >
                        {log.category || "Other"}
                      </span>
                    </td>

                    <td className="max-w-sm px-5 py-4 text-sm leading-relaxed text-slate-400">
                      {log.description || "No description"}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-400">
                      {log.target || "—"}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <CalendarDays
                          size={15}
                          className="shrink-0 text-slate-500"
                        />

                        {formatDate(log.createdAt)}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-5 py-16 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10">
                      <Activity size={30} className="text-violet-400" />
                    </div>

                    <h3 className="mt-4 font-semibold text-white">
                      No activities found
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Try changing your search or filter settings.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-2 border-t border-white/[0.06] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-300">
              {filteredLogs.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-300">{logs.length}</span>{" "}
            activities
          </p>

          <button
            onClick={() => {
              setSearch("");
              setCategory("All");
              setDateFilter("All");
            }}
            className="inline-flex items-center gap-2 text-sm font-medium text-violet-400 transition hover:text-violet-300"
          >
            <RefreshCw size={15} />
            Reset Filters
          </button>
        </div>
      </section>

      {/* Information Notice */}
      <div className="flex items-start gap-3 rounded-2xl border border-blue-500/15 bg-blue-500/[0.06] p-4">
        <Activity size={19} className="mt-0.5 shrink-0 text-blue-400" />

        <div>
          <p className="text-sm font-semibold text-blue-300">
            Activity Tracking
          </p>

          <p className="mt-1 text-sm leading-relaxed text-slate-400">
            Activity logs are stored locally in this browser for this demo.
            Clearing logs removes the saved activity history.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ActivityLogs;
