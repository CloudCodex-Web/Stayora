import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Hotel,
  MapPin,
  Coins,
  Star,
  CheckCircle2,
  Ban,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";

import originalHotels from "../../data/hotels";
import {
  getStoredHotels,
  subscribeToHotelChanges,
} from "../../data/hotelStorage";
import { addActivityLog } from "../../utils/activityLogs";

const STORAGE_KEY = "stayora-admin-hotels";

const starterHotels = [
  {
    id: "hotel-1",
    name: "Himalayan Grand Hotel",
    location: "Kathmandu, Nepal",
    price: 4500,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80",
    status: "Active",
  },
  {
    id: "hotel-2",
    name: "Lakeside Paradise",
    location: "Pokhara, Nepal",
    price: 3500,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=80",
    status: "Active",
  },
  {
    id: "hotel-3",
    name: "Mountain View Resort",
    location: "Nagarkot, Nepal",
    price: 6000,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=900&q=80",
    status: "Inactive",
  },
];

const initialHotels = [...originalHotels, ...starterHotels];

const emptyForm = {
  name: "",
  location: "",
  price: "",
  rating: "4.5",
  image: "",
  status: "Active",
};

const statusStyles = {
  Active: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  Inactive: "border-amber-400/20 bg-amber-400/10 text-amber-300",
};

