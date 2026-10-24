import { useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import FeaturedHotel from "../components/FeaturedHotel";
import HotelSearchFilters from "../components/HotelSearchFilters";
import About from "./About";
import Contact from "./Contact";
import hotels from "../data/hotels";

function Home() {
  const maxPrice = Math.max(...hotels.map((hotel) => Number(hotel.price) || 0));

  const [filters, setFilters] = useState({
    search: "",
    location: "All locations",
    maxPrice,
    sortBy: "recommended",
  });

  const [heroDestination, setHeroDestination] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const locations = useMemo(() => {
    return [
      ...new Set(
        hotels.map((hotel) => {
          const parts = hotel.location.split(",");
          return parts.length > 1
            ? parts[parts.length - 1].trim() === "Nepal"
              ? parts[0].trim()
              : parts[parts.length - 1].trim()
            : hotel.location.trim();
        }),
      ),
    ].sort();
  }, []);

  const filteredHotels = useMemo(() => {
    const searchText = filters.search.trim().toLowerCase();
    const destinationText = heroDestination.trim().toLowerCase();

    const results = hotels.filter((hotel) => {
      const name = (hotel.name || "").toLowerCase();
      const location = (hotel.location || "").toLowerCase();
      const category = (hotel.category || "").toLowerCase();
      const price = Number(hotel.price) || 0;

      const matchesSearch =
        !searchText ||
        name.includes(searchText) ||
        location.includes(searchText) ||
        category.includes(searchText);

      const matchesHero =
        !destinationText ||
        name.includes(destinationText) ||
        location.includes(destinationText) ||
        category.includes(destinationText);

      const parts = hotel.location.split(",");
      const primaryLocation = parts[0].trim();
      const matchesLocation =
        filters.location === "All locations" ||
        primaryLocation.toLowerCase() === filters.location.toLowerCase() ||
        location.includes(filters.location.toLowerCase());

      const matchesPrice = price <= Number(filters.maxPrice);

      return matchesSearch && matchesHero && matchesLocation && matchesPrice;
    });

    if (filters.sortBy === "price-low") {
      results.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (filters.sortBy === "price-high") {
      results.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (filters.sortBy === "name") {
      results.sort((a, b) => a.name.localeCompare(b.name));
    }

    return results;
  }, [filters, heroDestination]);

  function handleHeroSearch({ destination = "" } = {}) {
    setHeroDestination(destination);
    setHasSearched(true);

    document.getElementById("hotels")?.scrollIntoView({
      behavior: "smooth",
    });
  }

  function handleReset() {
    setFilters({
      search: "",
      location: "All locations",
      maxPrice,
      sortBy: "recommended",
    });
    setHeroDestination("");
    setHasSearched(false);
  }

  return (
    <>
      <Navbar />

      <Hero onSearch={handleHeroSearch} />

      <section id="hotels" className="bg-gray-50 px-5 py-12">
        <div className="mx-auto max-w-7xl">
          <HotelSearchFilters
            filters={filters}
            setFilters={setFilters}
            locations={locations}
            maxPrice={maxPrice}
          />

          <div className="mt-8">
            <p className="mb-5 text-sm text-gray-600">
              Showing{" "}
              <span className="font-bold text-gray-900">
                {filteredHotels.length}
              </span>{" "}
              {filteredHotels.length === 1 ? "hotel" : "hotels"}
            </p>

            <FeaturedHotel hotels={filteredHotels} hasSearched={hasSearched} />

            {filteredHotels.length === 0 && (
              <div className="mt-6 rounded-2xl border border-gray-200 bg-white px-5 py-12 text-center">
                <h3 className="text-lg font-bold text-gray-900">
                  No hotels found
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Try another search or reset your filters.
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-5 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800"
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <About />
      <Contact />
    </>
  );
}

export default Home;
