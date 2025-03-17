'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUserInfo } from '../../hooks/useUserName';
import { useSession } from "next-auth/react";
import { NavigationIcons } from '../../utils/navigationIcons';

const BottomBar = () => {
    const pathname = usePathname();
    const { data: session } = useSession();
    const { name: userName } = useUserInfo(session?.user?.id);
  
    if (pathname === '/' || pathname === '/signin') {
        return null;
    }

    const navItems = [
        { 
            icon: {
                outlined: NavigationIcons.HomeOutlined,
                filled: NavigationIcons.HomeFilled
            },
            label: 'Home',
            href: '/user/home'
        },
        {
            icon: {
                outlined: NavigationIcons.SearchOutlined,
                filled: NavigationIcons.SearchOutlined
            },
            label: 'Explore',
            href: '/user/queues'
        },
        {
            icon: {
                outlined: NavigationIcons.FeedbackOutlined,
                filled: NavigationIcons.FeedbackFilled
            },
            label: 'Feedback',
            href: '/feedback'
        },
        {
            icon: {
                outlined: NavigationIcons.HistoryOutlined,
                filled: NavigationIcons.HistoryFilled
            },
            label: 'History',
            href: '/user/queue-history'
        },
        {
            icon: {
                outlined: NavigationIcons.ProfileOutlined,
                filled: NavigationIcons.ProfileFilled
            },
            label: 'Profile',
            href: '/user/dashboard'
        }
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-10 sm:hidden">
            {/* Blurred background effect */}
            <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800"></div>
            
            {/* Navigation items */}
            <div className="relative flex items-center justify-around h-16 px-2">
                {navItems.map((item, index) => {
                    const isActive = pathname === item.href;
                    const Icon = isActive ? item.icon.filled : item.icon.outlined;
                    
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
                                    shadow-md transform transition-all duration-300 ease-in-out hover:scale-105
                                `}>
                                    <Icon className={`transform transition-all duration-300 ease-in-out ${
                                        isActive ? 'h-8 w-8' : 'h-6 w-6'
                                    }`} />
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
                                <Icon 
                                    className={`transform transition-all duration-300 ease-in-out ${
                                        isActive 
                                            ? 'h-8 w-8 text-orange-500 dark:text-orange-400' 
                                            : 'h-6 w-6 text-gray-600 dark:text-gray-400'
                                    }`}
                                />
                            </div>
                            <span className={`text-[10px] mt-0.5 font-medium transition-all duration-300 ease-in-out ${
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