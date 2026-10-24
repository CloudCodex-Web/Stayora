function HotelSearchFilters({ filters, setFilters, locations, maxPrice }) {
  function updateFilter(name, value) {
    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function resetFilters() {
    setFilters({
      search: "",
      location: "All locations",
      maxPrice,
      sortBy: "recommended",
    });
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900">
          Find your perfect stay
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Search, filter, and discover your next destination.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* Search */}
        <div>
          <label
            htmlFor="hotelSearch"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Search hotels
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-gray-300 px-3 focus-within:border-emerald-600">
            <span className="text-gray-400">⌕</span>
            <input
              id="hotelSearch"
              type="search"
              placeholder="Hotel name or location"
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
              className="w-full py-3 text-sm outline-none"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label
            htmlFor="hotelLocation"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Location
          </label>
          <select
            id="hotelLocation"
            value={filters.location}
            onChange={(event) => updateFilter("location", event.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm outline-none focus:border-emerald-600"
          >
            <option value="All locations">All locations</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        {/* Price */}
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <label
              htmlFor="maxHotelPrice"
              className="text-sm font-semibold text-gray-700"
            >
              Maximum price
            </label>
            <span className="text-sm font-bold text-emerald-700">
              NPR {Number(filters.maxPrice).toLocaleString("en-IN")}
            </span>
          </div>
          <input
            id="maxHotelPrice"
            type="range"
            min="0"
            max={maxPrice}
            step="500"
            value={filters.maxPrice}
            onChange={(event) =>
              updateFilter("maxPrice", Number(event.target.value))
            }
            className="mt-3 w-full accent-emerald-700"
          />
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>NPR 0</span>
            <span>NPR {Number(maxPrice).toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Sorting */}
        <div>
          <label
            htmlFor="hotelSort"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Sort hotels
          </label>
          <select
            id="hotelSort"
            value={filters.sortBy}
            onChange={(event) => updateFilter("sortBy", event.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm outline-none focus:border-emerald-600"
          >
            <option value="recommended">Recommended</option>
            <option value="price-low">Price: Low to high</option>
            <option value="price-high">Price: High to low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={resetFilters}
          className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          Reset filters
        </button>
      </div>
    </section>
  );
}

export default HotelSearchFilters;
