import HotelCard from "./HotelCard";

const FeaturedHotel = ({ hotels, hasSearched }) => {
  return (
    <section className="bg-white px-5 py-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-3 text-3xl font-bold">
          {hasSearched ? "Search Results" : "Featured Hotels"}
        </h2>

        {hasSearched && (
          <p className="mb-8 text-gray-500">{hotels.length} hotel(s) found</p>
        )}

        {hotels.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {hotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        ) : (
          <p className="rounded-xl bg-gray-50 p-8 text-gray-600">
            No hotels found for that destination.
          </p>
        )}
      </div>
    </section>
  );
};

export default FeaturedHotel;
