// simple modal component
import React from 'react';

export default function DishDetailModal({ open, dish, onClose, onAdd }) {
  const [qty, setQty] = React.useState(1);
  const [notes, setNotes] = React.useState('');
  const [extras, setExtras] = React.useState([]);
  if (!open || !dish) return null;
  const toggleExtra = (e) => {
    if (extras.includes(e)) setExtras(extras.filter(x=>x!==e));
    else setExtras([...extras, e]);
  };
  return (
    <div className="sf-modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="sf-modal-content" onClick={e=>e.stopPropagation()}>
        <button className="sf-modal-close" onClick={onClose} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="m6 6 12 12" />
            <path d="M18 6 6 18" />
          </svg>
        </button>
        <h3>{dish.name}</h3>
        <p>{dish.description}</p>
        <div className="sf-field">
          <label>Special instructions</label>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3} />
        </div>
        <div style={{ marginTop: 12 }}>
          <button className="sf-btn sf-btn-primary" onClick={()=>{ onAdd(dish, qty, extras, notes); onClose(); }}>Add to cart</button>
        </div>
      </div>
    </div>
  );
}
