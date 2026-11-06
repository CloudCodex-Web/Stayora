import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  X,
  CalendarCheck,
  Hotel,
  UserRound,
  ArrowUpRight,
  Command,
} from "lucide-react";
import { getBookings } from "../../utils/bookings";

const categories = [
  { id: "all", label: "All" },
  { id: "bookings", label: "Bookings" },
  { id: "hotels", label: "Hotels" },
  { id: "users", label: "Users" },
];

function readLocalData(keyword) {
  const results = [];

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (!key || !key.toLowerCase().includes(keyword)) continue;

      if (
        /auth|password|token|setting|notification|activity|profile/i.test(key)
      ) {
        continue;
      }

      try {
        const parsed = JSON.parse(localStorage.getItem(key));

        if (Array.isArray(parsed)) {
          results.push(...parsed);
        } else if (parsed && typeof parsed === "object") {
          const values = Object.values(parsed);

          if (values.every((value) => value && typeof value === "object")) {
            results.push(...values);
          } else {
            results.push(parsed);
          }
        }
      } catch {
        // Ignore localStorage values that are not JSON.
      }
    }
  } catch {
    return [];
  }

  return results;
}

function getSearchResults(query) {
  const normalized = query.toLowerCase().trim();

  if (!normalized) return [];

  const matches = (value) =>
    String(value ?? "")
      .toLowerCase()
      .includes(normalized);

  const results = [];

  // Bookings
  try {
    getBookings().forEach((booking) => {
      const searchable = [
        booking.bookingId,
        booking.userName,
        booking.userEmail,
        booking.hotelName,
        booking.hotel?.name,
        booking.status,
        booking.roomType,
      ];

      if (searchable.some(matches)) {
        results.push({
          id: booking.bookingId,
          type: "bookings",
          title: booking.bookingId || "Booking",
          subtitle: `${booking.hotelName || booking.hotel?.name || "Hotel"} · ${
            booking.userName || "Guest"
          }`,
          status: booking.status,
          path: "/admin/bookings",
          icon: CalendarCheck,
        });
      }
    });
  } catch {
    // Keep search usable if booking data is unavailable.
  }

  // Hotels
  readLocalData("hotel").forEach((hotel, index) => {
    const searchable = [
      hotel.name,
      hotel.location,
      hotel.city,
      hotel.address,
      hotel.description,
    ];

    if (searchable.some(matches)) {
      results.push({
        id: hotel.id || `hotel-${index}`,
        type: "hotels",
        title: hotel.name || "Hotel",
        subtitle: hotel.location || hotel.address || "Hotel listing",
        path: "/admin/hotels",
        icon: Hotel,
      });
    }
  });

  // Users and guests
  [...readLocalData("user"), ...readLocalData("guest")].forEach(
    (user, index) => {
      const searchable = [user.name, user.fullName, user.email, user.phone];

      if (searchable.some(matches)) {
        results.push({
          id: user.id || user.email || `user-${index}`,
          type: "users",
          title: user.name || user.fullName || user.email || "User",
          subtitle: user.email || user.phone || "Registered user",
          path: "/admin/users",
          icon: UserRound,
        });
      }
    },
  );

  return results.slice(0, 30);
}

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const navigate = useNavigate();

  useEffect(() => {
    function handleShortcut(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }

      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleShortcut);

    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  const results = useMemo(() => getSearchResults(query), [query]);

  const filteredResults =
    activeCategory === "all"
      ? results
      : results.filter((result) => result.type === activeCategory);

  function openResult(path) {
    setOpen(false);
    setQuery("");
    setActiveCategory("all");
    navigate(path);
  }

  function closeSearch() {
    setOpen(false);
    setQuery("");
    setActiveCategory("all");
  }

  return (
    <>
      {/* Desktop Navbar Search Trigger */}
      <button
        onClick={() => setOpen(true)}
        title="Global Search (Ctrl + K)"
        aria-label="Open global search"
        className="hidden min-w-[240px] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-slate-400 transition hover:border-purple-400/30 hover:bg-purple-400/10 hover:text-white sm:flex lg:min-w-[280px] xl:min-w-[320px]"
      >
        <Search size={17} />

        <span className="hidden text-xs md:inline">Search anything...</span>

        <span className="ml-auto flex items-center gap-1 rounded-md border border-white/10 bg-black/20 px-1.5 py-1 text-[10px] text-slate-500">
          <Command size={10} /> K
        </span>
      </button>

      {/* Mobile Search Trigger */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open search"
        className="rounded-xl border border-white/10 bg-white/[0.05] p-2.5 text-slate-300 transition hover:bg-purple-400/10 sm:hidden"
      >
        <Search size={19} />
      </button>

      {/* Search Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/70 px-3 pt-[12vh] backdrop-blur-sm sm:px-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeSearch();
            }
          }}
        >
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-purple-300/20 bg-[#191727] shadow-2xl shadow-black/60">
            {/* Search Input */}
            <div className="flex items-center gap-3 border-b border-white/10 px-5">
              <Search size={21} className="shrink-0 text-purple-300" />

              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search hotels, bookings, users..."
                className="h-16 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />

              <button
                onClick={closeSearch}
                aria-label="Close search"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-white/10 hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto border-b border-white/[0.07] px-4 py-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeCategory === category.id
                      ? "bg-purple-500/20 text-purple-200"
                      : "text-slate-500 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {/* Results */}
            <div className="max-h-[55vh] min-h-44 overflow-y-auto p-3">
              {!query.trim() ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-300/15 bg-purple-400/10">
                    <Search size={22} className="text-purple-300" />
                  </div>

                  <p className="text-sm font-semibold text-slate-200">
                    Search your workspace
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Find bookings, hotels and registered users.
                  </p>
                </div>
              ) : filteredResults.length === 0 ? (
                <div className="py-12 text-center">
                  <Search size={25} className="mx-auto mb-3 text-slate-600" />

                  <p className="text-sm font-semibold text-slate-300">
                    No results found
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Try another name, email or booking ID.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredResults.map((result) => {
                    const Icon = result.icon;

                    return (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => openResult(result.path)}
                        className="group flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-white/[0.06]"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-300/10 bg-purple-400/[0.08] text-purple-300">
                          <Icon size={18} />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-slate-200 group-hover:text-white">
                            {result.title}
                          </span>

                          <span className="mt-1 block truncate text-xs text-slate-500">
                            {result.subtitle}
                          </span>
                        </span>

                        {result.status && (
                          <span className="rounded-full bg-white/[0.06] px-2 py-1 text-[10px] text-slate-400">
                            {result.status}
                          </span>
                        )}

                        <ArrowUpRight
                          size={16}
                          className="shrink-0 text-slate-600 transition group-hover:text-teal-300"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-white/[0.08] bg-white/[0.02] px-4 py-3">
              <p className="text-[10px] text-slate-500">
                {filteredResults.length} result(s)
              </p>

              <p className="text-[10px] text-slate-600">ESC to close</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
