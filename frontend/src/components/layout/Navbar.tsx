import { Bot, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import { useQuizStore } from '../../store/quizStore';
import { Button } from '../ui/Button';

export const Navbar = () => {
  const user = useQuizStore((state) => state.user);
  const isAuthenticated = useQuizStore((state) => state.isAuthenticated);
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-navy/80 backdrop-blur-xl">
      <div className="app-container flex h-20 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber text-navy shadow-lg shadow-amber/20">
            <WalletCards className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-lg font-bold text-white">Money Health Score</p>
            <p className="text-xs tracking-[0.22em] text-muted uppercase">AI Financial Checkup</p>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <>
              <div className="hidden text-right md:block">
                <p className="text-sm font-semibold text-white">{user?.name}</p>
                <p className="text-xs text-muted">Your financial health overview</p>
              </div>
              <Link to="/dashboard">
                <Button variant="ghost" className="px-4 py-2.5">
                  Dashboard
                </Button>
              </Link>
              <Link to="/assistant">
                <Button variant="ghost" className="px-4 py-2.5">
                  <Bot className="h-4 w-4" />
                  AI Copilot
                </Button>
              </Link>
              <Link to="/quiz">
                <Button variant="outline" className="px-4 py-2.5">
                  Take Quiz
                </Button>
              </Link>
              <Button variant="primary" className="px-4 py-2.5" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button variant="primary" className="px-4 py-2.5">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
