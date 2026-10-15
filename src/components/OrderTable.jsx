import { ShoppingBag } from 'lucide-react';

export default function OrderTable({ orders, money, compact = false }) {
  return <div className="table-scroll"><table><thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Amount</th>{!compact && <th>Date</th>}</tr></thead><tbody>{orders.map(o => <tr key={o.id}><td><strong className="order-id">#{o.id}</strong></td><td>{o.customer}</td><td><span className={`status-badge ${String(o.status).toLowerCase().replaceAll('_','-')}`}>{String(o.status).replaceAll('-',' ')}</span></td><td className="amount">{money(o.total)}</td>{!compact && <td>{o.date || '—'}</td>}</tr>)}</tbody></table>{orders.length === 0 && <div className="empty-state"><ShoppingBag size={25}/><strong>No orders found</strong><span>Try another search or filter.</span></div>}</div>;
}
