import { useCallback, useEffect, useState } from 'react';
import { fetchReport, csvExport, downloadCsv } from '../services/admin';
import { formatMoney } from '../../lib/format';
import { useToast } from '../../lib/context/ToastContext';
import PageLoader from '../../lib/components/PageLoader';
import { AdminErrorState } from '../components/States';
import Icon from '../components/Icon';

export default function Report() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      setReport(await fetchReport({ dateFrom, dateTo }));
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => { load(); }, [load]);

  const handleExport = () => {
    if (!report) return;
    const content = csvExport(report.days, [{ key: 'day', label: 'Day' }, { key: 'revenue', label: 'Revenue' }]);
    downloadCsv(content, 'report-sales-by-day.csv');
    showToast('Report exported');
  };

  if (loading) return <PageLoader />;
  if (loadError) return (
    <div className="page page-shell">
      <div className="page-header"><h1>Daily report</h1></div>
      <AdminErrorState message="Could not load report." onRetry={load} />
    </div>
  );

  const total = report ? report.days.reduce((s, d) => s + d.revenue, 0) : 0;

  return (
    <div className="page page-shell">
      <div className="page-header">
        <div>
          <h1>Daily report</h1>
          <p className="page-sub">Sales by day and by dish for a date range</p>
        </div>
        <div className="page-header-actions">
          <div className="report-filters">
            <label>From <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={{ padding: 4 }} /></label>
            <label>To <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={{ padding: 4 }} /></label>
            <button className="btn btn-primary" onClick={load} disabled={loading}>Run report</button>
            <button className="btn btn-outline" onClick={handleExport} disabled={!report}><Icon name="download" size="16" style={{ marginRight: 6 }} /> CSV</button>
          </div>
        </div>
      </div>

      {report && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div className="stat-card">
              <div className="stat-label">Total revenue</div>
              <div className="stat-value">{formatMoney(total)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Days</div>
              <div className="stat-value">{report.days.length}</div>
            </div>
          </div>
          <div className="chart-wrap">
            <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Sales by day</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
              {report.days.map((d) => (
                <div key={d.day} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', borderBottom: '1px solid var(--color-border)' }}>
                  <span>{d.day}</span>
                  <span style={{ fontWeight: 700 }}>{formatMoney(d.revenue)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="chart-wrap">
            <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Sales by dish</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
              {report.dishes.map((d) => (
                <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', borderBottom: '1px solid var(--color-border)' }}>
                  <span>{d.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{d.qty} x</span>
                    <span style={{ fontWeight: 700 }}>{formatMoney(d.revenue)}</span>
                  </div>
                </div>
              ))}
              {report.dishes.length === 0 && <div style={{ padding: 10, color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No paid orders in range.</div>}
            </div>
          </div>
        </>
      )}
      {!report && <p className="empty-state">Select a date range and run the report.</p>}
    </div>
  );
}
