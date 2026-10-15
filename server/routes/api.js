import { CUSTOMER_STATUSES, REVIEW_STATUSES, validateReview, averageRating } from '../domain/logic.js';
import { demoCustomers, demoOrders, demoReviews } from '../data/demo.js';
import { readStore, saveStore } from '../services/crmStore.js';
import {
  liveConfigured,
  connectWooCommerce,
  checkWooCommerceConnection,
  loadCustomers,
  loadOrders
} from '../services/wooCommerce.js';
import { aiConfigured, summarizeReviews } from '../services/insights.js';
import { failure } from '../controllers/errors.js';

export function registerApiRoutes(app) {
app.get('/api/health', (_req, res) => res.json({ ok: true, mode: liveConfigured ? 'live-configured' : 'demo', ai: aiConfigured ? 'configured' : 'unavailable' }));
app.get('/api/health/woocommerce', async (_req, res) => {
  try {
    const result = await checkWooCommerceConnection();
    res.status(result.connected ? 200 : 503).json(result);
  } catch (error) {
    // Return only upstream status and a bounded, credential-redacted message.
    res.status(error.status || 502).json({
      connected: false,
      status: error.status || null,
      error: error.message.slice(0, 300)
    });
  }
});
app.get('/api/customers', async (_req, res) => {
  try { const result = await loadCustomers(); const db = await readStore(); res.json({ ...result, data: result.data.map(c => ({ ...c, status: db.customers[c.id]?.status || (Number(c.orders_count) ? 'Active' : 'Lead'), notes: db.customers[c.id]?.notes || '' })) }); }
  catch (e) { failure(res, e); }
});
app.patch('/api/customers/:id', async (req, res) => {
  const { status, notes } = req.body || {};
  if (status !== undefined && !CUSTOMER_STATUSES.includes(status)) return res.status(400).json({ error: `Status must be one of: ${CUSTOMER_STATUSES.join(', ')}.` });
  if (notes !== undefined && (typeof notes !== 'string' || notes.length > 5000)) return res.status(400).json({ error: 'Notes must be text of up to 5,000 characters.' });
  try { const db = await readStore(); const id = String(req.params.id); db.customers[id] = { ...(db.customers[id] || {}), ...(status !== undefined ? { status } : {}), ...(notes !== undefined ? { notes } : {}) }; await saveStore(db); res.json({ id, ...db.customers[id] }); } catch (e) { failure(res, e); }
});
app.get('/api/orders', async (_req, res) => {
  try { res.json(await loadOrders()); }
  catch (e) { failure(res, e); }
});
app.get('/api/reviews', async (_req, res) => { const db = await readStore(); res.json({ mode: db.reviews ? 'saved-demo' : 'demo', data: db.reviews || demoReviews }); });
app.post('/api/reviews', async (req, res) => {
  let validCustomers = demoCustomers;
  if (liveConfigured) { try { validCustomers = (await loadCustomers()).data; } catch { return res.status(503).json({ error: 'Customer records are temporarily unavailable.' }); } }
  const error = validateReview(req.body, validCustomers);
  if (error) return res.status(400).json({ error });
  try { const db = await readStore(); if (!db.reviews) db.reviews = demoReviews; const customer = validCustomers.find(c => String(c.id) === String(req.body.customer_id)); const review = { id: `review-${Date.now()}`, customer_id: customer.id, customer: `${customer.first_name} ${customer.last_name}`, rating: Number(req.body.rating), text: req.body.text.trim(), date: new Date().toISOString().slice(0, 10), status: 'New', demo: !liveConfigured }; db.reviews.unshift(review); await saveStore(db); res.status(201).json(review); } catch (e) { failure(res, e); }
});
app.patch('/api/reviews/:id', async (req, res) => {
  const status = req.body?.status; if (!REVIEW_STATUSES.includes(status)) return res.status(400).json({ error: `Status must be one of: ${REVIEW_STATUSES.join(', ')}.` });
  try { const db = await readStore(); db.reviews ||= demoReviews; const review = db.reviews.find(r => r.id === req.params.id); if (!review) return res.status(404).json({ error: 'Review not found.' }); review.status = status; await saveStore(db); res.json(review); } catch (e) { failure(res, e); }
});
app.get('/api/dashboard/stats', async (_req, res) => { try { const customers = await loadCustomers(); const db = await readStore(); const reviews = db.reviews || demoReviews; res.json({ mode: customers.mode, totalCustomers: customers.data.length, totalOrders: demoOrders.length, revenue: demoOrders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + Number(o.total), 0), pendingFollowUps: db.tasks.filter(t => t.status === 'Pending').length, statuses: Object.fromEntries(CUSTOMER_STATUSES.map(s => [s, customers.data.filter(c => (db.customers[c.id]?.status || (Number(c.orders_count) ? 'Active' : 'Lead')) === s).length])), averageRating: averageRating(reviews), reviewCount: reviews.length }); } catch (e) { failure(res, e); } });
app.post('/api/insights', async (req, res) => {
  const reviews = Array.isArray(req.body?.reviews) ? req.body.reviews.slice(0, 100) : [];
  if (!aiConfigured) return res.status(503).json({ error: 'AI insights are unavailable. Configure OPENAI_API_KEY and OPENAI_MODEL on the server.', available: false });
  try {
    res.json(await summarizeReviews(reviews));
  } catch (e) { console.error('AI insight request failed:', e.message); res.status(502).json({ error: 'The AI service could not generate insights right now. Your review data was not changed.', available: false }); }
});
}
