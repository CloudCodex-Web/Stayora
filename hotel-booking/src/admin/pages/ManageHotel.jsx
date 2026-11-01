import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Hotel,
  MapPin,
  IndianRupee,
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
  Active: "bg-emerald-50 text-emerald-700",
  Inactive: "bg-amber-50 text-amber-700",
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

function money(value) {
  return `NPR ${Number(value || 0).toLocaleString("en-NP")}`;
}

function loadHotels() {
  const storedHotels = getStoredHotels(initialHotels);

  return storedHotels.map((hotel) => ({
    ...hotel,
    status: normalizeStatus(hotel.status),
  }));
}

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
            ? `${name} hotels were updated.`
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
        action: "Hotel Deleted",
        category: "Hotel",
        description: `${hotel.name} was deleted from Stayora.`,
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
      setNotice(`${hotel.name} was deleted.`);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
  };

  return (
    <div className="space-y-7">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-1 text-sm font-medium text-teal-700">
            HOTEL MANAGEMENT
          </p>

          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Manage Hotels
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Manage listings, update prices, and control hotel availability.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-teal-800"
        >
          <Plus size={19} />
          Add New Hotel
        </button>
      </div>

      {/* Feedback */}
      {notice && (
        <div
          role="status"
          className="flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          <span>{notice}</span>

          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Total Hotels</p>
            <Hotel className="text-teal-700" size={22} />
          </div>

          <p className="mt-3 text-3xl font-bold text-slate-900">
            {hotels.length}
          </p>

          <p className="mt-1 text-xs text-slate-500">All hotel listings</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Active Hotels</p>
            <CheckCircle2 className="text-emerald-600" size={22} />
          </div>

          <p className="mt-3 text-3xl font-bold text-emerald-600">
            {activeCount}
          </p>

          <p className="mt-1 text-xs text-slate-500">Available for display</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Inactive Hotels</p>
            <Ban className="text-amber-600" size={22} />
          </div>

          <p className="mt-3 text-3xl font-bold text-amber-600">
            {inactiveCount}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Hidden from active listings
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Average Rating</p>
            <Star className="fill-amber-400 text-amber-400" size={22} />
          </div>

          <p className="mt-3 text-3xl font-bold text-slate-900">
            {averageRating}
            {averageRating !== "—" && (
              <span className="ml-1 text-base font-medium text-slate-400">
                / 5
              </span>
            )}
          </p>

          <p className="mt-1 text-xs text-slate-500">Across rated hotels</p>
        </div>
      </div>

      {/* Search and filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-100">
            <Search size={20} className="shrink-0 text-slate-400" />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by hotel name or location..."
              aria-label="Search hotels"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={17} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <SlidersHorizontal size={18} className="text-slate-400" />

            <label htmlFor="status-filter" className="sr-only">
              Filter by status
            </label>

            <select
              id="status-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="min-w-36 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-teal-600"
            >
              <option value="All">All statuses</option>
              <option value="Active">Active only</option>
              <option value="Inactive">Inactive only</option>
            </select>

            <button
              type="button"
              onClick={resetFilters}
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <RotateCcw size={15} />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Hotels table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h3 className="font-bold text-slate-900">All Hotels</h3>
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
            <Hotel size={36} className="mx-auto text-slate-300" />

            <p className="mt-3 font-semibold text-slate-700">No hotels found</p>

            <p className="mt-1 text-sm text-slate-500">
              Try a different search or status filter.
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 font-semibold text-teal-700 hover:text-teal-900"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
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

              <tbody className="divide-y divide-slate-100">
                {filteredHotels.map((hotel) => {
                  const status = normalizeStatus(hotel.status);

                  return (
                    <tr key={hotel.id} className="transition hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              hotel.image ||
                              "https://placehold.co/100x100?text=Hotel"
                            }
                            alt={hotel.name}
                            className="h-14 w-16 rounded-xl bg-slate-100 object-cover"
                            onError={(event) => {
                              event.currentTarget.onerror = null;
                              event.currentTarget.src =
                                "https://placehold.co/100x100?text=Hotel";
                            }}
                          />

                          <div>
                            <p className="font-semibold text-slate-900">
                              {hotel.name}
                            </p>

                            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                              <MapPin size={13} />
                              {hotel.location}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="inline-flex items-center font-semibold text-slate-800">
                          <IndianRupee size={15} />
                          {Number(hotel.price || 0).toLocaleString("en-NP")}
                        </span>

                        <p className="text-xs text-slate-400">per night</p>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 font-medium text-slate-700">
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
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}
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
                                ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                                : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
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
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(hotel)}
                            aria-label={`Delete ${hotel.name}`}
                            title="Delete hotel"
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
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
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="hotel-form-title"
            className="my-auto max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <h3
                  id="hotel-form-title"
                  className="text-xl font-bold text-slate-900"
                >
                  {editingId !== null ? "Edit Hotel" : "Add New Hotel"}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Enter the hotel information below.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                aria-label="Close form"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="hotel-name"
                    className="mb-2 block text-sm font-medium text-slate-700"
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
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="hotel-location"
                    className="mb-2 block text-sm font-medium text-slate-700"
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
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="hotel-price"
                    className="mb-2 block text-sm font-medium text-slate-700"
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
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="hotel-rating"
                    className="mb-2 block text-sm font-medium text-slate-700"
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
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="hotel-image"
                    className="mb-2 block text-sm font-medium text-slate-700"
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
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    Use a publicly accessible image URL, or leave blank.
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="hotel-status"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Listing Status
                  </label>

                  <select
                    id="hotel-status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
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
