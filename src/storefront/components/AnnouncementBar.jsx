import { ANNOUNCEMENT } from '../config';

export default function AnnouncementBar() {
  const text = (ANNOUNCEMENT || '').trim();
  if (!text) return null;

  return (
    <div className="sf-announcement" role="status">
      <span className="sf-announcement-text">{text}</span>
    </div>
  );
}
