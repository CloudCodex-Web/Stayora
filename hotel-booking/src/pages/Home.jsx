import { useEffect, useMemo, useState } from "react";

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import FeaturedHotel from "../components/FeaturedHotel";
import HotelSearchFilters from "../components/HotelSearchFilters";
import About from "./About";
import Contact from "./Contact";

import hotels from "../data/hotels";
import { getStoredHotels, subscribeToHotelChanges } from "../data/hotelStorage";

function Home() {
  // Load hotels.
  const [allHotels, setAllHotels] = useState(() => getStoredHotels(hotels));

  // Search and filter states.
  const [filters, setFilters] = useState({
    search: "",
    location: "All locations",
    category: "All categories",
    minRating: 0,
    maxPrice: 0,
    sortBy: "recommended",
  });

  const [heroDestination, setHeroDestination] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Listen for hotel changes from the admin panel.
  useEffect(() => {
    function refreshHotels() {
      setAllHotels(getStoredHotels(hotels));
    }

    refreshHotels();

    return subscribeToHotelChanges(refreshHotels);
  }, []);

  // Only active hotels appear to customers.
  const availableHotels = useMemo(() => {
    return allHotels.filter(
      (hotel) => hotel.status?.toLowerCase() !== "inactive",
    );
  }, [allHotels]);

  // Calculate highest hotel price.
  const maxPrice = useMemo(() => {
    return Math.max(
      0,
      ...availableHotels.map((hotel) => Number(hotel.price) || 0),
    );
  }, [availableHotels]);

  // Update maximum price when hotels change.
  useEffect(() => {
    setFilters((previousFilters) => ({
      ...previousFilters,
      maxPrice:
        previousFilters.maxPrice === 0
          ? maxPrice
          : Math.max(previousFilters.maxPrice, maxPrice),
    }));
  }, [maxPrice]);

  // Unique locations.
  const locations = useMemo(() => {
    return [
      ...new Set(
        availableHotels
          .map((hotel) => {
            const location = (hotel.location || "").trim();
            const parts = location.split(",");

            if (
              parts.length > 1 &&
              parts[parts.length - 1].trim() === "Nepal"
            ) {
              return parts[0].trim();
            }

            return parts.length > 1 ? parts[parts.length - 1].trim() : location;
          })
          .filter(Boolean),
      ),
    ].sort();
  }, [availableHotels]);

  // Unique hotel categories.
  const categories = useMemo(() => {
    return [
      ...new Set(
        availableHotels
          .map((hotel) => (hotel.category || "").trim())
          .filter(Boolean),
      ),
    ].sort();
  }, [availableHotels]);

  // Search, filter and sort hotels.
  const filteredHotels = useMemo(() => {
    const searchText = filters.search.trim().toLowerCase();
    const destinationText = heroDestination.trim().toLowerCase();

    const results = availableHotels.filter((hotel) => {
      const name = (hotel.name || "").toLowerCase();
      const location = (hotel.location || "").toLowerCase();
      const category = (hotel.category || "").toLowerCase();

      const price = Number(hotel.price) || 0;
      const rating = Number(hotel.rating) || 0;

      // Search filter.
      const matchesSearch =
        !searchText ||
        name.includes(searchText) ||
        location.includes(searchText) ||
        category.includes(searchText);

      // Hero destination search.
      const matchesHero =
        !destinationText ||
        name.includes(destinationText) ||
        location.includes(destinationText) ||
        category.includes(destinationText);

      // Location filter.
      const primaryLocation = location.split(",")[0].trim();
      const selectedLocation = filters.location.toLowerCase();

      const matchesLocation =
        filters.location === "All locations" ||
        primaryLocation === selectedLocation ||
        location.includes(selectedLocation);

      // Category filter.
      const matchesCategory =
        filters.category === "All categories" ||
        category === filters.category.toLowerCase();

      // Price filter.
      const matchesPrice = price <= Number(filters.maxPrice);

      // Rating filter.
      const matchesRating = rating >= Number(filters.minRating || 0);

      return (
        matchesSearch &&
        matchesHero &&
        matchesLocation &&
        matchesCategory &&
        matchesPrice &&
        matchesRating
      );
    });

    // Sorting.
    if (filters.sortBy === "price-low") {
      results.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (filters.sortBy === "price-high") {
      results.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    } else if (filters.sortBy === "rating-high") {
      results.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    } else if (filters.sortBy === "name") {
      results.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }

    return results;
  }, [availableHotels, filters, heroDestination]);

  // Search from Hero.
  function handleHeroSearch({ destination = "" } = {}) {
    setHeroDestination(destination);
    setHasSearched(true);

    document.getElementById("hotels")?.scrollIntoView({
      behavior: "smooth",
    });
  }

  // Reset every filter.
  function handleReset() {
    setFilters({
      search: "",
      location: "All locations",
      category: "All categories",
      minRating: 0,
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
            categories={categories}
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
                  Try changing your search, category, rating or price filters.
                </p>

                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-5 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
                >
                  Reset all filters
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
