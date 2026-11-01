const STORAGE_KEY = "stayora-admin-settings";

const DEFAULT_SETTINGS = {
  general: {
    websiteName: "Stayora",
    tagline: "Find your perfect stay",
    contactEmail: "",
    phone: "",
    address: "",
  },

  booking: {
    minimumNights: 1,
    maximumGuests: 10,
    cancellationAllowed: true,
    autoApproval: false,
  },

  payment: {
    currency: "NPR",
    cashPayment: true,
    onlinePayment: false,
  },

  notifications: {
    newBooking: true,
    bookingCancellation: true,
    newReview: true,
    newUser: false,
  },
};

export function getAdminSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return DEFAULT_SETTINGS;

    const parsed = JSON.parse(saved);

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      general: {
        ...DEFAULT_SETTINGS.general,
        ...parsed.general,
      },
      booking: {
        ...DEFAULT_SETTINGS.booking,
        ...parsed.booking,
      },
      payment: {
        ...DEFAULT_SETTINGS.payment,
        ...parsed.payment,
      },
      notifications: {
        ...DEFAULT_SETTINGS.notifications,
        ...parsed.notifications,
      },
    };
  } catch (error) {
    console.error("Failed to load admin settings:", error);
    return DEFAULT_SETTINGS;
  }
}

export function saveAdminSettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

  window.dispatchEvent(new Event("stayora-settings-updated"));

  return settings;
}
