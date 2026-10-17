import { Link } from 'react-router-dom';

export default function NotAuthorized() {
  return (
    <div className="page not-authorized">
      <h2>Not authorised</h2>
      <p>You are signed in, but your account is not on the staff list, so you cannot open the admin area. Ask an administrator to add you to Staff in Supabase.</p>
      <Link to="/admin/login" className="btn btn-outline">Sign in with another account</Link>
    </div>
  );
}
