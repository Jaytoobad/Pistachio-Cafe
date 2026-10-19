import { useState, useEffect } from 'react';
import { HOURS } from '../config';

// Live open/closed status from HOURS, in Africa/Accra time.
export function useStoreStatus() {
  const [status, setStatus] = useState('Closed \u00b7 opens 08:00');

  useEffect(() => {
    const compute = () => {
      const accra = new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Accra' }));

      const isWeekend = accra.getDay() === 0 || accra.getDay() === 6;
      const h = isWeekend ? HOURS.weekend : HOURS.weekday;

      const [oh, om] = h.open.split(':').map(Number);
      const [ch, cm] = h.close.split(':').map(Number);
      const now = accra.getHours() * 60 + accra.getMinutes();
      const open = oh * 60 + om;
      let close = ch * 60 + cm;
      if (close <= open) close = 24 * 60;

      const openNow = now >= open && now < close;
      const closeLabel = ch === 0 && cm === 0 ? 'midnight' : h.close;

      setStatus(openNow ? `Open now \u00b7 closes ${closeLabel}` : `Closed \u00b7 opens ${h.open}`);
    };

    compute();

    const timer = setInterval(compute, 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  return status;
}
