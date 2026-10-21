export function AdminEmptyState({ title = 'Nothing here yet', description = 'Check back soon.', action = null }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function AdminErrorState({ message = 'Could not load data.', onRetry, label = 'Try again' }) {
  return (
    <div className="empty-state error-state">
      <h3>{message}</h3>
      {onRetry && <button className="btn btn-outline" onClick={onRetry}>{label}</button>}
    </div>
  );
}
