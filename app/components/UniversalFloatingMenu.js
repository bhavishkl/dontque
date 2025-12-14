'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, List, Clock, History, Bookmark, User, Menu, X } from 'lucide-react';
import { Button } from '@nextui-org/react';

export default function UniversalFloatingMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { name: 'Home', href: '/new/home', icon: Home },
    { name: 'Explore', href: '/new/queues', icon: List },
    { name: 'Current Queues', href: '/new/current-queues', icon: Clock },
    { name: 'History', href: '/new/queue-history', icon: History },
    { name: 'Saved', href: '/new/saved-queues', icon: Bookmark },
    { name: 'Dashboard', href: '/new/dashboard', icon: User },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Menu Items */}
      <div
        className={`flex flex-col gap-2 mb-4 transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95 pointer-events-none'
        }`}
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center gap-3 px-4 py-2 rounded-full shadow-lg backdrop-blur-md border transition-all duration-200 ${
                  isActive
                    ? 'bg-orange-500 text-white border-orange-400'
                    : 'bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium whitespace-nowrap">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Toggle Button */}
      <Button
        isIconOnly
        className="w-14 h-14 rounded-full shadow-xl bg-orange-600 hover:bg-orange-700 text-white"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </Button>
    </div>
  );
}
