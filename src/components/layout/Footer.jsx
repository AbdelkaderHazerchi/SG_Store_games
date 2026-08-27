import { Link } from 'react-router-dom';
import { Gamepad2, Github } from 'lucide-react';
import { APP_NAME, ROUTES } from '../../utils/constants';

const footerLinks = [
  { label: 'Home', to: ROUTES.HOME },
  { label: 'Browse Games', to: ROUTES.HOME },
  { label: 'Publish a Game', to: ROUTES.PUBLISH },
  { label: 'Sign In', to: ROUTES.LOGIN },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <Link to={ROUTES.HOME} className="flex items-center gap-2 text-lg font-bold text-white">
            <Gamepad2 className="h-6 w-6 text-primary" />
            {APP_NAME}
          </Link>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="text-sm text-slate-400 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 transition-colors hover:text-white"
            aria-label="GitHub"
          >
            <Github className="h-5 w-5" />
          </a>
        </div>

        <div className="mt-8 border-t border-slate-800/60 pt-6">
          <p className="text-center text-sm text-slate-500">
            © {new Date().getFullYear()} {APP_NAME} · Games are hosted externally by their
            developers. AI-assisted games are clearly badged.
          </p>
        </div>
      </div>
    </footer>
  );
}
