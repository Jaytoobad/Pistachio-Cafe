import React from 'react';

export default function SectionHeading({ title, subtitle, action }) {
  return (
    <div className="sf-section-head">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}