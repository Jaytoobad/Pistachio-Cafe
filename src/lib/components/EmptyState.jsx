export function EmptyState({ title = 'Nothing here yet', description = 'Check back soon.', action = null }) {
  return (
    <div className="sf-empty">
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
