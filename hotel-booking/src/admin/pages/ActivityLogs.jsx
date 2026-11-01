import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Search,
  Trash2,
  CalendarDays,
  RefreshCw,
} from "lucide-react";

import {
  getActivityLogs,
  clearActivityLogs,
  subscribeToActivityLogs,
} from "../../utils/activityLogs";

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
      const matchesSearch = [
        log.action,
        log.category,
        log.description,
        log.target,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory = category === "All" || log.category === category;

      const logDate = new Date(log.createdAt);
      let matchesDate = true;

      if (dateFilter === "Today") {
        matchesDate = logDate.toDateString() === now.toDateString();
      } else if (dateFilter === "Last 7 days") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        matchesDate = logDate >= sevenDaysAgo && logDate <= now;
      } else if (dateFilter === "Last 30 days") {
        const thirtyDaysAgo = new Date();
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

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track activities and changes made in Stayora.
          </p>
        </div>

        <button
          onClick={handleClearLogs}
          disabled={logs.length === 0}
          className="flex items-center justify-center gap-2 rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 size={17} />
          Clear Logs
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Total Activities</p>
            <Activity className="text-blue-600" size={22} />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-gray-900">
            {logs.length}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Hotel Activities</p>
            <RefreshCw className="text-purple-600" size={22} />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-gray-900">
            {logs.filter((log) => log.category === "Hotel").length}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Booking Activities</p>
            <CalendarDays className="text-green-600" size={22} />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-gray-900">
            {logs.filter((log) => log.category === "Booking").length}
          </h2>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search activities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="All">All Categories</option>
            <option value="Booking">Booking</option>
            <option value="Hotel">Hotel</option>
            <option value="Review">Review</option>
            <option value="User">User</option>
            <option value="Settings">Settings</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="All">All Time</option>
            <option value="Today">Today</option>
            <option value="Last 7 days">Last 7 Days</option>
            <option value="Last 30 days">Last 30 Days</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead>
              <tr className="border-b border-gray-200 text-xs uppercase text-gray-500">
                <th className="px-4 py-3 font-semibold">Activity</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Description</th>
                <th className="px-4 py-3 font-semibold">Target</th>
                <th className="px-4 py-3 font-semibold">Date & Time</th>
              </tr>
            </thead>

            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      {log.action}
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        {log.category}
                      </span>
                    </td>
                    <td className="max-w-xs px-4 py-4 text-sm text-gray-600">
                      {log.description}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {log.target || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500">
                      {formatDate(log.createdAt)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-12 text-center">
                    <Activity
                      size={32}
                      className="mx-auto mb-3 text-gray-300"
                    />
                    <p className="font-medium text-gray-700">
                      No activities found
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Activities will appear here when changes are made.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-sm text-gray-500">
          Showing {filteredLogs.length} of {logs.length} activities
        </p>
      </div>
    </div>
  );
}

export default ActivityLogs;
