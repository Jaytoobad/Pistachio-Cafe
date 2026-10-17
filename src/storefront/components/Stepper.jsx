import React from 'react';
import { TRACK_STATUSES, TRACK_STATUS_LABELS, TRACK_STATUS_LABELS_EXTRA } from '../config';

// Build the display order of statuses for a given current status.
// Standard flow: received → preparing → ready → completed.
// 'out for delivery' sits between ready and completed when present.
function statusOrder(currentStatus) {
  const base = [...TRACK_STATUSES];
  if (currentStatus === 'out for delivery') {
    return ['received', 'preparing', 'ready', 'out for delivery', 'completed'];
  }
  return base;
}

export default function Stepper({ currentStatus }) {
  const steps = statusOrder(currentStatus);
  const currentIndex = steps.indexOf(currentStatus);

  return (
    <ol className="sf-stepper">
      {steps.map((status, index) => {
        const isPast = index < currentIndex;
        const isCurrent = index === currentIndex;
        const label = TRACK_STATUS_LABELS[status] || TRACK_STATUS_LABELS_EXTRA[status] || status;

        let cls = 'sf-step pending';
        if (isPast) cls = 'sf-step done';
        if (isCurrent) cls = 'sf-step current';

        return (
          <li key={status} className={cls}>
            <span className="sf-step-dot">{isPast ? '✓' : index + 1}</span>
            <span>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}