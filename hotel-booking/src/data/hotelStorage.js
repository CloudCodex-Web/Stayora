import { addActivityLog } from "../utils/activityLogs";

const STORAGE_KEY = "stayora-admin-hotels";

export function getStoredHotels(fallbackHotels = []) {
  try {
    const savedHotels = localStorage.getItem(STORAGE_KEY);

    if (savedHotels === null) {
      return fallbackHotels;
    }

    const parsedHotels = JSON.parse(savedHotels);

    return Array.isArray(parsedHotels) ? parsedHotels : fallbackHotels;
  } catch (error) {
    console.error("Could not load Stayora hotels:", error);
    return fallbackHotels;
  }
}

// Save hotel list and notify subscribers.
export function saveStoredHotels(hotels) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(hotels));

  window.dispatchEvent(new Event("stayora-hotels-updated"));
}

// Add a hotel.
export function addStoredHotel(hotel) {
  const hotels = getStoredHotels();
  const updatedHotels = [...hotels, hotel];

  saveStoredHotels(updatedHotels);

  addActivityLog({
    action: "Hotel Added",
    category: "Hotel",
    description: `${hotel.name || "A new hotel"} was added to Stayora.`,
    target: hotel.id || hotel.name || "",
  });

  return updatedHotels;
}

// Update a hotel.
export function updateStoredHotel(hotelId, updatedDetails) {
  const hotels = getStoredHotels();

  const existingHotel = hotels.find(
    (hotel) => String(hotel.id) === String(hotelId),
  );

  const updatedHotels = hotels.map((hotel) =>
    String(hotel.id) === String(hotelId)
      ? { ...hotel, ...updatedDetails }
      : hotel,
  );

  saveStoredHotels(updatedHotels);

  if (existingHotel) {
    addActivityLog({
      action: "Hotel Updated",
      category: "Hotel",
      description: `${existingHotel.name || "A hotel"} was updated.`,
      target: hotelId,
    });
  }

  return updatedHotels;
}

// Delete a hotel.
export function deleteStoredHotel(hotelId) {
  const hotels = getStoredHotels();

  const existingHotel = hotels.find(
    (hotel) => String(hotel.id) === String(hotelId),
  );

  const updatedHotels = hotels.filter(
    (hotel) => String(hotel.id) !== String(hotelId),
  );

  saveStoredHotels(updatedHotels);

  if (existingHotel) {
    addActivityLog({
      action: "Hotel Deleted",
      category: "Hotel",
      description: `${existingHotel.name || "A hotel"} was deleted.`,
      target: hotelId,
    });
  }

  return updatedHotels;
}

export function subscribeToHotelChanges(callback) {
  function handleStorageChange(event) {
    if (event.key === STORAGE_KEY || event.key === null) {
      callback();
    }
  }

  window.addEventListener("storage", handleStorageChange);
  window.addEventListener("stayora-hotels-updated", callback);

  return () => {
    window.removeEventListener("storage", handleStorageChange);
    window.removeEventListener("stayora-hotels-updated", callback);
  };
}
