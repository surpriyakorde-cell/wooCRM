import PageHeading from '../components/PageHeading.jsx';
import SearchBox from '../components/SearchBox.jsx';
import OrderTable from '../components/OrderTable.jsx';

export default function OrdersPage({ orders, query, setQuery, orderFilter, setOrderFilter, money }) {
  return <section><PageHeading eyebrow="SALES ACTIVITY" title="Orders" subtitle="Track purchases and stay on top of every order."/><div className="table-card"><div className="table-toolbar"><div><strong>All orders</strong><span className="table-subtitle">{orders.length} orders</span></div><div className="toolbar-controls"><SearchBox query={query} setQuery={setQuery} placeholder="Search orders..."/><label className="sr-only" htmlFor="order-status-filter">Filter orders by status</label><select id="order-status-filter" className="filter-select" value={orderFilter} onChange={e=>setOrderFilter(e.target.value)}><option value="all">All statuses</option><option value="processing">Processing</option><option value="completed">Completed</option><option value="on-hold">On hold</option><option value="cancelled">Cancelled</option></select></div></div><OrderTable orders={orders} money={money}/></div></section>;
}
