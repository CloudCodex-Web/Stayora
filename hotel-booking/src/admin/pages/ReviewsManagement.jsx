
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
  Approved: "border-teal-500/20 bg-teal-500/10 text-teal-300",
  Pending: "border-amber-500/20 bg-amber-500/10 text-amber-300",
  Hidden: "border-gray-500/20 bg-gray-500/10 text-gray-400",
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
        .some((value) =>
          String(value).toLowerCase().includes(searchText)
        );

      const matchesRating =
        ratingFilter === "All" ||
        String(review.rating) === ratingFilter;

      const matchesStatus =
        statusFilter === "All" ||
        review.status === statusFilter;

      return matchesSearch && matchesRating && matchesStatus;
    });
  }, [reviews, search, ratingFilter, statusFilter]);

  const totalReviews = reviews.length;

  const averageRating =
    totalReviews > 0
      ? (
          reviews.reduce(
            (total, review) =>
              total + Number(review.rating || 0),
            0
          ) / totalReviews
        ).toFixed(1)
      : "0.0";

  const pendingReviews = reviews.filter(
    (review) => review.status === "Pending"
  ).length;

  const approvedReviews = reviews.filter(
    (review) => review.status === "Approved"
  ).length;

  function handleStatusChange(reviewId, status) {
    try {
      const review = reviews.find(
        (item) => item.reviewId === reviewId
      );

      if (!review) {
        alert("Review not found. Please refresh and try again.");
        return;
      }

      updateReviewStatus(reviewId, status);
      setReviews(getReviews());

      addActivityLog({
        action:
          status === "Approved"
            ? "Review Approved"
            : "Review Hidden",
        category: "Review",
        description: `${review.guestName || "A guest"}'s review for ${
          review.hotelName || "a hotel"
        } was ${status.toLowerCase()}.`,
        target: reviewId,
      });

      if (selectedReview?.reviewId === reviewId) {
        setSelectedReview((previous) =>
          previous ? { ...previous, status } : null
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
                : "text-gray-600"
            }
          />
        ))}
      </div>
    );
  }

  function formatDate(date) {
    if (!date) return "—";

    const parsedDate = new Date(
      String(date).length === 10
        ? `${date}T00:00:00`
        : date
    );

    return Number.isNaN(parsedDate.getTime())
      ? "—"
      : parsedDate.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  }

  const cardStyle =
    "rounded-2xl border border-white/[0.07] bg-[#191727]/80 shadow-[0_8px_30px_rgba(0,0,0,0.15)]";

  const inputStyle =
    "w-full rounded-xl border border-white/[0.08] bg-[#11101c] px-4 py-3 text-sm text-gray-200 outline-none transition focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/10";

  return (
    <div className="min-h-screen bg-[#11101c] p-4 text-gray-200 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-purple-400">
            Stayora Administration
          </p>

          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Reviews Management
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Monitor guest feedback and manage hotel reviews.
          </p>
        </div>

        {/* Statistics */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Reviews"
            value={totalReviews}
            icon={MessageSquare}
            color="purple"
          />

          <StatCard
            label="Average Rating"
            value={averageRating}
            icon={Star}
            color="amber"
          />

          <StatCard
            label="Pending Reviews"
            value={pendingReviews}
            icon={Clock}
            color="blue"
          />

          <StatCard
            label="Approved Reviews"
            value={approvedReviews}
            icon={CheckCircle}
            color="teal"
          />
        </div>

        {/* Search and Filters */}
        <div className={`${cardStyle} mb-6 flex flex-col gap-4 p-4 lg:flex-row`}>
          <div className="relative min-w-0 flex-1">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search guest, hotel, review..."
              className={`${inputStyle} pl-11`}
            />
          </div>

          <select
            value={ratingFilter}
            onChange={(event) => setRatingFilter(event.target.value)}
            className={`${inputStyle} lg:w-44`}
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
            className={`${inputStyle} lg:w-44`}
          >
            {["All", "Pending", "Approved", "Hidden"].map((status) => (
              <option key={status} value={status}>
                {status === "All" ? "All statuses" : status}
              </option>
            ))}
          </select>
        </div>

        {/* Reviews Table */}
        <div className={`${cardStyle} overflow-hidden`}>
          <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
            <div>
              <h2 className="font-bold text-white">
                Guest Reviews
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Review submissions and moderation
              </p>
            </div>

            <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
              {filteredReviews.length} results
            </span>
          </div>

          {filteredReviews.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-[#211d35] text-gray-500">
                <MessageSquare size={30} />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-white">
                No reviews found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="bg-[#211d35]/70 text-xs uppercase tracking-wide text-gray-400">
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

                <tbody className="divide-y divide-white/[0.06]">
                  {filteredReviews.map((review) => (
                    <tr
                      key={review.reviewId}
                      className="transition hover:bg-white/[0.025]"
                    >
                      <td className="px-5 py-5">
                        <p className="font-semibold text-gray-200">
                          {review.guestName || "Guest"}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {review.guestEmail || "No email"}
                        </p>
                      </td>

                      <td className="px-5 py-5 font-medium text-gray-300">
                        {review.hotelName || "Hotel"}
                      </td>

                      <td className="px-5 py-5">
                        {renderStars(review.rating)}
                      </td>

                      <td className="max-w-xs px-5 py-5 text-gray-400">
                        <p className="line-clamp-2">
                          {review.comment || "No comment"}
                        </p>

                        <button
                          type="button"
                          onClick={() => setSelectedReview(review)}
                          className="mt-2 font-semibold text-purple-400 transition hover:text-purple-300"
                        >
                          Read more
                        </button>
                      </td>

                      <td className="px-5 py-5 text-gray-400">
                        {formatDate(review.date)}
                      </td>

                      <td className="px-5 py-5">
                        <StatusBadge status={review.status} />
                      </td>

                      <td className="px-5 py-5">
                        {review.status === "Pending" ? (
                          <div className="flex flex-col gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleStatusChange(
                                  review.reviewId,
                                  "Approved"
                                )
                              }
                              className="rounded-lg border border-teal-500/20 bg-teal-500/10 px-3 py-2 text-xs font-semibold text-teal-300 transition hover:bg-teal-500/20"
                            >
                              Approve
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleStatusChange(
                                  review.reviewId,
                                  "Hidden"
                                )
                              }
                              className="rounded-lg border border-white/[0.08] bg-[#211d35] px-3 py-2 text-xs font-semibold text-gray-400 transition hover:bg-white/[0.08] hover:text-white"
                            >
                              <span className="inline-flex items-center justify-center gap-1">
                                <EyeOff size={13} />
                                Hide
                              </span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">
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

        <p className="mt-4 text-xs leading-5 text-gray-500">
          Demo mode: reviews are stored in this browser. A backend and
          database will be needed to securely manage real guest reviews.
        </p>
      </div>

      {/* Review Details Modal */}
      {selectedReview && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setSelectedReview(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-modal-title"
            className="w-full max-w-lg rounded-2xl border border-white/[0.09] bg-[#191727] p-6 text-gray-200 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-purple-400">
                  Guest Feedback
                </p>

                <h2
                  id="review-modal-title"
                  className="mt-1 text-xl font-bold text-white"
                >
                  Review Details
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                className="rounded-lg border border-white/[0.07] p-2 text-gray-400 transition hover:bg-white/[0.06] hover:text-white"
                aria-label="Close review details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-[#211d35]/60 p-4">
              <p className="font-semibold text-white">
                {selectedReview.guestName || "Guest"}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {selectedReview.guestEmail || "No email"}
              </p>

              <div className="mt-4">
                {renderStars(selectedReview.rating)}
              </div>

              <p className="mt-4 text-sm font-medium text-purple-300">
                {selectedReview.hotelName || "Hotel"}
              </p>

              <div className="mt-4 rounded-xl border border-white/[0.06] bg-[#11101c] p-4 text-sm leading-6 text-gray-300">
                {selectedReview.comment || "No comment provided."}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-gray-500">
                  {formatDate(selectedReview.date)}
                </span>

                <StatusBadge status={selectedReview.status} />
              </div>
            </div>

            {selectedReview.status === "Pending" && (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() =>
                    handleStatusChange(
                      selectedReview.reviewId,
                      "Approved"
                    )
                  }
                  className="flex-1 rounded-xl border border-teal-500/20 bg-teal-500/10 py-3 text-sm font-semibold text-teal-300 transition hover:bg-teal-500/20"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <CheckCircle size={16} />
                    Approve Review
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleStatusChange(
                      selectedReview.reviewId,
                      "Hidden"
                    )
                  }
                  className="flex-1 rounded-xl border border-white/[0.08] bg-[#211d35] py-3 text-sm font-semibold text-gray-300 transition hover:bg-white/[0.08]"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <EyeOff size={16} />
                    Hide Review
                  </span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setSelectedReview(null)}
              className="mt-4 w-full rounded-xl border border-white/[0.07] py-3 text-sm font-semibold text-gray-400 transition hover:bg-white/[0.05] hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  const colorClasses = {
    purple: "border-purple-500/20 bg-purple-500/10 text-purple-400",
    amber: "border-amber-500/20 bg-amber-500/10 text-amber-400",
    blue: "border-blue-500/20 bg-blue-500/10 text-blue-400",
    teal: "border-teal-500/20 bg-teal-500/10 text-teal-400",
  };

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#191727]/80 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.15)]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-400">
          {label}
        </p>

        <div
          className={`rounded-xl border p-2 ${
            colorClasses[color] || colorClasses.purple
          }`}
        >
          <Icon size={20} />
        </div>
      </div>

      <p className="mt-4 text-3xl font-extrabold text-white">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const label = status || "Pending";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        statusStyles[label] || statusStyles.Pending
      }`}
    >
      {label}
    </span>
  );
}
