import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Bell, Boxes, Check, LayoutDashboard, MessageSquareText, MoreHorizontal, Plus, Settings, ShoppingBag, Sparkles, Users, X, Menu } from 'lucide-react';
import { api } from './services/api.js';
import { money, fullName } from './utils/format.js';
import DashboardPage from './pages/DashboardPage.jsx';
import CustomersPage from './pages/CustomersPage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import ReviewsPage from './pages/ReviewsPage.jsx';
import FollowUpsPage from './pages/FollowUpsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

export default function App() {
  const [page, setPage] = useState('Dashboard');
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [mode, setMode] = useState('demo');
  const [query, setQuery] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');
  const [customerStatus, setCustomerStatus] = useState('all');
  const [reviewRating, setReviewRating] = useState('all');
  const [reviewStatus, setReviewStatus] = useState('all');
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [selected, setSelected] = useState(null);
const [notes, setNotes] = useState(() => JSON.parse(localStorage.getItem('woocrm-notes') || '{}'));
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem('woocrm-tasks') || JSON.stringify([
    { id: 1, customer: 'Meera Naik', title: 'Follow up on recent order', due: 'Today', status: 'Pending' },
    { id: 2, customer: 'Kabir Fernandes', title: 'Thank customer for repeat purchase', due: 'Tomorrow', status: 'Pending' },
    { id: 3, customer: 'Aarav Shah', title: 'Request product feedback', due: 'Oct 18', status: 'Completed' }
  ])));
  const [showTask, setShowTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCustomer, setTaskCustomer] = useState('');
  const [toast, setToast] = useState('');
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    Promise.all([api.customers(), api.orders(), api.reviews()]).then(([c, o, rv]) => {
      setCustomers(c.data || []);
      setOrders(o.data || []);
      setReviews(rv.data || []);
      setMode(c.mode === 'live' && o.mode === 'live' ? 'live' : 'demo');
    }).catch(() => setToast('API unavailable. Please start the backend server.'));
  }, []);

  useEffect(() => { localStorage.setItem('woocrm-notes', JSON.stringify(notes)); }, [notes]);
  useEffect(() => { localStorage.setItem('woocrm-tasks', JSON.stringify(tasks)); }, [tasks]);

  const revenue = orders.filter(o => o.status !== 'cancelled' && o.status !== 'refunded').reduce((sum, o) => sum + Number(o.total || 0), 0);
  const filteredCustomers = useMemo(() => customers.filter(c => `${fullName(c)} ${c.email}`.toLowerCase().includes(query.toLowerCase()) && (customerStatus === 'all' || c.status === customerStatus)), [customers, query, customerStatus]);
  const filteredReviews = useMemo(() => reviews.filter(r => (reviewRating === 'all' || String(r.rating) === reviewRating) && (reviewStatus === 'all' || r.status === reviewStatus)), [reviews, reviewRating, reviewStatus]);
  const filteredOrders = useMemo(() => orders.filter(o => {
    const matches = `${o.id} ${o.customer}`.toLowerCase().includes(query.toLowerCase());
    return matches && (orderFilter === 'all' || o.status === orderFilter);
  }), [orders, query, orderFilter]);

  const nav = [
    { label: 'Dashboard', icon: LayoutDashboard },
    { label: 'Customers', icon: Users },
    { label: 'Reviews', icon: MessageSquareText },
    { label: 'Orders', icon: ShoppingBag },
    { label: 'Follow-ups', icon: MessageSquareText }
  ];

  function notify(message) {
    setToast(message);
    setTimeout(() => setToast(''), 2600);
  }
  function addTask(e) {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    setTasks(prev => [{ id: Date.now(), customer: taskCustomer || 'Unassigned', title: taskTitle.trim(), due: 'Today', status: 'Pending' }, ...prev]);
    setTaskTitle(''); setTaskCustomer(''); setShowTask(false); notify('Follow-up task created');
  }
  function exportCustomers() {
    const csv = ['ID,Name,Email,Phone,Orders,Total Spent', ...customers.map(c => [c.id, fullName(c), c.email, c.phone, c.orders_count, c.total_spent].map(v => `"${String(v ?? '').replaceAll('"', '""')}"`).join(','))].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = 'woocrm-customers.csv'; a.click(); URL.revokeObjectURL(url);
    notify('Customer CSV exported');
  }
  async function updateCustomer(id, changes) {
    try { const data = await api.updateCustomer(id, changes); setCustomers(prev => prev.map(c => String(c.id) === String(id) ? {...c, ...data} : c)); if (selected?.id === id) setSelected(prev => ({...prev, ...data})); notify('Customer details saved'); }
    catch (e) { notify(e.message || 'Could not save customer details'); }
  }
  async function updateReview(id, status) {
    try { const data = await api.updateReview(id, status); setReviews(prev=>prev.map(r=>r.id===id?data:r)); notify('Review status saved'); }
    catch(e) { notify(e.message || 'Could not save review status'); }
  }
  async function generateInsights() {
    setInsightsLoading(true); setInsights(null);
    try { const data = await api.summarizeReviews(reviews); setInsights(data); }
    catch(e) { notify(e.message || 'AI insights are unavailable'); }
    finally { setInsightsLoading(false); }
  }

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-mark"><Boxes size={21}/></div><span>woo<span className="brand-accent">crm</span><small>Customer workspace</small></span><button className="icon-btn mobile-close" onClick={() => setMobileNav(false)}><X size={18}/></button></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav>{nav.map(item => <button key={item.label} className={`nav-item ${page === item.label ? 'active' : ''}`} onClick={() => { setPage(item.label); setMobileNav(false); setQuery(''); }}><item.icon size={18}/><span>{item.label}</span>{item.label === 'Follow-ups' && <span className="nav-count">{tasks.filter(t => t.status === 'Pending').length}</span>}</button>)}</nav>
      <div className="sidebar-bottom">
        <div className="help-card"><div className="help-icon"><Sparkles size={17}/></div><strong>Make every customer count.</strong><p>Keep your customer relationships moving forward.</p><button onClick={() => notify('Customer insights: focus on repeat buyers and pending follow-ups.')}>Explore insights <ArrowUpRight size={14}/></button></div>
        <button className={`nav-item ${page === 'Settings' ? 'active' : ''}`} onClick={() => setPage('Settings')}><Settings size={18}/><span>Settings</span></button>
        <div className="profile"><div className="avatar avatar-purple">SK</div><div className="profile-text"><strong>Store Admin</strong><span>Administrator</span></div><MoreHorizontal size={19}/></div>
      </div>
    </aside>
    {mobileNav && <div className="mobile-overlay" onClick={() => setMobileNav(false)} />}
    <main className="main-area">
      <header className="topbar"><button className="icon-btn mobile-menu" onClick={() => setMobileNav(true)}><Menu size={20}/></button><div className="breadcrumbs">Workspace <span>/</span> <strong>{page}</strong></div><div className="topbar-actions"><div className={`connection-pill ${mode}`}><span className="status-dot"/>{mode === 'live' ? 'WooCommerce connected' : 'Demo data'}</div><button className="icon-btn notification-btn" onClick={() => notify(`${tasks.filter(t => t.status === 'Pending').length} pending follow-ups`)}><Bell size={18}/><i/></button><div className="avatar avatar-purple top-avatar">SK</div></div></header>
      <div className="page-content">
        {page === 'Dashboard' && <DashboardPage customers={customers} orders={orders} reviews={reviews} revenue={revenue} tasks={tasks} setPage={setPage} setSelected={setSelected} setShowTask={setShowTask} money={money} fullName={fullName}/>} 
        {page === 'Customers' && <CustomersPage customers={filteredCustomers} query={query} setQuery={setQuery} customerStatus={customerStatus} setCustomerStatus={setCustomerStatus} exportCustomers={exportCustomers} money={money} fullName={fullName} setSelected={setSelected} updateCustomer={updateCustomer}/>} 
        {page === 'Reviews' && <ReviewsPage reviews={reviews} filteredReviews={filteredReviews} reviewRating={reviewRating} setReviewRating={setReviewRating} reviewStatus={reviewStatus} setReviewStatus={setReviewStatus} updateReview={updateReview} generateInsights={generateInsights} insightsLoading={insightsLoading} insights={insights}/>} 
        {page === 'Orders' && <OrdersPage orders={filteredOrders} query={query} setQuery={setQuery} orderFilter={orderFilter} setOrderFilter={setOrderFilter} money={money}/>} 
        {page === 'Follow-ups' && <FollowUpsPage tasks={tasks} setTasks={setTasks} setShowTask={setShowTask}/>} 
        {page === 'Settings' && <SettingsPage mode={mode} notify={notify}/>} 
      </div>
      <footer className="footer"><span>© 2026 WooCRM</span><span><span className="status-dot"/>{mode === 'live' ? 'Connected to WooCommerce' : 'Running in demo mode'}</span><span>Built for customer-first commerce</span></footer>
    </main>
    {selected && <div className="drawer-backdrop" onClick={() => setSelected(null)}><aside className="customer-drawer" onClick={e => e.stopPropagation()}><div className="drawer-header"><span>Customer profile</span><button className="icon-btn" onClick={() => setSelected(null)}><X size={18}/></button></div><div className="drawer-profile"><div className="avatar avatar-large">{fullName(selected).split(' ').map(n => n[0]).join('').slice(0,2)}</div><h2>{fullName(selected)}</h2><p>{selected.email}</p><span className="customer-id">Customer #{selected.id}</span></div><div className="drawer-stats"><div><span>Total orders</span><strong>{selected.orders_count}</strong></div><div><span>Total spent</span><strong>{money(selected.total_spent)}</strong></div></div><div className="drawer-section"><h3>Contact information</h3><p><span>Email</span>{selected.email}</p><p><span>Phone</span>{selected.phone || 'Not provided'}</p><p><span>Last activity</span>{selected.last_active || '—'}</p></div><div className="drawer-section"><h3>Internal notes</h3><textarea value={notes[selected.id] || ''} onChange={e => setNotes(prev => ({...prev, [selected.id]: e.target.value}))} placeholder="Add a note about this customer..." rows="4"/><small>Saved in this browser.</small></div><button className="primary-btn full-btn" onClick={() => { setTaskCustomer(fullName(selected)); setShowTask(true); setSelected(null); }}> <Plus size={16}/> Create follow-up</button></aside></div>}
    {showTask && <div className="modal-backdrop" onClick={() => setShowTask(false)}><form className="task-modal" onSubmit={addTask} onClick={e => e.stopPropagation()}><div className="modal-heading"><div><span className="eyebrow">CUSTOMER SUCCESS</span><h2>New follow-up</h2></div><button type="button" className="icon-btn" onClick={() => setShowTask(false)}><X size={18}/></button></div><label>Task title<input required autoFocus value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="e.g. Check in after delivery"/></label><label>Customer<select value={taskCustomer} onChange={e => setTaskCustomer(e.target.value)}><option value="">Select a customer (optional)</option>{customers.map(c => <option key={c.id} value={fullName(c)}>{fullName(c)}</option>)}</select></label><div className="modal-actions"><button type="button" className="secondary-btn" onClick={() => setShowTask(false)}>Cancel</button><button className="primary-btn" type="submit"><Plus size={16}/> Create task</button></div></form></div>}
    {toast && <div className="toast"><Check size={16}/>{toast}<button onClick={() => setToast('')}><X size={14}/></button></div>}
  </div>;
}

