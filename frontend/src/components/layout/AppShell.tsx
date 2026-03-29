import { PropsWithChildren } from 'react';

import { Footer } from './Footer';
import { Navbar } from './Navbar';

interface AppShellProps {
  showFooter?: boolean;
}

export const AppShell = ({ children, showFooter = true }: PropsWithChildren<AppShellProps>) => (
  <div className="min-h-screen bg-navy text-white">
    <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_22%)]" />
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      {showFooter ? <Footer /> : null}
    </div>
  </div>
);
