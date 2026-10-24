import { Link } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";

function HotelCard({ hotel }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(hotel.id);

  return (
    <article className="relative overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative">
        <Link to={`/hotel/${hotel.id}`} className="block">
          <img
            src={hotel.image}
            alt={hotel.name}
            className="h-56 w-full object-cover"
          />
        </Link>

        <button
          type="button"
          onClick={() => toggleFavorite(hotel.id)}
          aria-label={
            favorite
              ? `Remove ${hotel.name} from favorites`
              : `Add ${hotel.name} to favorites`
          }
          aria-pressed={favorite}
          className={`absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md transition hover:scale-110 ${
            favorite ? "text-red-500" : "text-gray-500"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={favorite ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"
            />
          </svg>
        </button>
      </div>

      <Link to={`/hotel/${hotel.id}`} className="block">
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-xl font-bold text-gray-900">{hotel.name}</h3>

            <span className="shrink-0 rounded-lg bg-emerald-700 px-2 py-1 text-sm font-bold text-white">
              ★ {hotel.rating}
            </span>
          </div>

          <p className="mt-2 text-sm text-gray-500">📍 {hotel.location}</p>

          <p className="mt-4 text-sm text-gray-500">{hotel.reviews} reviews</p>

          <div className="mt-4 border-t border-gray-100 pt-4">
            <p className="text-lg font-extrabold text-gray-900">
              NPR {Number(hotel.price).toLocaleString("en-IN")}
              <span className="text-sm font-normal text-gray-500">
                {" "}
                / night
              </span>
            </p>

            <p className="mt-3 font-semibold text-emerald-700">
              View details →
            </p>
          </div>
        </div>
      </Link>
    </article>
  );
}

export default HotelCard;
