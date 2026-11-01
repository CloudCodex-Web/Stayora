import { createContext, useContext, useEffect, useState } from "react";

import { useAuth } from "./AuthContext";

const FavoritesContext = createContext(null);

function getWishlistKey(user) {
  return user?.email
    ? `stayora-favorites-${user.email.trim().toLowerCase()}`
    : null;
}

function readFavorites(key) {
  if (!key) return [];

  try {
    const saved = localStorage.getItem(key);
    const parsed = saved ? JSON.parse(saved) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function FavoritesProvider({ children }) {
  const { user } = useAuth();

  const wishlistKey = getWishlistKey(user);

  const [favoriteIds, setFavoriteIds] = useState(() =>
    readFavorites(wishlistKey),
  );

  const [loadedKey, setLoadedKey] = useState(wishlistKey);

  // Load the correct wishlist when the account changes.
  useEffect(() => {
    setFavoriteIds(readFavorites(wishlistKey));
    setLoadedKey(wishlistKey);
  }, [wishlistKey]);

  // Save favorites for the current account.
  useEffect(() => {
    if (!wishlistKey || loadedKey !== wishlistKey) return;

    localStorage.setItem(wishlistKey, JSON.stringify(favoriteIds));
  }, [favoriteIds, wishlistKey, loadedKey]);

  function toggleFavorite(hotelId) {
    if (!user) return;

    setFavoriteIds((currentIds) =>
      currentIds.some((id) => String(id) === String(hotelId))
        ? currentIds.filter((id) => String(id) !== String(hotelId))
        : [...currentIds, hotelId],
    );
  }

  function isFavorite(hotelId) {
    return favoriteIds.some((id) => String(id) === String(hotelId));
  }

  return (
    <FavoritesContext.Provider
      value={{ favoriteIds, toggleFavorite, isFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error("useFavorites must be used inside FavoritesProvider");
  }

  return context;
}
