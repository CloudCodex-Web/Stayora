import { useEffect, useMemo, useState } from "react";
import {
  BedDouble,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Building2,
  Users,
  Wallet,
  CheckCircle2,
  Wrench,
  ChevronDown,
} from "lucide-react";

import {
  getStoredHotels,
  subscribeToHotelChanges,
} from "../../data/hotelStorage";
import {
  getRooms,
  addRoom,
  updateRoom,
  deleteRoom,
  subscribeToRoomChanges,
} from "../../utils/rooms";

const initialForm = {
  hotelId: "",
  roomNumber: "",
  roomType: "Standard",
  price: "",
  capacity: "2",
  status: "Available",
  description: "",
};

const money = (amount) => `NPR ${Number(amount || 0).toLocaleString("en-IN")}`;

const statusStyles = {
  Available: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Occupied: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Maintenance: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

export default function ManageRooms() {
  const [rooms, setRooms] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [form, setForm] = useState(initialForm);

  const loadData = () => {
    setRooms(getRooms());

    const storedHotels = getStoredHotels();
    setHotels(storedHotels);
  };

  useEffect(() => {
    loadData();

    const unsubscribeRooms = subscribeToRoomChanges(loadData);
    const unsubscribeHotels = subscribeToHotelChanges(() => {
      setHotels(getStoredHotels());
    });

    return () => {
      unsubscribeRooms();
      unsubscribeHotels();
    };
  }, []);

  const stats = useMemo(
    () => ({
      total: rooms.length,
      available: rooms.filter((room) => room.status === "Available").length,
      occupied: rooms.filter((room) => room.status === "Occupied").length,
      maintenance: rooms.filter((room) => room.status === "Maintenance").length,
    }),
    [rooms],
  );

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const hotel = hotels.find(
        (item) => String(item.id) === String(room.hotelId),
      );

      const query = search.toLowerCase();

      const matchesSearch =
        String(room.roomNumber || "")
          .toLowerCase()
          .includes(query) ||
        String(room.roomType || "")
          .toLowerCase()
          .includes(query) ||
        String(hotel?.name || "")
          .toLowerCase()
          .includes(query);

      const matchesFilter = filter === "All" || room.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [rooms, hotels, search, filter]);

  const openAddModal = () => {
    setEditingRoom(null);
    setForm({
      ...initialForm,
      hotelId: hotels[0]?.id ? String(hotels[0].id) : "",
    });
    setShowModal(true);
  };

  const openEditModal = (room) => {
    setEditingRoom(room);
    setForm({
      hotelId: String(room.hotelId || ""),
      roomNumber: room.roomNumber || "",
      roomType: room.roomType || "Standard",
      price: String(room.price ?? ""),
      capacity: String(room.capacity ?? "2"),
      status: room.status || "Available",
      description: room.description || "",
    });
    setShowModal(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.hotelId || !form.roomNumber.trim() || !form.price) {
      return;
    }

    const roomDetails = {
      ...form,
      hotelId: String(form.hotelId),
      roomNumber: form.roomNumber.trim(),
      price: Number(form.price),
      capacity: Number(form.capacity),
    };

    if (editingRoom) {
      updateRoom(editingRoom.id, roomDetails);
    } else {
      addRoom(roomDetails);
    }

    setShowModal(false);
    setEditingRoom(null);
    setForm(initialForm);
    loadData();
  };

  const handleDelete = (room) => {
    const confirmed = window.confirm(
      `Delete room ${room.roomNumber}? This cannot be undone.`,
    );

    if (confirmed) {
      deleteRoom(room.id);
      loadData();
    }
  };

  const getHotelName = (hotelId) =>
    hotels.find((hotel) => String(hotel.id) === String(hotelId))?.name ||
    "Hotel unavailable";

  const statCards = [
    {
      label: "Total Rooms",
      value: stats.total,
      icon: BedDouble,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
    },
    {
      label: "Available",
      value: stats.available,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Occupied",
      value: stats.occupied,
      icon: Users,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      label: "Maintenance",
      value: stats.maintenance,
      icon: Wrench,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
    },
  ];

  return (
    <div className="min-h-screen space-y-7 bg-[#11101c] p-4 text-white sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-sm font-medium text-violet-400">
            Stayora / Administration
          </p>
          <h1 className="text-2xl font-bold sm:text-3xl">Room Management</h1>
          <p className="mt-2 text-sm text-gray-400">
            Manage rooms, room types and availability across your hotels.
          </p>
        </div>

        <button
          onClick={openAddModal}
          disabled={hotels.length === 0}
          className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={18} />
          Add New Room
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/5 bg-[#191727] p-5 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                  <h2 className="mt-3 text-3xl font-bold">{stat.value}</h2>
                </div>

                <div className={`rounded-xl p-3 ${stat.bg} ${stat.color}`}>
                  <Icon size={23} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search and filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-[#191727] p-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search room number, type or hotel..."
            className="w-full rounded-xl border border-white/10 bg-[#11101c] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-gray-500 focus:border-violet-500"
          />
        </div>

        <div className="relative">
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="w-full appearance-none rounded-xl border border-white/10 bg-[#11101c] px-4 py-3 pr-10 text-sm text-gray-300 outline-none focus:border-violet-500 md:w-48"
          >
            <option value="All">All Rooms</option>
            <option value="Available">Available</option>
            <option value="Occupied">Occupied</option>
            <option value="Maintenance">Maintenance</option>
          </select>
          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
        </div>
      </div>

      {/* Room table */}
      <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#191727]">
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-5">
          <div>
            <h2 className="font-semibold">All Rooms</h2>
            <p className="mt-1 text-xs text-gray-500">
              {filteredRooms.length} room(s) found
            </p>
          </div>
          <BedDouble className="text-violet-400" size={21} />
        </div>

        {filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
            <div className="mb-4 rounded-2xl bg-violet-500/10 p-4 text-violet-400">
              <BedDouble size={30} />
            </div>
            <h3 className="font-semibold">No rooms found</h3>
            <p className="mt-2 max-w-sm text-sm text-gray-500">
              {rooms.length === 0
                ? "Start by adding rooms to one of your hotels."
                : "Try changing your search or filter."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-[#211d35] text-xs uppercase tracking-wider text-gray-400">
                <tr>
                  <th className="px-5 py-4">Room</th>
                  <th className="px-5 py-4">Hotel</th>
                  <th className="px-5 py-4">Room Type</th>
                  <th className="px-5 py-4">Capacity</th>
                  <th className="px-5 py-4">Price / Night</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {filteredRooms.map((room) => (
                  <tr
                    key={room.id}
                    className="transition hover:bg-white/[0.025]"
                  >
                    <td className="px-5 py-4 font-semibold text-white">
                      {room.roomNumber}
                    </td>
                    <td className="px-5 py-4 text-gray-300">
                      <div className="flex items-center gap-2">
                        <Building2 size={15} className="text-violet-400" />
                        {getHotelName(room.hotelId)}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-300">{room.roomType}</td>
                    <td className="px-5 py-4 text-gray-300">
                      {room.capacity} guests
                    </td>
                    <td className="px-5 py-4 font-medium text-gray-200">
                      {money(room.price)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium ${statusStyles[room.status] || statusStyles.Available}`}
                      >
                        {room.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(room)}
                          title="Edit room"
                          className="rounded-lg border border-white/10 p-2 text-gray-400 transition hover:border-violet-500/30 hover:bg-violet-500/10 hover:text-violet-400"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(room)}
                          title="Delete room"
                          className="rounded-lg border border-white/10 p-2 text-gray-400 transition hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Demo mode: room information is stored in this browser's local storage.
      </p>

      {/* Add/Edit modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowModal(false);
          }}
        >
          <div className="my-8 w-full max-w-xl rounded-2xl border border-white/10 bg-[#191727] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold">
                  {editingRoom ? "Edit Room" : "Add New Room"}
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Enter the room information below.
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Select Hotel
                </label>
                <select
                  required
                  value={form.hotelId}
                  onChange={(event) =>
                    setForm({ ...form, hotelId: event.target.value })
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#11101c] px-4 py-3 text-sm text-white outline-none focus:border-violet-500"
                >
                  <option value="">Choose a hotel</option>
                  {hotels.map((hotel) => (
                    <option key={hotel.id} value={hotel.id}>
                      {hotel.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-gray-300">
                    Room Number
                  </label>
                  <input
                    required
                    value={form.roomNumber}
                    onChange={(event) =>
                      setForm({ ...form, roomNumber: event.target.value })
                    }
                    placeholder="e.g. 101"
                    className="w-full rounded-xl border border-white/10 bg-[#11101c] px-4 py-3 text-sm text-white outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-300">
                    Room Type
                  </label>
                  <select
                    value={form.roomType}
                    onChange={(event) =>
                      setForm({ ...form, roomType: event.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#11101c] px-4 py-3 text-sm text-white outline-none focus:border-violet-500"
                  >
                    <option>Standard</option>
                    <option>Deluxe</option>
                    <option>Super Deluxe</option>
                    <option>Suite</option>
                    <option>Family Room</option>
                    <option>Presidential Suite</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-300">
                    Price per Night (NPR)
                  </label>
                  <input
                    required
                    min="1"
                    type="number"
                    value={form.price}
                    onChange={(event) =>
                      setForm({ ...form, price: event.target.value })
                    }
                    placeholder="e.g. 4500"
                    className="w-full rounded-xl border border-white/10 bg-[#11101c] px-4 py-3 text-sm text-white outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-300">
                    Guest Capacity
                  </label>
                  <input
                    required
                    min="1"
                    type="number"
                    value={form.capacity}
                    onChange={(event) =>
                      setForm({ ...form, capacity: event.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#11101c] px-4 py-3 text-sm text-white outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Room Status
                </label>
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({ ...form, status: event.target.value })
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#11101c] px-4 py-3 text-sm text-white outline-none focus:border-violet-500"
                >
                  <option>Available</option>
                  <option>Occupied</option>
                  <option>Maintenance</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Description (Optional)
                </label>
                <textarea
                  rows="3"
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  placeholder="Add a short room description..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#11101c] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-violet-500"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-white/5 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold transition hover:bg-violet-500"
                >
                  {editingRoom ? "Save Changes" : "Add Room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
