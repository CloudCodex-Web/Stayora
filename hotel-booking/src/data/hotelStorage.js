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

export function subscribeToHotelChanges(callback) {
  function handleStorageChange(event) {
    if (event.key === STORAGE_KEY || event.key === null) {
      callback();
    }
  }

  // Changes made in another browser tab.
  window.addEventListener("storage", handleStorageChange);

  // Changes made in the current tab by the admin panel.
  window.addEventListener("stayora-hotels-updated", callback);

  return () => {
    window.removeEventListener("storage", handleStorageChange);
    window.removeEventListener("stayora-hotels-updated", callback);
  };
}
