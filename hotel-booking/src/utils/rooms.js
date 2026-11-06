
import { addActivityLog } from "./activityLogs";

const STORAGE_KEY = "stayora-admin-rooms";
const UPDATE_EVENT = "stayora-rooms-updated";

export function getRooms() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Could not load Stayora rooms:", error);
    return [];
  }
}

export function saveRooms(rooms) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
  window.dispatchEvent(new Event(UPDATE_EVENT));
}

export function addRoom(room) {
  const rooms = getRooms();

  const newRoom = {
    ...room,
    id: `room-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  const updated = [...rooms, newRoom];
  saveRooms(updated);

  addActivityLog({
    action: "Room Added",
    category: "Room",
    description: `Room ${newRoom.roomNumber} was added.`,
    target: newRoom.id,
  });

  return updated;
}

export function updateRoom(roomId, details) {
  const rooms = getRooms();
  const existing = rooms.find((room) => room.id === roomId);

  const updated = rooms.map((room) =>
    room.id === roomId
      ? { ...room, ...details, updatedAt: new Date().toISOString() }
      : room
  );

  saveRooms(updated);

  if (existing) {
    addActivityLog({
      action: "Room Updated",
      category: "Room",
      description: `Room ${existing.roomNumber} was updated.`,
      target: roomId,
    });
  }

  return updated;
}

export function deleteRoom(roomId) {
  const rooms = getRooms();
  const existing = rooms.find((room) => room.id === roomId);
  const updated = rooms.filter((room) => room.id !== roomId);

  saveRooms(updated);

  if (existing) {
    addActivityLog({
      action: "Room Deleted",
      category: "Room",
      description: `Room ${existing.roomNumber} was deleted.`,
      target: roomId,
    });
  }

  return updated;
}

export function subscribeToRoomChanges(callback) {
  const handleStorage = (event) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      callback();
    }
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(UPDATE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(UPDATE_EVENT, callback);
  };
}
