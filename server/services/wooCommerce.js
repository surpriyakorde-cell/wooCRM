
import { demoCustomers, demoOrders } from '../data/demo.js';

let storeUrl = process.env.WOOCOMMERCE_STORE_URL?.replace(/\/+$/, '');
let consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
let consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;

function credentialsConfigured() {
  return Boolean(
    storeUrl &&
    consumerKey &&
    consumerSecret &&
    !consumerKey.includes('replace_me') &&
    !consumerSecret.includes('replace_me')
  );
}

export let liveConfigured = credentialsConfigured();

function validateStoreUrl(value) {
  let parsed;

  try {
    parsed = new URL(value);
  } catch {
    throw new Error('Enter a valid store URL.');
  }

  if (
    parsed.protocol !== 'https:' ||
    parsed.username ||
    parsed.password ||
    parsed.hostname === 'localhost' ||
    !parsed.hostname.includes('.')
  ) {
    throw new Error('Enter a valid public HTTPS store URL.');
  }

  // WordPress may be installed below the domain root (for example on a
  // scoped Playground URL), so retain its path while dropping query/hash.
  return `${parsed.origin}${parsed.pathname.replace(/\/+$/, '')}`;
}

async function requestWoo(baseUrl, key, secret, endpoint) {
  const url = new URL(`${baseUrl}/wp-json/wc/v3/${endpoint}`);

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      Authorization:
        'Basic ' +
        Buffer.from(`${key}:${secret}`).toString('base64')
    },
    redirect: 'error',
    signal: AbortSignal.timeout(10000)
  });

  if (!response.ok) {
    let message = '';
    try {
      const body = await response.json();
      message = typeof body.message === 'string' ? body.message : '';
    } catch { /* Ignore non-JSON upstream errors. */ }
    // Avoid forwarding any credential-like value in upstream messages.
    for (const sensitive of [key, secret]) {
      if (sensitive) message = message.split(sensitive).join('[redacted]');
    }
    const error = new Error(message.slice(0, 300) || `WooCommerce API returned HTTP ${response.status}.`);
    error.status = response.status;
    throw error;
  }

  return { data: await response.json(), totalPages: Number(response.headers.get('x-wp-totalpages') || 1) };
}

async function wooGet(endpoint) {
  if (!liveConfigured) throw new Error('WooCommerce store is not connected.');
  return (await requestWoo(storeUrl, consumerKey, consumerSecret, endpoint)).data;
}

async function wooGetAll(resource) {
  const all = [];
  for (let page = 1; page <= 100; page += 1) {
    const result = await requestWoo(
      storeUrl, consumerKey, consumerSecret,
      `${resource}?per_page=100&page=${page}`
    );
    all.push(...result.data);
    if (page >= result.totalPages || result.data.length === 0) break;
  }
  return all;
}

export async function checkWooCommerceConnection() {
  if (!liveConfigured) return { connected: false, configured: false };
  await wooGet('customers?per_page=1');
  return { connected: true, configured: true };
}

export async function connectWooCommerce({
  storeUrl: inputUrl,
  consumerKey: key,
  consumerSecret: secret
}) {
  if (
    typeof inputUrl !== 'string' ||
    typeof key !== 'string' ||
    typeof secret !== 'string' ||
    !key.trim() ||
    !secret.trim()
  ) {
    throw new Error(
      'Store URL, Consumer Key and Consumer Secret are required.'
    );
  }

  const baseUrl = validateStoreUrl(inputUrl.trim());

  // Verify credentials before saving them in memory.
  await requestWoo(
    baseUrl,
    key.trim(),
    secret.trim(),
    'customers?per_page=1'
  );

  storeUrl = baseUrl;
  consumerKey = key.trim();
  consumerSecret = secret.trim();
  liveConfigured = true;

  return {
    connected: true,
    storeUrl: baseUrl,
    message: 'WooCommerce store connected successfully.'
  };
}

export async function loadCustomers() {
  if (!liveConfigured) {
    return { mode: 'demo', data: demoCustomers };
  }

  const customers = await wooGetAll('customers');

  return {
    mode: 'live',
    data: customers.map(c => ({
      id: c.id,
      first_name: c.first_name,
      last_name: c.last_name,
      email: c.email,
      phone: c.billing?.phone || '',
      orders_count: c.orders_count ?? 0,
      total_spent: c.total_spent ?? '0',
      last_active: c.date_modified
        ? c.date_modified.slice(0, 10)
        : '—'
    }))
  };
}

export async function loadOrders() {
  if (!liveConfigured) {
    return { mode: 'demo', data: demoOrders };
  }

  const orders = await wooGetAll('orders');

  return {
    mode: 'live',
    data: orders.map(o => ({
      id: o.id,
      customer_id: o.customer_id,
      customer:
        `${o.billing?.first_name || ''} ${
          o.billing?.last_name || ''
        }`.trim() || `Customer #${o.customer_id}`,
      date: (o.date_created || '').slice(0, 10),
      status: o.status,
      total: o.total
    }))
  };
}
