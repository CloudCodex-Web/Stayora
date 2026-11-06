import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  Mail,
  CalendarDays,
  ShieldCheck,
  UserRound,
  RefreshCw,
} from "lucide-react";

import { getUsers, subscribeToUserChanges } from "../../utils/users";

function ManageUsers() {
  const [users, setUsers] = useState(() => getUsers());
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  useEffect(() => {
    const refreshUsers = () => setUsers(getUsers());
    return subscribeToUserChanges(refreshUsers);
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        (user.name || "").toLowerCase().includes(query) ||
        (user.email || "").toLowerCase().includes(query);

      const matchesRole = roleFilter === "All" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const admins = users.filter((user) => user.role === "Admin").length;

  const regularUsers = users.filter((user) => user.role !== "Admin").length;

  function formatDate(date) {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleDateString("en", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  const cardStyle =
    "rounded-2xl border border-white/[0.07] bg-[#191727]/80 shadow-[0_8px_30px_rgba(0,0,0,0.15)]";

  const inputStyle =
    "w-full rounded-xl border border-white/[0.08] bg-[#11101c] py-3 text-sm text-gray-200 outline-none transition placeholder:text-gray-500 focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/10";

  return (
    <div className="min-h-screen bg-[#11101c] p-4 text-gray-200 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-400">
              Administration
            </p>

            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white">
              Manage Users
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              View and manage accounts registered on Stayora.
            </p>
          </div>

          <button
            onClick={() => setUsers(getUsers())}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-[#191727] px-4 py-3 text-sm font-semibold text-gray-300 shadow-lg transition hover:border-purple-500/40 hover:bg-[#211d35] hover:text-white"
          >
            <RefreshCw size={16} />
            Refresh users
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            title="Total Users"
            value={users.length}
            icon={<Users size={22} />}
            accent="purple"
          />

          <StatCard
            title="Regular Users"
            value={regularUsers}
            icon={<UserRound size={22} />}
            accent="teal"
          />

          <StatCard
            title="Administrators"
            value={admins}
            icon={<ShieldCheck size={22} />}
            accent="blue"
          />
        </div>

        {/* Search and Filter */}
        <div className={`${cardStyle} p-4 sm:p-5`}>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or email..."
                className={`${inputStyle} pl-11 pr-4`}
              />
            </div>

            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="rounded-xl border border-white/[0.08] bg-[#11101c] px-4 py-3 text-sm text-gray-300 outline-none transition focus:border-purple-500/60"
            >
              <option value="All">All roles</option>
              <option value="User">Regular users</option>
              <option value="Admin">Administrators</option>
            </select>
          </div>
        </div>

        {/* User List */}
        <div className={`${cardStyle} overflow-hidden`}>
          <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
            <div>
              <h2 className="font-bold text-white">Registered Accounts</h2>
              <p className="mt-1 text-xs text-gray-500">
                Overview of Stayora accounts
              </p>
            </div>

            <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-300">
              {filteredUsers.length} found
            </span>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-[#211d35] text-gray-500">
                <Users size={27} />
              </div>

              <h3 className="mt-4 font-bold text-white">No users found</h3>

              <p className="mt-2 text-sm text-gray-500">
                {users.length === 0
                  ? "New accounts will appear here after signup."
                  : "Try a different search term or role filter."}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left">
                  <thead className="bg-[#211d35]/70 text-xs uppercase tracking-wider text-gray-400">
                    <tr>
                      <th className="px-6 py-4 font-semibold">User</th>
                      <th className="px-6 py-4 font-semibold">Role</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold">Registered</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/[0.06]">
                    {filteredUsers.map((user, index) => (
                      <tr
                        key={user.id || user.email || index}
                        className="transition hover:bg-white/[0.025]"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={user.name} />

                            <div>
                              <p className="font-semibold text-gray-200">
                                {user.name || "Unnamed user"}
                              </p>

                              <p className="mt-1 text-sm text-gray-500">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <RoleBadge role={user.role} />
                        </td>

                        <td className="px-6 py-4">
                          <StatusBadge status={user.status} />
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-400">
                          {formatDate(user.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="divide-y divide-white/[0.06] md:hidden">
                {filteredUsers.map((user, index) => (
                  <div
                    key={user.id || user.email || index}
                    className="space-y-4 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} />

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-gray-200">
                          {user.name || "Unnamed user"}
                        </p>

                        <p className="mt-1 flex items-center gap-1 truncate text-sm text-gray-500">
                          <Mail size={13} />
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <RoleBadge role={user.role} />
                      <StatusBadge status={user.status} />
                    </div>

                    <p className="flex items-center gap-2 text-xs text-gray-500">
                      <CalendarDays size={14} />
                      Registered {formatDate(user.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Demo Notice */}
        <div className="rounded-xl border border-white/[0.06] bg-[#191727]/50 px-4 py-3">
          <p className="text-xs leading-5 text-gray-500">
            User records are stored in this browser for the current frontend
            demo. A backend database is required for shared, secure account
            management.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, accent }) {
  const accentStyles = {
    purple: "border-purple-500/20 bg-purple-500/10 text-purple-400",
    teal: "border-teal-500/20 bg-teal-500/10 text-teal-400",
    blue: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  };

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#191727]/80 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.15)]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-400">{title}</p>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl border ${accentStyles[accent]}`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-4 text-3xl font-extrabold text-white">{value}</p>
    </div>
  );
}

function Avatar({ name }) {
  const initial = (name || "U").trim().charAt(0).toUpperCase() || "U";

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-purple-500/20 bg-gradient-to-br from-purple-500/20 to-teal-500/10 font-bold text-purple-300">
      {initial}
    </div>
  );
}

function RoleBadge({ role }) {
  const isAdmin = role === "Admin";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        isAdmin
          ? "border-purple-500/20 bg-purple-500/10 text-purple-300"
          : "border-blue-500/20 bg-blue-500/10 text-blue-300"
      }`}
    >
      {role || "User"}
    </span>
  );
}

function StatusBadge({ status }) {
  const isActive = (status || "Active") === "Active";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
        isActive
          ? "border-teal-500/20 bg-teal-500/10 text-teal-300"
          : "border-gray-500/20 bg-gray-500/10 text-gray-400"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isActive ? "bg-teal-400" : "bg-gray-500"
        }`}
      />
      {status || "Active"}
    </span>
  );
}

export default ManageUsers;
