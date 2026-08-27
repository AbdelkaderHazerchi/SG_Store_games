import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/constants';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-32 text-center">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <p className="mt-4 text-xl text-white">Page not found</p>
      <p className="mt-2 text-slate-400">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to={ROUTES.HOME}
        className="mt-8 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
      >
        Back to Home
      </Link>
    </div>
  );
}
