export function AdminSkeletonTable({ rows = 6 }) {
  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {[...Array(6)].map((_, i) => (
              <th key={i}><div className="sk-text" style={{ width: `${50 + i * 10}%` }} /></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(rows)].map((_, r) => (
            <tr key={r}>
              {[...Array(6)].map((_, i) => (
                <td key={i}><div className="sk-text" style={{ width: `${40 + i * 12}%`, marginTop: i === 0 ? '-6px' : 0 }} /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdminSkeletonCards({ count = 6 }) {
  return (
    <div className="card-grid">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="sk-card">
          <div className="sk-img" style={{ height: 140 }} />
          <div className="sk-body" style={{ padding: 12 }}>
            <div className="sk-text" style={{ width: '75%', height: 18, marginBottom: 8 }} />
            <div className="sk-text" style={{ width: '90%', height: 14, marginBottom: 6 }} />
            <div className="sk-text" style={{ width: '60%', height: 14 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminSkeletonText({ width = '100%', height = 16 }) {
  return <div className="sk-text" style={{ width, height }} />;
}
