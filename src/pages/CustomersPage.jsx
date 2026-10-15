import { Download } from 'lucide-react';
import PageHeading from '../components/PageHeading.jsx';
import SearchBox from '../components/SearchBox.jsx';
import CustomerTable from '../components/CustomerTable.jsx';

export default function CustomersPage({ customers, query, setQuery, customerStatus, setCustomerStatus, exportCustomers, money, fullName, setSelected, updateCustomer }) {
  return <section><PageHeading eyebrow="RELATIONSHIPS" title="Customers" subtitle="Profiles and statuses are saved in the CRM workspace." action={<button className="primary-btn" onClick={exportCustomers}><Download size={16}/> Export CSV</button>}/><div className="table-card"><div className="table-toolbar"><div><strong>All customers</strong><span className="table-subtitle">{customers.length} customers</span></div><div className="toolbar-controls"><SearchBox query={query} setQuery={setQuery} placeholder="Search customers..."/><label className="sr-only" htmlFor="customer-status-filter">Filter customers by status</label><select id="customer-status-filter" className="filter-select" value={customerStatus} onChange={e=>setCustomerStatus(e.target.value)}><option value="all">All statuses</option>{['Lead','Active','At Risk','Inactive'].map(s=><option key={s}>{s}</option>)}</select></div></div><CustomerTable customers={customers} money={money} fullName={fullName} onSelect={setSelected} onStatusChange={updateCustomer}/></div></section>;
}
