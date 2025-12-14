'use client';

import UniversalFloatingMenu from '../components/UniversalFloatingMenu';

export default function NewLayout({ children }) {
  return (
    <>
      <main className="min-h-screen pb-24">
        {children}
      </main>
      <UniversalFloatingMenu />
    </>
  );
}
