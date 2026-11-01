
const STORAGE_KEY = "stayora-admin-notifications";

const USER_EVENT = "stayora-user-notifications-updated";
const ADMIN_EVENT = "stayora-notifications-updated";

function normalizeEmail(email) {
  return email?.trim().toLowerCase() || "";
}

function getUserNotificationKey(email) {
  const normalizedEmail = normalizeEmail(email);

  return normalizedEmail
    ? `stayora-user-notifications-${encodeURIComponent(normalizedEmail)}`
    : null;
}

function notifyChange() {
  window.dispatchEvent(new Event(ADMIN_EVENT));
}

function notifyUserChange(email) {
  window.dispatchEvent(
    new CustomEvent(USER_EVENT, {
      detail: { email: normalizeEmail(email) },
    })
  );
}

// ================================
// ADMIN NOTIFICATIONS
// ================================

export function getNotifications() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to load admin notifications:", error);
    return [];
  }
}

export function addNotification(notification) {
  const notifications = getNotifications();

  const newNotification = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: notification.title,
    message: notification.message,
    type: notification.type || "info",
    link: notification.link || "/admin",
    read: false,
    createdAt: new Date().toISOString(),
  };

  const updatedNotifications = [
    newNotification,
    ...notifications,
  ].slice(0, 100);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedNotifications)
  );

  notifyChange();

  return newNotification;
}

export function markNotificationAsRead(id) {
  const updated = getNotifications().map((item) =>
    item.id === id ? { ...item, read: true } : item
  );

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  notifyChange();
}

export function markAllNotificationsAsRead() {
  const updated = getNotifications().map((item) => ({
    ...item,
    read: true,
  }));

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  notifyChange();
}

export function clearNotifications() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  notifyChange();
}

export function subscribeToNotifications(callback) {
  const handleStorageChange = (event) => {
    if (event.key === STORAGE_KEY) {
      callback();
    }
  };

  window.addEventListener("storage", handleStorageChange);
  window.addEventListener(ADMIN_EVENT, callback);

  return () => {
    window.removeEventListener("storage", handleStorageChange);
    window.removeEventListener(ADMIN_EVENT, callback);
  };
}

// ================================
// GUEST NOTIFICATIONS
// ================================

export function getUserNotifications(email) {
  const key = getUserNotificationKey(email);

  if (!key) return [];

  try {
    const saved = localStorage.getItem(key);
    const parsed = saved ? JSON.parse(saved) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to load guest notifications:", error);
    return [];
  }
}

export function addUserNotification(email, notification) {
  const key = getUserNotificationKey(email);

  if (!key) return null;

  const notifications = getUserNotifications(email);

  const newNotification = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: notification.title,
    message: notification.message,
    type: notification.type || "info",
    link: notification.link || "/my-bookings",
    read: false,
    createdAt: new Date().toISOString(),
  };

  const updatedNotifications = [
    newNotification,
    ...notifications,
  ].slice(0, 100);

  localStorage.setItem(
    key,
    JSON.stringify(updatedNotifications)
  );

  notifyUserChange(email);

  return newNotification;
}

export function markUserNotificationAsRead(email, id) {
  const key = getUserNotificationKey(email);

  if (!key) return;

  const updated = getUserNotifications(email).map((item) =>
    item.id === id ? { ...item, read: true } : item
  );

  localStorage.setItem(key, JSON.stringify(updated));
  notifyUserChange(email);
}

export function markAllUserNotificationsAsRead(email) {
  const key = getUserNotificationKey(email);

  if (!key) return;

  const updated = getUserNotifications(email).map((item) => ({
    ...item,
    read: true,
  }));

  localStorage.setItem(key, JSON.stringify(updated));
  notifyUserChange(email);
}

export function clearUserNotifications(email) {
  const key = getUserNotificationKey(email);

  if (!key) return;

  localStorage.setItem(key, JSON.stringify([]));
  notifyUserChange(email);
}

export function subscribeToUserNotifications(email, callback) {
  const normalizedEmail = normalizeEmail(email);
  const key = getUserNotificationKey(email);

  if (!key) return () => {};

  const handleUserChange = (event) => {
    if (event.detail?.email === normalizedEmail) {
      callback();
    }
  };

  const handleStorageChange = (event) => {
    if (event.key === key) {
      callback();
    }
  };

  window.addEventListener(USER_EVENT, handleUserChange);
  window.addEventListener("storage", handleStorageChange);

  return () => {
    window.removeEventListener(USER_EVENT, handleUserChange);
    window.removeEventListener("storage", handleStorageChange);
  };
}
