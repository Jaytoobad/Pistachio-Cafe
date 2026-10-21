import { useCallback, useEffect, useState } from 'react';
import { fetchCustomers, csvExport, downloadCsv } from '../services/admin';
import { formatMoney, formatAccra } from '../../lib/format';
import { useToast } from '../../lib/context/ToastContext';
import PageLoader from '../../lib/components/PageLoader';
import { AdminErrorState } from '../components/States';
import Icon from '../components/Icon';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true); setLoadError(false);
    try { setCustomers(await fetchCustomers()); }
    catch { setLoadError(true); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const term = search.toLowerCase();
  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(term) ||
    (c.phone || '').toLowerCase().includes(term) ||
    (c.email || '').toLowerCase().includes(term)
  );

  const handleExport = () => {
    const rows = filtered.map((c) => ({
      name: c.name, phone: c.phone || '', email: c.email || '',
      orders: c.orders.length, total_spent: c.totalSpent, last_order: c.lastOrder ? c.lastOrder.created_at : '',
    }));
    const content = csvExport(rows, [
      { key: 'name', label: 'Name' },
      { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' },
      { key: 'orders', label: 'Orders' },
      { key: 'total_spent', label: 'Total spent (GH₵)' },
      { key: 'last_order', label: 'Last order' },
    ]);
    downloadCsv(content, 'customers.csv');
    showToast('Customers exported');
  };

  if (loading) return <PageLoader />;
  if (loadError) return (
    <div className="page page-shell"><div className="page-header"><h1>Customers</h1></div>
      <AdminErrorState message="Could not load customers." onRetry={load} /></div>
  );

  return (
    <div className="page page-shell">
      <div className="page-header">
        <div>
          <h1>Customers</h1>
          <p className="page-sub">Built from orders &mdash; repeat customers, spend and last order</p>
        </div>
        <div className="page-header-actions">
          <input type="text" placeholder="Search customers" value={search} onChange={(e) => setSearch(e.target.value)} className="field-input" style={{ width: 220 }} />
          <button className="btn btn-outline btn-sm" onClick={handleExport}><Icon name="download" size="16" style={{ marginRight: 6 }} /> CSV export</button>
        </div>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>Orders</th><th>Total spent</th><th>Last order</th></tr></thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.name + c.phone + c.email}>
                <td className="cell-primary">{c.name}</td>
                <td className="cell-muted">{c.phone || '\u2014'}</td>
                <td className="cell-muted">{c.email || '\u2014'}</td>
                <td>{c.orders.length}</td>
                <td>{formatMoney(c.totalSpent)}</td>
                <td className="cell-muted">{c.lastOrder ? formatAccra(c.lastOrder.created_at) : '\u2014'}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="empty-state" style={{ padding: 30, textAlign: 'center' }}>No customers yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {customers.length === 0 && <p className="empty-state">No customers yet.</p>}
    </div>
  );
}
