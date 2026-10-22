import React from 'react';
import { TRACK_STATUSES, TRACK_STATUS_LABELS } from '../config';

// Build the display order of statuses for a given current status.
// Standard flow: received -> confirmed -> preparing -> ready -> out_for_delivery
// -> delivered -> completed. Cancelled orders are rendered by StatusPill.
function statusOrder(currentStatus) {
  if (currentStatus === 'cancelled') return [];
  return [...TRACK_STATUSES];
}

export default function Stepper({ currentStatus }) {
  const steps = statusOrder(currentStatus);
  const currentIndex = steps.indexOf(currentStatus);

  return (
    <ol className="sf-stepper">
      {steps.map((status, index) => {
        const isPast = index < currentIndex;
        const isCurrent = index === currentIndex;
        const label = TRACK_STATUS_LABELS[status] || status;

        let cls = 'sf-step pending';
        if (isPast) cls = 'sf-step done';
        if (isCurrent) cls = 'sf-step current';

        return (
          <li key={status} className={cls}>
            <span className="sf-step-dot">{isPast ? '\u2713' : index + 1}</span>
            <span>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}