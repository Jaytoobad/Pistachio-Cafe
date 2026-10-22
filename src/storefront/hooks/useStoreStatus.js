import { useState, useEffect } from 'react';
import { accraNow, hoursForDay } from '../config';

// Live open/closed status from HOURS, in Africa/Accra time.
//
// currentStoreStatus() gives the raw facts (are we open, when do we open and
// close today). useStoreStatus() keeps the old one-line string for the
// components that only need the sentence.
export function currentStoreStatus() {
  const accra = accraNow();
  const hours = hoursForDay(accra.getDay());

  const [openHour, openMinute] = hours.open.split(':').map(Number);
  const [closeHour, closeMinute] = hours.close.split(':').map(Number);
  const now = accra.getHours() * 60 + accra.getMinutes();

  const opens = openHour * 60 + openMinute;
  let closes = closeHour * 60 + closeMinute;
  if (closes <= opens) closes = 24 * 60;

  const isOpen = now >= opens && now < closes;
  const closeLabel = closeHour === 0 && closeMinute === 0 ? 'midnight' : hours.close;

  return {
    isOpen,
    hours,
    label: isOpen ? `Open now \u00b7 closes ${closeLabel}` : `Closed \u00b7 opens ${hours.open}`,
  };
}

export function useStoreStatus() {
  const [status, setStatus] = useState(() => currentStoreStatus().label);

  useEffect(() => {
    const compute = () => setStatus(currentStoreStatus().label);

    compute();

    const timer = setInterval(compute, 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  return status;
}
