const STORAGE_KEY = "stayora_reviews";
import { addNotification } from "./notifications";
import { addActivityLog } from "./activityLogs";
const sampleReviews = [
  {
    reviewId: "REV-1001",
    guestName: "Aarav Sharma",
    guestEmail: "aarav@example.com",
    hotelName: "Himalayan Paradise",
    rating: 5,
    comment:
      "Amazing stay! The rooms were clean and the staff were very helpful.",
    date: "2026-10-20",
    status: "Approved",
  },
  {
    reviewId: "REV-1002",
    guestName: "Sita Thapa",
    guestEmail: "sita@example.com",
    hotelName: "Mountain View Resort",
    rating: 4,
    comment:
      "Beautiful location and comfortable rooms. Breakfast could be better.",
    date: "2026-10-22",
    status: "Pending",
  },
  {
    reviewId: "REV-1003",
    guestName: "Rohan Karki",
    guestEmail: "rohan@example.com",
    hotelName: "City Comfort Hotel",
    rating: 3,
    comment: "The stay was okay, but the check-in process took too long.",
    date: "2026-10-24",
    status: "Pending",
  },
];

function initializeReviews() {
  const storedReviews = localStorage.getItem(STORAGE_KEY);

  if (storedReviews === null) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleReviews));
  }
}

export function getReviews() {
  initializeReviews();

  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (error) {
    console.error("Could not read reviews:", error);
    return [];
  }
}

export function updateReviewStatus(reviewId, status) {
  const allowedStatuses = ["Approved", "Hidden"];

  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid review status");
  }

  const reviews = getReviews();

  const updatedReviews = reviews.map((review) =>
    review.reviewId === reviewId ? { ...review, status } : review,
  );

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReviews));

  window.dispatchEvent(new Event("reviewsUpdated"));

  return updatedReviews;
}

export function addReview(reviewData) {
  const comment = reviewData.comment?.trim();
  const rating = Number(reviewData.rating);

  if (!reviewData.guestName || !reviewData.guestEmail) {
    throw new Error("Please log in before submitting a review.");
  }

  if (!comment || comment.length < 5) {
    throw new Error("Please write at least 5 characters.");
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Please select a valid rating.");
  }

  const reviews = getReviews();

  const newReview = {
    reviewId:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `REV-${Date.now()}`,
    guestName: reviewData.guestName,
    guestEmail: reviewData.guestEmail,
    hotelId: reviewData.hotelId,
    hotelName: reviewData.hotelName,
    rating,
    comment,
    date: new Date().toISOString().split("T")[0],
    status: "Pending",
  };

  const updatedReviews = [newReview, ...reviews];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReviews));

  window.dispatchEvent(new Event("reviewsUpdated"));

  // Notify admin about the new review
  addNotification({
    title: "New Review Received",
    message: `${newReview.guestName} submitted a ${rating}-star review for ${newReview.hotelName || "a hotel"}.`,
    type: "review",
    link: "/admin/reviews",
  });

  addActivityLog({
    action: "Review Submitted",
    category: "Review",
    description: `${newReview.guestName} submitted a ${rating}-star review for ${newReview.hotelName || "a hotel"}.`,
    target: newReview.reviewId,
  });
  return newReview;
}

export function subscribeToReviewChanges(callback) {
  window.addEventListener("reviewsUpdated", callback);

  return () => {
    window.removeEventListener("reviewsUpdated", callback);
  };
}
