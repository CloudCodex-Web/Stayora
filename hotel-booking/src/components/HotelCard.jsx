import { Link } from "react-router-dom";
import { Heart, MapPin, Star, ArrowUpRight } from "lucide-react";

import { useFavorites } from "../context/FavoritesContext";

function HotelCard({ hotel }) {
  const { isFavorite, toggleFavorite } = useFavorites();

  const favorite = isFavorite(hotel.id);

  const rating = Number(hotel.rating) || 0;
  const reviews = Number(hotel.reviews) || 0;
  const price = Number(hotel.price) || 0;

  const image =
    typeof hotel.image === "string"
      ? hotel.image
      : hotel.image?.url || hotel.image?.src || "";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Hotel image */}
      <div className="relative overflow-hidden bg-gray-100">
        <Link
          to={`/hotel/${hotel.id}`}
          aria-label={`View ${hotel.name}`}
          className="block"
        >
          {image ? (
            <img
              src={image}
              alt={hotel.name}
              loading="lazy"
              className="h-60 w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-60 items-center justify-center bg-emerald-50">
              <span className="text-5xl">🏨</span>
            </div>
          )}
        </Link>

        {/* Category badge */}
        <span className="absolute left-3 top-3 rounded-full border border-white/60 bg-white/95 px-3 py-1.5 text-xs font-bold text-emerald-800 shadow-sm backdrop-blur">
          {hotel.category || "Hotel"}
        </span>

        {/* Wishlist button */}
        <button
          type="button"
          onClick={() => toggleFavorite(hotel.id)}
          aria-label={
            favorite
              ? `Remove ${hotel.name} from wishlist`
              : `Add ${hotel.name} to wishlist`
          }
          aria-pressed={favorite}
          title={favorite ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md transition hover:scale-110 ${
            favorite ? "text-red-500" : "text-gray-500 hover:text-red-500"
          }`}
        >
          <Heart
            size={21}
            fill={favorite ? "currentColor" : "none"}
            strokeWidth={2}
          />
        </button>
      </div>

      {/* Hotel information */}
      <div className="flex flex-1 flex-col p-5">
        {/* Name and rating */}
        <div className="flex items-start justify-between gap-3">
          <Link to={`/hotel/${hotel.id}`} className="min-w-0">
            <h3 className="text-lg font-bold leading-snug text-gray-900 transition group-hover:text-emerald-800">
              {hotel.name}
            </h3>
          </Link>

          <div className="flex shrink-0 items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-sm font-bold text-amber-700">
            <Star size={14} fill="currentColor" />
            {rating > 0 ? rating.toFixed(1) : "New"}
          </div>
        </div>

        {/* Location */}
        <p className="mt-2 flex items-start gap-2 text-sm text-gray-500">
          <MapPin size={16} className="mt-0.5 shrink-0 text-emerald-700" />
          <span className="line-clamp-2">
            {hotel.location || "Location unavailable"}
          </span>
        </p>

        {/* Reviews */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">
            {reviews > 0
              ? `${reviews.toLocaleString("en-NP")} reviews`
              : "No reviews yet"}
          </span>
        </div>

        {/* Price and details */}
        <div className="mt-auto border-t border-gray-100 pt-4">
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-xs text-gray-500">Starting from</p>

              <p className="mt-1 text-xl font-extrabold text-gray-900">
                NPR {price.toLocaleString("en-NP")}
              </p>

              <p className="text-xs text-gray-500">per night</p>
            </div>

            <Link
              to={`/hotel/${hotel.id}`}
              className="inline-flex items-center gap-1 rounded-xl bg-emerald-700 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              View
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export default HotelCard;
