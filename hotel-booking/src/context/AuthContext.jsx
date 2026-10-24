import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

const USER_KEY = "stayora-user";
const ACCOUNTS_KEY = "stayora-demo-accounts";

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function getInitialAccounts() {
  const savedAccounts = readStorage(ACCOUNTS_KEY, []);

  if (Array.isArray(savedAccounts) && savedAccounts.length > 0) {
    return savedAccounts;
  }

  // Preserve the current user if accounts did not exist before.
  const currentUser = readStorage(USER_KEY, null);
  return currentUser?.email ? [currentUser] : [];
}

export function AuthProvider({ children }) {
  const [accounts, setAccounts] = useState(getInitialAccounts);

  const [user, setUser] = useState(() => readStorage(USER_KEY, null));

  function saveAccounts(nextAccounts) {
    setAccounts(nextAccounts);
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(nextAccounts));
  }

  function login(userDetails) {
    const email = userDetails.email.trim().toLowerCase();

    const existingAccount = accounts.find(
      (account) => account.email.toLowerCase() === email,
    );

    // Reuse a saved profile instead of overwriting its details.
    const account = existingAccount || {
      name: userDetails.name?.trim() || email.split("@")[0],
      email,
      avatarUrl: "",
    };

    if (!existingAccount) {
      saveAccounts([...accounts, account]);
    }

    setUser(account);
    localStorage.setItem(USER_KEY, JSON.stringify(account));
  }

  function switchAccount(email) {
    const account = accounts.find(
      (item) => item.email.toLowerCase() === email.toLowerCase(),
    );

    if (!account) return;

    setUser(account);
    localStorage.setItem(USER_KEY, JSON.stringify(account));
  }

  function updateProfile(updates) {
    if (!user) return;

    const updatedUser = {
      ...user,
      name: updates.name.trim(),
      avatarUrl: updates.avatarUrl.trim(),
    };

    const nextAccounts = accounts.map((account) =>
      account.email.toLowerCase() === user.email.toLowerCase()
        ? updatedUser
        : account,
    );

    saveAccounts(nextAccounts);
    setUser(updatedUser);
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem(USER_KEY);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        accounts,
        login,
        logout,
        switchAccount,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
