'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusCircle, History, User } from 'lucide-react';
import { useUserInfo } from '../../hooks/useUserName';
import { useSession } from "next-auth/react";

const BottomBar = () => {
    const pathname = usePathname();
    const { data: session } = useSession();
    const { name: userName } = useUserInfo(session?.user?.id);
  
    if (pathname === '/' || pathname === '/signin') {
        return null;
    }

    const navItems = [
        { icon: Home, label: 'Home', href: '/user/home' },
        { icon: Search, label: 'Explore', href: '/user/queues' },
        { icon: PlusCircle, label: 'Feedback', href: '/feedback' },
        { icon: History, label: 'History', href: '/user/queue-history' },
        { icon: User, label: 'Profile', href: '/user/dashboard' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-10 sm:hidden">
            {/* Blurred background effect */}
            <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800"></div>
            
            {/* Navigation items */}
            <div className="relative flex items-center justify-around h-16 px-2">
                {navItems.map((item, index) => {
                    const isActive = pathname === item.href;
                    
                    // Special styling for the center "Feedback" button
                    if (index === 2) {
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex flex-col items-center justify-center"
                            >
                                <div className={`
                                    flex items-center justify-center rounded-full p-3
                                    ${isActive 
                                        ? 'bg-orange-500 text-white' 
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}
                                    shadow-md transform transition-transform duration-200 hover:scale-105
                                `}>
                                    <item.icon className="h-6 w-6" />
                                </div>
                            </Link>
                        );
                    }
                    
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center justify-center w-1/5"
                        >
                            <div className="relative">
                                <item.icon 
                                    className={`h-6 w-6 transition-colors duration-200 ${
                                        isActive 
                                            ? 'text-orange-500 dark:text-orange-400' 
                                            : 'text-gray-600 dark:text-gray-400'
                                    }`} 
                                    strokeWidth={isActive ? 2.5 : 1.5}
                                />
                            </div>
                            <span className={`text-xs mt-1 font-medium transition-colors duration-200 ${
                                isActive 
                                    ? 'text-orange-500 dark:text-orange-400' 
                                    : 'text-gray-600 dark:text-gray-400'
                            }`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomBar;