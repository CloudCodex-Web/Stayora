import { useEffect, useMemo, useState } from "react";
import {
  Star,
  MessageSquare,
  Clock,
  CheckCircle,
  EyeOff,
  Search,
  X,
} from "lucide-react";

import {
  getReviews,
  updateReviewStatus,
  subscribeToReviewChanges,
} from "../../utils/reviews";
import { addActivityLog } from "../../utils/activityLogs";

const statusStyles = {
  Approved: "bg-green-100 text-green-700",
  Pending: "bg-amber-100 text-amber-700",
  Hidden: "bg-gray-100 text-gray-600",
};

export default function ReviewsManagement() {
  const [reviews, setReviews] = useState(() => getReviews());
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedReview, setSelectedReview] = useState(null);

  useEffect(() => {
    const refreshReviews = () => setReviews(getReviews());

    const unsubscribe = subscribeToReviewChanges(refreshReviews);
    refreshReviews();

    return unsubscribe;
  }, []);

  const filteredReviews = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return reviews.filter((review) => {
      const matchesSearch = [
        review.guestName,
        review.guestEmail,
        review.hotelName,
        review.comment,
        review.reviewId,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(searchText));

      const matchesRating =
        ratingFilter === "All" || String(review.rating) === ratingFilter;

      const matchesStatus =
        statusFilter === "All" || review.status === statusFilter;

      return matchesSearch && matchesRating && matchesStatus;
    });
  }, [reviews, search, ratingFilter, statusFilter]);

  const totalReviews = reviews.length;

  const averageRating =
    totalReviews > 0
      ? (
          reviews.reduce(
            (total, review) => total + Number(review.rating || 0),
            0,
          ) / totalReviews
        ).toFixed(1)
      : "0.0";

  const pendingReviews = reviews.filter(
    (review) => review.status === "Pending",
  ).length;

  const approvedReviews = reviews.filter(
    (review) => review.status === "Approved",
  ).length;

  function handleStatusChange(reviewId, status) {
    try {
      const review = reviews.find((item) => item.reviewId === reviewId);

      updateReviewStatus(reviewId, status);
      setReviews(getReviews());

      if (review) {
        addActivityLog({
          action: status === "Approved" ? "Review Approved" : "Review Hidden",
          category: "Review",
          description: `${review.guestName || "A guest"}'s review for ${
            review.hotelName || "a hotel"
          } was ${status.toLowerCase()}.`,
          target: reviewId,
        });
      }

      if (selectedReview?.reviewId === reviewId) {
        setSelectedReview((previous) =>
          previous ? { ...previous, status } : null,
        );
      }
    } catch (error) {
      console.error("Could not update review:", error);
      alert("Unable to update review. Please try again.");
    }
  }

  function renderStars(rating) {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={15}
            className={
              star <= Number(rating)
                ? "fill-amber-400 text-amber-400"
                : "text-gray-300"
            }
          />
        ))}
      </div>
    );
  }

  function formatDate(date) {
    if (!date) return "—";

    const parsedDate = new Date(
      String(date).length === 10 ? `${date}T00:00:00` : date,
    );

    return Number.isNaN(parsedDate.getTime())
      ? "—"
      : parsedDate.toLocaleDateString();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-amber-600">
            Stayora Administration
          </p>

          <h1 className="text-3xl font-bold text-gray-900">
            Reviews Management
          </h1>

          <p className="mt-2 text-gray-500">
            Monitor guest feedback and manage hotel reviews.
          </p>
        </div>

        {/* Statistics */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Total Reviews",
              value: totalReviews,
              icon: MessageSquare,
              color: "text-gray-900",
              bg: "bg-gray-100",
            },
            {
              label: "Average Rating",
              value: averageRating,
              icon: Star,
              color: "text-amber-600",
              bg: "bg-amber-50",
            },
            {
              label: "Pending Reviews",
              value: pendingReviews,
              icon: Clock,
              color: "text-amber-600",
              bg: "bg-amber-50",
            },
            {
              label: "Approved Reviews",
              value: approvedReviews,
              icon: CheckCircle,
              color: "text-green-600",
              bg: "bg-green-50",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">{item.label}</p>

                  <div className={`rounded-xl p-2 ${item.bg}`}>
                    <Icon size={20} className={item.color} />
                  </div>
                </div>

                <p className={`mt-3 text-3xl font-bold ${item.color}`}>
                  {item.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm lg:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search guest, hotel, review..."
              className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            />
          </div>

          <select
            value={ratingFilter}
            onChange={(event) => setRatingFilter(event.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-amber-500"
          >
            <option value="All">All ratings</option>
            {[5, 4, 3, 2, 1].map((rating) => (
              <option key={rating} value={String(rating)}>
                {rating} Stars
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-amber-500"
          >
            {["All", "Pending", "Approved", "Hidden"].map((status) => (
              <option key={status} value={status}>
                {status === "All" ? "All statuses" : status}
              </option>
            ))}
          </select>
        </div>

        {/* Reviews Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="font-semibold text-gray-900">Guest Reviews</h2>

            <span className="text-sm text-gray-500">
              {filteredReviews.length} results
            </span>
          </div>

          {filteredReviews.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <MessageSquare size={35} className="mx-auto mb-4 text-gray-300" />

              <h3 className="text-lg font-semibold text-gray-800">
                No reviews found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-4">Guest</th>
                    <th className="px-5 py-4">Hotel</th>
                    <th className="px-5 py-4">Rating</th>
                    <th className="px-5 py-4">Comment</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredReviews.map((review) => (
                    <tr
                      key={review.reviewId}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-5 py-5">
                        <p className="font-semibold text-gray-900">
                          {review.guestName || "Guest"}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {review.guestEmail || "No email"}
                        </p>
                      </td>

                      <td className="px-5 py-5 font-medium text-gray-800">
                        {review.hotelName || "Hotel"}
                      </td>

                      <td className="px-5 py-5">
                        {renderStars(review.rating)}
                      </td>

                      <td className="max-w-xs px-5 py-5 text-gray-600">
                        <p className="line-clamp-2">
                          {review.comment || "No comment"}
                        </p>

                        <button
                          onClick={() => setSelectedReview(review)}
                          className="mt-2 font-semibold text-amber-600 hover:text-amber-700"
                        >
                          Read more
                        </button>
                      </td>

                      <td className="px-5 py-5 text-gray-600">
                        {formatDate(review.date)}
                      </td>

                      <td className="px-5 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            statusStyles[review.status] || statusStyles.Pending
                          }`}
                        >
                          {review.status || "Pending"}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        {review.status === "Pending" ? (
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() =>
                                handleStatusChange(review.reviewId, "Approved")
                              }
                              className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
                            >
                              Approve
                            </button>

                            <button
                              onClick={() =>
                                handleStatusChange(review.reviewId, "Hidden")
                              }
                              className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                            >
                              Hide
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">
                            No action needed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="mt-4 text-xs leading-5 text-gray-400">
          Demo mode: reviews are stored in this browser. A backend and database
          will be needed to securely manage real guest reviews.
        </p>
      </div>

      {/* Review Details Modal */}
      {selectedReview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedReview(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Review Details
              </h2>

              <button
                onClick={() => setSelectedReview(null)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close review details"
              >
                <X size={20} />
              </button>
            </div>

            <p className="font-semibold text-gray-900">
              {selectedReview.guestName || "Guest"}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              {selectedReview.guestEmail || "No email"}
            </p>

            <div className="mt-4">{renderStars(selectedReview.rating)}</div>

            <p className="mt-4 text-sm text-gray-700">
              {selectedReview.hotelName || "Hotel"}
            </p>

            <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm leading-6 text-gray-700">
              {selectedReview.comment || "No comment provided."}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {formatDate(selectedReview.date)}
              </span>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  statusStyles[selectedReview.status] || statusStyles.Pending
                }`}
              >
                {selectedReview.status}
              </span>
            </div>

            {selectedReview.status === "Pending" && (
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() =>
                    handleStatusChange(selectedReview.reviewId, "Approved")
                  }
                  className="flex-1 rounded-xl bg-green-600 py-3 text-sm font-semibold text-white hover:bg-green-700"
                >
                  Approve Review
                </button>

                <button
                  onClick={() =>
                    handleStatusChange(selectedReview.reviewId, "Hidden")
                  }
                  className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Hide Review
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
