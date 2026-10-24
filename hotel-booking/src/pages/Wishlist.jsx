import { Link } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";
import hotels from "../data/hotels";

function Wishlist() {
  const { favoriteIds, toggleFavorite } = useFavorites();

  const favoriteHotels = hotels.filter((hotel) =>
    favoriteIds.includes(hotel.id),
  );

  return (
    <main className="min-h-screen bg-gray-50 px-5 py-12">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/"
          className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
        >
          ← Back to Stayora
        </Link>

        <div className="mb-8 mt-6">
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist ❤️</h1>
          <p className="mt-2 text-gray-500">
            Your favorite stays, all in one place.
          </p>
        </div>

        {favoriteHotels.length === 0 ? (
          <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm">
            <div className="mb-4 text-5xl">♡</div>
            <h2 className="text-xl font-bold text-gray-900">
              Your wishlist is empty
            </h2>
            <p className="mt-2 text-gray-500">
              Save hotels by tapping the heart on any hotel card.
            </p>
            <Link
              to="/"
              className="mt-6 inline-block rounded-xl bg-emerald-700 px-6 py-3 font-semibold text-white hover:bg-emerald-800"
            >
              Explore Hotels
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm text-gray-500">
              {favoriteHotels.length} saved{" "}
              {favoriteHotels.length === 1 ? "hotel" : "hotels"}
            </p>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {favoriteHotels.map((hotel) => (
                <article
                  key={hotel.id}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm"
                >
                  <div className="relative">
                    <Link to={`/hotel/${hotel.id}`}>
                      <img
                        src={hotel.image}
                        alt={hotel.name}
                        className="h-52 w-full object-cover"
                      />
                    </Link>

                    <button
                      type="button"
                      onClick={() => toggleFavorite(hotel.id)}
                      aria-label={`Remove ${hotel.name} from wishlist`}
                      className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl text-red-500 shadow-md hover:scale-110"
                    >
                      ♥
                    </button>
                  </div>

                  <div className="p-5">
                    <h2 className="text-lg font-bold text-gray-900">
                      {hotel.name}
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                      📍 {hotel.location}
                    </p>
                    <p className="mt-3 font-bold text-gray-900">
                      NPR {Number(hotel.price).toLocaleString("en-IN")}
                      <span className="font-normal text-gray-500">
                        {" "}
                        / night
                      </span>
                    </p>
                    <Link
                      to={`/hotel/${hotel.id}`}
                      className="mt-4 inline-block font-semibold text-emerald-700 hover:text-emerald-800"
                    >
                      View Details →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default Wishlist;
