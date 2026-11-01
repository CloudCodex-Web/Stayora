const STORAGE_KEY = "stayora-users";
import { addActivityLog } from "./activityLogs";
function notifyUsersChanged() {
  window.dispatchEvent(new Event("stayora-users-updated"));
}

export function getUsers() {
  try {
    const savedUsers = localStorage.getItem(STORAGE_KEY);
    return savedUsers ? JSON.parse(savedUsers) : [];
  } catch (error) {
    console.error("Failed to load users:", error);
    return [];
  }
}

export function registerUser({ name, email }) {
  const users = getUsers();
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = users.find(
    (user) => user.email.toLowerCase() === normalizedEmail,
  );

  if (existingUser) {
    throw new Error("An account with this email already exists.");
  }

  const newUser = {
    id: `USR-${Date.now()}`,
    name: name.trim(),
    email: normalizedEmail,
    role: "User",
    status: "Active",
    createdAt: new Date().toISOString(),
  };

localStorage.setItem(STORAGE_KEY, JSON.stringify([newUser, ...users]));

notifyUsersChanged();

// Record guest registration
addActivityLog({
  action: "Guest Registered", 
  category: "User",
  description: `${newUser.name} registered a new Stayora account.`,
  target: newUser.email,
});

return newUser;
}

export function subscribeToUserChanges(callback) {
  const handleStorage = (event) => {
    if (event.key === STORAGE_KEY) callback();
  };

  const handleUpdate = () => callback();

  window.addEventListener("storage", handleStorage);
  window.addEventListener("stayora-users-updated", handleUpdate);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener("stayora-users-updated", handleUpdate);
  };
}
