import { Search, X } from 'lucide-react';

export default function SearchBox({ query, setQuery, placeholder }) {
  return <label className="search-box"><Search size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder={placeholder}/>{query && <button type="button" aria-label="Clear search" onClick={() => setQuery('')}><X size={14}/></button>}</label>;
}
