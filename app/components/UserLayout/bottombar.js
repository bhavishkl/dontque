'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusSquare, Bell, User } from 'lucide-react';
import { useUserInfo } from '../../hooks/useUserName';
import { useSession } from "next-auth/react";

const BottomBar = () => {
    const pathname = usePathname();
    const { data: session } = useSession();
    const { name: userName } = useUserInfo(session?.user?.id);
  
    const navItems = [
        { icon: Home, label: 'Home', href: '/user/home' },
        { icon: Search, label: 'Explore', href: '/user/queues' },
        { icon: PlusSquare, label: 'Add', href: '/user/add-queue' },
        { icon: Bell, label: 'Notifications', href: '/user/notifications' },
        { icon: User, label: userName || 'Profile', href: '/user/dashboard' },
      ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 sm:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center w-full h-full ${
              pathname === item.href ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <item.icon className="h-6 w-6" />
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomBar;