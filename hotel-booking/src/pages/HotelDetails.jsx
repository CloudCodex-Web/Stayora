import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import hotels from "../data/hotels";
import BookingForm from "../components/BookingForm";
import { getStoredHotels, subscribeToHotelChanges } from "../data/hotelStorage";
import { Heart, Star } from "lucide-react";
import { useFavorites } from "../context/FavoritesContext";
import {
  getReviews,
  addReview,
  subscribeToReviewChanges,
} from "../utils/reviews";

const galleryPhotos = [
  {
    url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=85",
    alt: "Hotel exterior and resort pool",
  },
  {
    url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1400&q=85",
    alt: "Comfortable hotel room",
  },
  {
    url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1400&q=85",
    alt: "Resort swimming pool",
  },
  {
    url: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1400&q=85",
    alt: "Hotel bedroom interior",
  },
];

const defaultAmenities = [
  "Free Wi-Fi",
  "Restaurant",
  "Room service",
  "Free parking",
  "Air conditioning",
  "24-hour reception",
];

function HotelDetails() {
  const { id } = useParams();

  const [activeImage, setActiveImage] = useState(0);
  const [reviews, setReviews] = useState(() => getReviews());
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");

  const { user } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [allHotels, setAllHotels] = useState(() => getStoredHotels(hotels));

  useEffect(() => {
    const refreshHotels = () => {
      setAllHotels(getStoredHotels(hotels));
    };

    refreshHotels();

    return subscribeToHotelChanges(refreshHotels);
  }, []);

  useEffect(() => {
    const refreshReviews = () => {
      setReviews(getReviews());
    };

    refreshReviews();

    return subscribeToReviewChanges(refreshReviews);
  }, []);

  const hotel = allHotels.find((item) => String(item.id) === String(id));

  if (!hotel) {
    return (
      <div className="min-h-screen bg-gray-50 p-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Hotel not found</h1>

        <p className="mt-3 text-gray-600">
          This hotel may have been removed or the link may be incorrect.
        </p>

        <Link
          to="/"
          className="mt-5 inline-block font-semibold text-emerald-700"
        >
          ← Back to home
        </Link>
      </div>
    );
  }

  const photos = [
    ...(hotel.image ? [{ url: hotel.image, alt: hotel.name }] : []),
    ...(Array.isArray(hotel.gallery)
      ? hotel.gallery.map((photo) =>
          typeof photo === "string" ? { url: photo, alt: hotel.name } : photo,
        )
      : galleryPhotos),
  ];

  const safeActiveImage = activeImage < photos.length ? activeImage : 0;

  const amenities = Array.isArray(hotel.amenities)
    ? hotel.amenities
    : defaultAmenities;

  const description =
    hotel.description ||
    `Enjoy a comfortable stay at ${hotel.name}, located in ${hotel.location}. Explore the surrounding area and enjoy your visit. Please confirm facilities and availability with the property before booking.`;

  const hotelReviews = reviews
    .filter(
      (review) =>
        String(review.hotelId ?? review.hotelName) === String(hotel.id) ||
        (!review.hotelId && review.hotelName === hotel.name),
    )
    .filter((review) => review.status === "Approved");

  const handleReviewSubmit = (e) => {
    e.preventDefault();

    try {
      addReview({
        guestName: user.name,
        guestEmail: user.email,
        hotelId: hotel.id,
        hotelName: hotel.name,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });

      setReviewComment("");
      setReviewRating(5);

      setReviewMessage(
        "Your review has been submitted and is waiting for admin approval.",
      );
    } catch (error) {
      setReviewMessage(error.message || "Could not submit review.");
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50 px-5 py-8 md:px-10">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/"
            className="mb-6 inline-block font-medium text-emerald-700 hover:text-emerald-900"
          >
            ← Back to hotels
          </Link>

          <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
            {/* Hotel photo gallery */}

            {photos.length > 0 && (
              <section aria-label="Hotel photo gallery" className="p-4 md:p-6">
                <div className="relative overflow-hidden rounded-2xl bg-gray-100">
                  <img
                    key={photos[safeActiveImage].url}
                    src={photos[safeActiveImage].url}
                    alt={photos[safeActiveImage].alt || hotel.name}
                    className="h-72 w-full object-cover transition duration-300 md:h-[460px]"
                  />

                  <span className="absolute bottom-4 right-4 rounded-full bg-black/65 px-4 py-2 text-sm font-medium text-white">
                    {safeActiveImage + 1} / {photos.length} photos
                  </span>
                </div>

                {photos.length > 1 && (
                  <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
                    {photos.map((photo, index) => (
                      <button
                        key={`${photo.url}-${index}`}
                        type="button"
                        onClick={() => setActiveImage(index)}
                        aria-label={`View photo ${index + 1}`}
                        aria-pressed={safeActiveImage === index}
                        className={`overflow-hidden rounded-xl border-2 transition ${
                          safeActiveImage === index
                            ? "border-emerald-700 ring-2 ring-emerald-100"
                            : "border-transparent hover:border-emerald-300"
                        }`}
                      >
                        <img
                          src={photo.url}
                          alt={photo.alt || hotel.name}
                          className="h-20 w-full object-cover sm:h-24"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}

            <div className="grid gap-8 p-6 pt-2 md:grid-cols-[1fr_320px] md:p-10">
              <section>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800">
                  {hotel.category || "Hotel"}
                </span>

                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <h1 className="text-3xl font-extrabold text-gray-900 md:text-4xl">
                    {hotel.name}
                  </h1>

                  {user ? (
                    <button
                      type="button"
                      onClick={() => toggleFavorite(hotel.id)}
                      aria-label={
                        isFavorite(hotel.id)
                          ? "Remove from wishlist"
                          : "Add to wishlist"
                      }
                      aria-pressed={isFavorite(hotel.id)}
                      className={`flex shrink-0 items-center justify-center gap-2 rounded-xl border px-5 py-3 font-semibold transition ${
                        isFavorite(hotel.id)
                          ? "border-red-200 bg-red-50 text-red-600"
                          : "border-gray-200 bg-white text-gray-700 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                      }`}
                    >
                      <Heart
                        size={20}
                        fill={isFavorite(hotel.id) ? "currentColor" : "none"}
                      />

                      {isFavorite(hotel.id) ? "Saved" : "Save to Wishlist"}
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-700 hover:border-emerald-300 hover:text-emerald-700"
                    >
                      <Heart size={20} />
                      Log in to save
                    </Link>
                  )}
                </div>  

                <p className="mt-3 text-gray-600">
                  <span className="mr-2">📍</span>
                  {hotel.location}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="rounded-lg bg-emerald-700 px-3 py-2 font-bold text-white">
                    ★ {hotel.rating ?? "New"}
                  </span>

                  <span className="text-sm text-gray-600">
                    {hotel.reviews ?? 0} reviews
                  </span>
                </div>

                <div className="my-8 border-t border-gray-200" />

                <h2 className="text-2xl font-bold text-gray-900">
                  About this hotel
                </h2>

                <p className="mt-3 leading-7 text-gray-600">{description}</p>

                <h2 className="mt-8 text-2xl font-bold text-gray-900">
                  Popular amenities
                </h2>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {amenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="rounded-xl border border-gray-200 p-4 text-gray-700"
                    >
                      <span className="mr-2 text-emerald-700">✓</span>
                      {amenity}
                    </div>
                  ))}
                </div>

                <h2 className="mt-8 text-2xl font-bold text-gray-900">
                  Room information
                </h2>

                <div className="mt-4 rounded-2xl border border-gray-200 p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-2xl">
                      🛏️
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900">
                        {hotel.roomType || "Standard Room"}
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-gray-500">
                        {hotel.roomDescription ||
                          "A comfortable room for your stay. Confirm bed type, occupancy, and included facilities with the property."}
                      </p>

                      {hotel.maxGuests && (
                        <p className="mt-2 text-sm text-gray-600">
                          Maximum guests: {hotel.maxGuests}
                        </p>
                      )}

                      <p className="mt-3 text-sm font-semibold text-emerald-700">
                        NPR {Number(hotel.price || 0).toLocaleString("en-IN")} /
                        night
                      </p>
                    </div>
                  </div>
                </div>

                <h2 className="mt-8 text-2xl font-bold text-gray-900">
                  Check-in and check-out
                </h2>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Check-in</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {hotel.checkIn || "Contact property"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Check-out</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {hotel.checkOut || "Contact property"}
                    </p>
                  </div>
                </div>

                {hotel.policies && (
                  <>
                    <h2 className="mt-8 text-2xl font-bold text-gray-900">
                      Hotel policies
                    </h2>

                    <p className="mt-3 leading-7 text-gray-600">
                      {hotel.policies}
                    </p>
                  </>
                )}

                {/* Guest Reviews */}

                <section className="mt-10 border-t border-gray-200 pt-8">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Guest Reviews
                  </h2>

                  {hotelReviews.map((review) => (
                    <div
                      key={review.reviewId}
                      className="mt-4 rounded-xl border border-gray-200 p-5"
                    >
                      <div className="flex justify-between gap-3">
                        <h3 className="font-semibold text-gray-900">
                          {review.guestName}
                        </h3>

                        <span className="flex text-amber-400">
                          {Array.from({ length: 5 }, (_, index) => (
                            <Star
                              key={index}
                              size={17}
                              fill={
                                index < review.rating ? "currentColor" : "none"
                              }
                            />
                          ))}
                        </span>
                      </div>

                      <p className="mt-3 text-gray-600">{review.comment}</p>

                      <p className="mt-3 text-xs text-gray-400">
                        {review.date}
                      </p>
                    </div>
                  ))}

                  {/* Logged-in and logged-out review forms */}

                  {user ? (
                    <div className="mt-8 rounded-2xl border border-gray-200 p-6">
                      <h3 className="text-xl font-bold text-gray-900">
                        Write a Review
                      </h3>

                      <form
                        className="mt-5 space-y-5"
                        onSubmit={handleReviewSubmit}
                      >
                        <div>
                          <label className="block font-semibold text-gray-700">
                            Your Rating
                          </label>

                          <div className="mt-2 flex gap-2">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <button
                                key={rating}
                                type="button"
                                onClick={() => setReviewRating(rating)}
                                aria-label={`Rate ${rating} out of 5`}
                              >
                                <Star
                                  size={30}
                                  className={
                                    rating <= reviewRating
                                      ? "text-amber-400"
                                      : "text-gray-300"
                                  }
                                  fill={
                                    rating <= reviewRating
                                      ? "currentColor"
                                      : "none"
                                  }
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block font-semibold text-gray-700">
                            Your Review
                          </label>

                          <textarea
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            required
                            minLength={5}
                            maxLength={1000}
                            rows={4}
                            placeholder="Tell us about your experience..."
                            className="mt-2 w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-emerald-600"
                          />
                        </div>

                        <button
                          type="submit"
                          className="rounded-xl bg-emerald-700 px-6 py-3 font-semibold text-white hover:bg-emerald-800"
                        >
                          Submit Review
                        </button>

                        {reviewMessage && (
                          <p className="text-sm text-emerald-700" role="status">
                            {reviewMessage}
                          </p>
                        )}
                      </form>
                    </div>
                  ) : (
                    <div className="mt-8 rounded-2xl border border-gray-200 p-6">
                      <h3 className="text-xl font-bold text-gray-900">
                        Write a Review
                      </h3>

                      <p className="mt-3 text-gray-600">
                        Please log in to share your experience.
                      </p>

                      <Link
                        to="/login"
                        className="mt-4 inline-block rounded-xl bg-emerald-700 px-6 py-3 font-semibold text-white"
                      >
                        Log In
                      </Link>
                    </div>
                  )}
                </section>
              </section>

              <aside className="h-fit rounded-2xl border border-gray-200 p-6 shadow-sm md:sticky md:top-24">
                <div className="mb-5">
                  <p className="text-sm text-gray-500">Price per night</p>

                  <p className="mt-1 text-2xl font-extrabold text-gray-900">
                    NPR {Number(hotel.price || 0).toLocaleString("en-IN")}
                  </p>
                </div>

                <BookingForm hotel={hotel} />
              </aside>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default HotelDetails;
