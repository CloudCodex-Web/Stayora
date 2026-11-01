const STORAGE_KEY = "stayora_admin_activity_logs";
const EVENT_NAME = "stayora-activity-logs-updated";

const notifyChanges = () => {
  window.dispatchEvent(new Event(EVENT_NAME));
};

export const getActivityLogs = () => {
  try {
    const logs = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(logs) ? logs : [];
  } catch {
    return [];
  }
};

export const addActivityLog = ({
  action,
  category,
  description,
  target = "",
}) => {
  const logs = getActivityLogs();

  const newLog = {
    id: `ACT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    action,
    category,
    description,
    target,
    createdAt: new Date().toISOString(),
  };

  // Keep the latest 500 activities.
  const updatedLogs = [newLog, ...logs].slice(0, 500);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLogs));
  notifyChanges();

  return newLog;
};

export const clearActivityLogs = () => {
  localStorage.removeItem(STORAGE_KEY);
  notifyChanges();
};

export const subscribeToActivityLogs = (callback) => {
  window.addEventListener(EVENT_NAME, callback);

  return () => {
    window.removeEventListener(EVENT_NAME, callback);
  };
};