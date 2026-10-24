import { createContext, useContext, useEffect, useState } from "react";

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const [favoriteIds, setFavoriteIds] = useState(() => {
    try {
      const saved = localStorage.getItem("stayora-favorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("stayora-favorites", JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  function toggleFavorite(hotelId) {
    setFavoriteIds((currentIds) =>
      currentIds.includes(hotelId)
        ? currentIds.filter((id) => id !== hotelId)
        : [...currentIds, hotelId],
    );
  }

  function isFavorite(hotelId) {
    return favoriteIds.includes(hotelId);
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
