import test from 'node:test';
import assert from 'node:assert/strict';
import { averageRating, validateReview, summarizeLocally } from '../domain/logic.js';

const customers = [{ id: 1 }, { id: 2 }];
test('review validation accepts valid ratings and associated customers', () => {
  assert.equal(validateReview({ rating: 5, text: 'Great', customer_id: 1 }, customers), null);
});
test('review validation rejects invalid rating, blank text, and unknown customer', () => {
  assert.match(validateReview({ rating: 6, text: 'x', customer_id: 1 }, customers), /Rating/);
  assert.match(validateReview({ rating: 4, text: ' ', customer_id: 1 }, customers), /text/);
  assert.match(validateReview({ rating: 4, text: 'ok', customer_id: 9 }, customers), /customer/);
});
test('rating calculation is rounded and empty lists return zero', () => {
  assert.equal(averageRating([{rating:5},{rating:4},{rating:2}]), 3.7);
  assert.equal(averageRating([]), 0);
});
test('local summaries identify low rated evidence without presenting as AI', () => {
  const result = summarizeLocally([{ rating: 2, text: 'Slow delivery' }]);
  assert.deepEqual(result.recurringComplaints, ['Slow delivery']);
  assert.match(result.recommendation, /contact/);
});
