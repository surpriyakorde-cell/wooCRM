export const demoCustomers = [
  { id: 101, first_name: 'Aarav', last_name: 'Shah', email: 'aarav.shah@example.com', phone: '+91 98765 10001', orders_count: 5, total_spent: '12490.00', last_active: 'Today' },
  { id: 102, first_name: 'Meera', last_name: 'Naik', email: 'meera.naik@example.com', phone: '+91 98765 10002', orders_count: 3, total_spent: '7860.00', last_active: 'Yesterday' },
  { id: 103, first_name: 'Kabir', last_name: 'Fernandes', email: 'kabir.f@example.com', phone: '+91 98765 10003', orders_count: 8, total_spent: '21850.00', last_active: '2 days ago' },
  { id: 104, first_name: 'Ananya', last_name: 'Rao', email: 'ananya.rao@example.com', phone: '+91 98765 10004', orders_count: 2, total_spent: '2499.00', last_active: '3 days ago' },
  { id: 105, first_name: 'Rehan', last_name: 'Khan', email: 'rehan.khan@example.com', phone: '+91 98765 10005', orders_count: 4, total_spent: '9650.00', last_active: '4 days ago' },
  { id: 106, first_name: 'Isha', last_name: 'Dessai', email: 'isha.dessai@example.com', phone: '+91 98765 10006', orders_count: 1, total_spent: '1299.00', last_active: '1 week ago' }
];
export const demoOrders = [
  { id: 5401, customer_id: 103, customer: 'Kabir Fernandes', date: '2026-10-15', status: 'processing', total: '3499.00' },
  { id: 5400, customer_id: 101, customer: 'Aarav Shah', date: '2026-10-14', status: 'completed', total: '2199.00' },
  { id: 5399, customer_id: 102, customer: 'Meera Naik', date: '2026-10-14', status: 'on-hold', total: '1299.00' },
  { id: 5398, customer_id: 105, customer: 'Rehan Khan', date: '2026-10-13', status: 'completed', total: '4850.00' },
  { id: 5397, customer_id: 104, customer: 'Ananya Rao', date: '2026-10-12', status: 'cancelled', total: '999.00' }
];
export const demoReviews = [
  { id: 'demo-r1', customer_id: 102, customer: 'Meera Naik', rating: 2, text: 'The delivery took longer than expected and tracking did not update for several days.', date: '2026-10-14', status: 'New', demo: true },
  { id: 'demo-r2', customer_id: 103, customer: 'Kabir Fernandes', rating: 5, text: 'Great quality and a smooth checkout. I will order again.', date: '2026-10-12', status: 'Reviewed', demo: true },
  { id: 'demo-r3', customer_id: 105, customer: 'Rehan Khan', rating: 3, text: 'Product is good, but the packaging arrived damaged.', date: '2026-10-10', status: 'New', demo: true },
  { id: 'demo-r4', customer_id: 101, customer: 'Aarav Shah', rating: 4, text: 'Helpful support team and a good overall experience.', date: '2026-10-08', status: 'Resolved', demo: true }
];
