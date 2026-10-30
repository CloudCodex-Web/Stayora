
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
import {
  getUsers,
  subscribeToUserChanges,
} from "../../utils/users";

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

      const matchesRole =
        roleFilter === "All" || user.role === roleFilter;

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

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
              Administration
            </p>
            <h1 className="mt-1 text-3xl font-extrabold text-gray-900">
              Manage Users
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              View and search accounts registered on Stayora.
            </p>
          </div>

          <button
            onClick={() => setUsers(getUsers())}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-100"
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
          />
          <StatCard
            title="Regular Users"
            value={regularUsers}
            icon={<UserRound size={22} />}
          />
          <StatCard
            title="Administrators"
            value={admins}
            icon={<ShieldCheck size={22} />}
          />
        </div>

        {/* Search and filter */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or email..."
                className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600"
            >
              <option value="All">All roles</option>
              <option value="User">Regular users</option>
              <option value="Admin">Administrators</option>
            </select>
          </div>
        </div>

        {/* User list */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="font-bold text-gray-900">Registered Accounts</h2>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              {filteredUsers.length} found
            </span>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                <Users size={27} />
              </div>
              <h3 className="mt-4 font-bold text-gray-900">
                No users found
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {users.length === 0
                  ? "New accounts will appear here after signup."
                  : "Try a different search term or role filter."}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold">User</th>
                      <th className="px-6 py-4 font-semibold">Role</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold">
                        Registered
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUsers.map((user, index) => (
                      <tr
                        key={user.id || user.email || index}
                        className="transition hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={user.name} />
                            <div>
                              <p className="font-semibold text-gray-900">
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
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="divide-y divide-gray-100 md:hidden">
                {filteredUsers.map((user, index) => (
                  <div
                    key={user.id || user.email || index}
                    className="space-y-4 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-gray-900">
                          {user.name || "Unnamed user"}
                        </p>
                        <p className="flex items-center gap-1 truncate text-sm text-gray-500">
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

        <p className="text-xs leading-5 text-gray-400">
          User records are stored in this browser for the current frontend
          demo. A backend database is required for shared, secure account
          management.
        </p>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
          {icon}
        </div>
      </div>
      <p className="mt-4 text-3xl font-extrabold text-gray-900">{value}</p>
    </div>
  );
}

function Avatar({ name }) {
  const initial = (name || "U").trim().charAt(0).toUpperCase() || "U";

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800">
      {initial}
    </div>
  );
}

function RoleBadge({ role }) {
  const isAdmin = role === "Admin";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        isAdmin
          ? "bg-purple-50 text-purple-700"
          : "bg-blue-50 text-blue-700"
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
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
        isActive
          ? "bg-emerald-50 text-emerald-700"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isActive ? "bg-emerald-500" : "bg-gray-400"
        }`}
      />
      {status || "Active"}
    </span>
  );
}

export default ManageUsers;