function createHotelId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `hotel-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeStatus(status) {
  return String(status || "Active").toLowerCase() === "inactive"
    ? "Inactive"
    : "Active";
}

function loadHotels() {
  const storedHotels = getStoredHotels(initialHotels);

  return storedHotels.map((hotel) => ({
    ...hotel,
    status: normalizeStatus(hotel.status),
  }));
}

const cardStyle =
  "rounded-2xl border border-white/[0.07] bg-[#191727]/80 shadow-lg shadow-black/10";

const inputStyle =
  "w-full rounded-xl border border-white/10 bg-[#11101c]/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-500/10";

export default function ManageHotels() {
  const [hotels, setHotels] = useState(loadHotels);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const refreshHotels = () => {
      setHotels(loadHotels());
    };

    return subscribeToHotelChanges(refreshHotels);
  }, []);

  const activeCount = hotels.filter(
    (hotel) => normalizeStatus(hotel.status) === "Active",
  ).length;

  const inactiveCount = hotels.length - activeCount;

  const averageRating = useMemo(() => {
    const ratedHotels = hotels.filter((hotel) => Number(hotel.rating) > 0);

    if (!ratedHotels.length) return "—";

    return (
      ratedHotels.reduce((total, hotel) => total + Number(hotel.rating), 0) /
      ratedHotels.length
    ).toFixed(1);
  }, [hotels]);

  const filteredHotels = useMemo(() => {
    const term = search.trim().toLowerCase();

    return hotels.filter((hotel) => {
      const name = String(hotel.name || "").toLowerCase();
      const location = String(hotel.location || "").toLowerCase();

      const matchesSearch = name.includes(term) || location.includes(term);

      const matchesStatus =
        statusFilter === "All" ||
        normalizeStatus(hotel.status) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [hotels, search, statusFilter]);

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  };

  const openEditForm = (hotel) => {
    setEditingId(hotel.id);

    setForm({
      name: hotel.name || "",
      location: hotel.location || "",
      price: String(hotel.price ?? ""),
      rating: String(hotel.rating ?? "4.5"),
      image: hotel.image || "",
      status: normalizeStatus(hotel.status),
    });

    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  };

  const persistHotels = (nextHotels) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHotels));
      setHotels(nextHotels);
      window.dispatchEvent(new Event("stayora-hotels-updated"));
      setNotice("Hotel information saved successfully.");

      return true;
    } catch (storageError) {
      console.error("Could not save hotels:", storageError);
      setError(
        "Could not save changes to browser storage. Check your browser storage settings.",
      );

      return false;
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    const name = form.name.trim();
    const location = form.location.trim();
    const price = Number(form.price);
    const rating = Number(form.rating);
    const image = form.image.trim();

    if (!name || !location) {
      setError("Please enter the hotel name and location.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError("Price must be a number greater than zero.");
      return;
    }

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      setError("Rating must be between 1 and 5.");
      return;
    }

    if (image && !/^https?:\/\/\S+$/i.test(image)) {
      setError("Image URL must begin with http:// or https://.");
      return;
    }

    const duplicate = hotels.some(
      (hotel) =>
        String(hotel.id) !== String(editingId) &&
        String(hotel.name || "")
          .trim()
          .toLowerCase() === name.toLowerCase() &&
        String(hotel.location || "")
          .trim()
          .toLowerCase() === location.toLowerCase(),
    );

    if (duplicate) {
      setError("A hotel with this name and location already exists.");
      return;
    }

    const hotelData = {
      name,
      location,
      price,
      rating,
      image,
      status: normalizeStatus(form.status),
    };

    const nextHotels =
      editingId !== null
        ? hotels.map((hotel) =>
            String(hotel.id) === String(editingId)
              ? { ...hotel, ...hotelData }
              : hotel,
          )
        : [
            {
              id: createHotelId(),
              ...hotelData,
              reviews: 0,
            },
            ...hotels,
          ];

    setIsSaving(true);

    const success = persistHotels(nextHotels);

    setIsSaving(false);

    if (success) {
      addActivityLog({
        action: editingId !== null ? "Hotel Updated" : "Hotel Added",
        category: "Hotel",
        description:
          editingId !== null
            ? `${name} was updated.`
            : `${name} was added to Stayora.`,
      });

      closeForm();
    }
  };

  const handleToggleStatus = (hotel) => {
    const nextStatus =
      normalizeStatus(hotel.status) === "Active" ? "Inactive" : "Active";

    const nextHotels = hotels.map((item) =>
      String(item.id) === String(hotel.id)
        ? { ...item, status: nextStatus }
        : item,
    );

    if (persistHotels(nextHotels)) {
      addActivityLog({
        action: "Hotel Status Updated",
        category: "Hotel",
        description: `${hotel.name} was marked as ${nextStatus}.`,
        target: hotel.id,
      });

      setNotice(`${hotel.name} is now ${nextStatus.toLowerCase()}.`);
    }
  };

  const handleDelete = (hotel) => {
    const confirmed = window.confirm(
      `Delete "${hotel.name}"?\n\nThis removes the listing from Stayora's saved hotel list.`,
    );

    if (!confirmed) return;

    const nextHotels = hotels.filter(
      (item) => String(item.id) !== String(hotel.id),
    );

    if (persistHotels(nextHotels)) {
      addActivityLog({
        action: "Hotel Deleted",
        category: "Hotel",
        description: `${hotel.name} was deleted from Stayora.`,
        target: hotel.id,
      });

      setNotice(`${hotel.name} was deleted.`);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
  };

  const summaryCards = [
    {
      label: "Total Hotels",
      value: hotels.length,
      detail: "All hotel listings",
      icon: Hotel,
      color: "text-purple-300",
      iconBg: "bg-purple-500/10",
    },
    {
      label: "Active Hotels",
      value: activeCount,
      detail: "Available for display",
      icon: CheckCircle2,
      color: "text-emerald-300",
      iconBg: "bg-emerald-500/10",
    },
    {
      label: "Inactive Hotels",
      value: inactiveCount,
      detail: "Hidden from active listings",
      icon: Ban,
      color: "text-amber-300",
      iconBg: "bg-amber-500/10",
    },
    {
      label: "Average Rating",
      value: averageRating,
      detail: "Across rated hotels",
      icon: Star,
      color: "text-amber-300",
      iconBg: "bg-amber-500/10",
      suffix: averageRating !== "—" ? "/ 5" : "",
    },
  ];

  return (
    <div className="space-y-7 text-slate-200">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-xs font-bold tracking-[0.2em] text-teal-300">
            HOTEL MANAGEMENT
          </p>

          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Manage Hotels
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Manage listings, update prices, and control hotel availability.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-950/30 transition hover:from-purple-500 hover:to-violet-500"
        >
          <Plus size={19} />
          Add New Hotel
        </button>
      </div>

      {/* Feedback */}
      {notice && (
        <div
          role="status"
          className="flex items-start justify-between gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200"
        >
          <span>{notice}</span>

          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
            className="text-emerald-300 transition hover:text-white"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className={`${cardStyle} p-5 transition duration-300 hover:-translate-y-1 hover:border-purple-400/20`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">{item.label}</p>

                <div className={`rounded-xl p-2.5 ${item.iconBg}`}>
                  <Icon size={21} className={item.color} />
                </div>
              </div>

              <p className={`mt-4 text-3xl font-bold text-white`}>
                {item.value}
                {item.suffix && (
                  <span className="ml-1 text-base font-medium text-slate-500">
                    {item.suffix}
                  </span>
                )}
              </p>

              <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
            </div>
          );
        })}
      </div>

      {/* Search and filters */}
      <div className={`${cardStyle} p-4 sm:p-5`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-white/10 bg-[#11101c]/70 px-4 py-3 transition focus-within:border-purple-400/50 focus-within:ring-2 focus-within:ring-purple-500/10">
            <Search size={19} className="shrink-0 text-slate-500" />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by hotel name or location..."
              aria-label="Search hotels"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="text-slate-500 transition hover:text-white"
              >
                <X size={17} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <SlidersHorizontal size={18} className="text-slate-500" />

            <label htmlFor="status-filter" className="sr-only">
              Filter by status
            </label>

            <select
              id="status-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="min-w-36 rounded-xl border border-white/10 bg-[#11101c] px-3 py-3 text-sm text-slate-300 outline-none transition focus:border-purple-400/50"
            >
              <option value="All">All statuses</option>
              <option value="Active">Active only</option>
              <option value="Inactive">Inactive only</option>
            </select>

            <button
              type="button"
              onClick={resetFilters}
              className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-3 text-sm font-medium text-slate-400 transition hover:border-purple-400/30 hover:bg-purple-500/10 hover:text-white"
            >
              <RotateCcw size={15} />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Hotels table */}
      <div className={`${cardStyle} overflow-hidden`}>
        <div className="flex flex-col justify-between gap-2 border-b border-white/[0.07] px-5 py-4 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h3 className="font-bold text-white">All Hotels</h3>

            <p className="mt-1 text-sm text-slate-500">
              Search, edit, or change a listing's status.
            </p>
          </div>

          <span className="text-sm text-slate-500">
            Showing {filteredHotels.length} of {hotels.length}
          </span>
        </div>

        {filteredHotels.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10">
              <Hotel size={30} className="text-purple-300" />
            </div>

            <p className="mt-4 font-semibold text-white">No hotels found</p>

            <p className="mt-1 text-sm text-slate-500">
              Try a different search or status filter.
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 font-semibold text-teal-300 transition hover:text-teal-200"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
              <thead className="bg-white/[0.025] text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Hotel</th>
                  <th className="px-5 py-4 font-semibold">Price / Night</th>
                  <th className="px-5 py-4 font-semibold">Rating</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/[0.06]">
                {filteredHotels.map((hotel) => {
                  const status = normalizeStatus(hotel.status);

                  return (
                    <tr
                      key={hotel.id}
                      className="transition hover:bg-white/[0.025]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              hotel.image ||
                              "https://placehold.co/100x100?text=Hotel"
                            }
                            alt={hotel.name}
                            className="h-14 w-16 rounded-xl border border-white/10 bg-[#11101c] object-cover"
                            onError={(event) => {
                              event.currentTarget.onerror = null;
                              event.currentTarget.src =
                                "https://placehold.co/100x100?text=Hotel";
                            }}
                          />

                          <div>
                            <p className="font-semibold text-white">
                              {hotel.name}
                            </p>

                            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                              <MapPin size={13} className="text-teal-300" />
                              {hotel.location}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-200">
                          <Coins size={15} className="text-teal-300" />
                          NPR {Number(hotel.price || 0).toLocaleString("en-NP")}
                        </span>

                        <p className="text-xs text-slate-500">per night</p>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 font-medium text-slate-300">
                          <Star
                            size={15}
                            className="fill-amber-400 text-amber-400"
                          />
                          {Number(hotel.rating) > 0
                            ? Number(hotel.rating).toFixed(1)
                            : "New"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}
                        >
                          {status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(hotel)}
                            title={
                              status === "Active"
                                ? "Deactivate hotel"
                                : "Activate hotel"
                            }
                            className={`rounded-lg border p-2 transition ${
                              status === "Active"
                                ? "border-amber-400/20 text-amber-300 hover:bg-amber-400/10"
                                : "border-emerald-400/20 text-emerald-300 hover:bg-emerald-400/10"
                            }`}
                          >
                            {status === "Active" ? (
                              <Ban size={17} />
                            ) : (
                              <CheckCircle2 size={17} />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditForm(hotel)}
                            aria-label={`Edit ${hotel.name}`}
                            title="Edit hotel"
                            className="rounded-lg border border-white/10 p-2 text-slate-400 transition hover:border-purple-400/30 hover:bg-purple-500/10 hover:text-purple-300"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(hotel)}
                            aria-label={`Delete ${hotel.name}`}
                            title="Delete hotel"
                            className="rounded-lg border border-white/10 p-2 text-slate-400 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="hotel-form-title"
            className="my-auto max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#191727] shadow-2xl shadow-black/50"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.07] bg-[#191727]/95 px-6 py-5 backdrop-blur-xl">
              <div>
                <h3
                  id="hotel-form-title"
                  className="text-xl font-bold text-white"
                >
                  {editingId !== null ? "Edit Hotel" : "Add New Hotel"}
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Enter the hotel information below.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                aria-label="Close form"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="hotel-name"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Hotel Name *
                  </label>

                  <input
                    id="hotel-name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Kathmandu Grand Hotel"
                    required
                    maxLength={100}
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label
                    htmlFor="hotel-location"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Location *
                  </label>

                  <input
                    id="hotel-location"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g. Thamel, Kathmandu"
                    required
                    maxLength={150}
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label
                    htmlFor="hotel-price"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Price per night (NPR) *
                  </label>

                  <input
                    id="hotel-price"
                    name="price"
                    type="number"
                    min="1"
                    max="10000000"
                    step="1"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="e.g. 4500"
                    required
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label
                    htmlFor="hotel-rating"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Rating (1–5) *
                  </label>

                  <input
                    id="hotel-rating"
                    name="rating"
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={form.rating}
                    onChange={handleChange}
                    required
                    className={inputStyle}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="hotel-image"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Hotel Image URL
                  </label>

                  <input
                    id="hotel-image"
                    name="image"
                    type="url"
                    value={form.image}
                    onChange={handleChange}
                    placeholder="https://example.com/hotel-image.jpg"
                    className={inputStyle}
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    Use a publicly accessible image URL, or leave blank.
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="hotel-status"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Listing Status
                  </label>

                  <select
                    id="hotel-status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className={`${inputStyle} bg-[#11101c]`}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300"
                >
                  {error}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-white/[0.07] pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-950/30 transition hover:from-purple-500 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving
                    ? "Saving..."
                    : editingId !== null
                      ? "Save Changes"
                      : "Add Hotel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
