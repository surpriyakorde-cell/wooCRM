export const CUSTOMER_STATUSES = ['Lead', 'Active', 'At Risk', 'Inactive'];
export const REVIEW_STATUSES = ['New', 'Reviewed', 'Resolved'];
export function validateReview(review, customers) {
  if (!review || !Number.isInteger(Number(review.rating)) || Number(review.rating) < 1 || Number(review.rating) > 5) return 'Rating must be a whole number from 1 to 5.';
  if (typeof review.text !== 'string' || !review.text.trim() || review.text.trim().length > 2000) return 'Review text is required and must be 2,000 characters or fewer.';
  if (!customers.some(c => String(c.id) === String(review.customer_id))) return 'Choose a valid customer for this review.';
  return null;
}
export function averageRating(reviews) { return reviews.length ? Math.round((reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length) * 10) / 10 : 0; }
export function summarizeLocally(reviews) {
  const low = reviews.filter(r => r.rating <= 3);
  return { averageRating: averageRating(reviews), recurringComplaints: low.map(r => r.text), recommendation: low.length ? 'Review low-rated feedback and contact the affected customers.' : 'Continue monitoring feedback and thank customers for their reviews.' };
}
