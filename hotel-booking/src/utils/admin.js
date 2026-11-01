const STORAGE_KEY = "stayora-admin-profile";

const DEFAULT_ADMIN = {
  name: "Stayora Admin",
  email: "admin@stayora.demo",
  role: "Super Admin",
  avatarUrl: "",
};

export function getAdminProfile() {
  try {
    const savedProfile = localStorage.getItem(STORAGE_KEY);

    return savedProfile
      ? { ...DEFAULT_ADMIN, ...JSON.parse(savedProfile) }
      : DEFAULT_ADMIN;
  } catch (error) {
    console.error("Failed to load admin profile:", error);
    return DEFAULT_ADMIN;
  }
}

export function updateAdminProfile(updates) {
  const currentProfile = getAdminProfile();

  const updatedProfile = {
    ...currentProfile,
    name: updates.name.trim(),
    avatarUrl: updates.avatarUrl.trim(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));

  window.dispatchEvent(new Event("stayora-admin-profile-updated"));

  return updatedProfile;
}

export function subscribeToAdminProfileChanges(callback) {
  const handleChange = () => callback();

  window.addEventListener("stayora-admin-profile-updated", handleChange);

  return () => {
    window.removeEventListener("stayora-admin-profile-updated", handleChange);
  };
}
