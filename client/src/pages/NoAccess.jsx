import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
export default function NoAccess() {
  return (
    <main className="container page-pad no-access">
      <ShieldAlert size={48} />
      <h1>
        This space is <em>restricted.</em>
      </h1>
      <p>Your account doesn't have permission to view this page.</p>
      <Link className="btn btn-primary" to="/">
        <ArrowLeft size={16} /> Back to explore
      </Link>
    </main>
  );
}
