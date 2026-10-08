import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { EmptyState } from '../components/ui.jsx';

export default function NotFound() {
  return (
    <div className="container page">
      <EmptyState
        icon={Compass}
        title="Page not found"
        text="The page you are looking for may have moved or never existed."
        action={<Link to="/" className="btn btn--primary">Back to home</Link>}
      />
    </div>
  );
}
