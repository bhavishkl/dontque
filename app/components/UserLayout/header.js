'use client'

import Link from 'next/link'
import { useSession, signOut } from "next-auth/react"
import { Bell, X, Home, Settings, LogOut, User, Users, PieChart, HelpCircle } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useUserInfo } from '../../hooks/useUserName'
import { supabase } from '../../lib/supabase'
import { usePathname } from 'next/navigation'
import { Avatar } from "@nextui-org/react"
import { ThemeToggle } from '../ThemeToggle'

const DynamicHeader = dynamic(() => import('./DynamicHeader'), { ssr: false })

const Header = () => {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const sidebarRef = useRef(null)
  const { name: userName, role, image: userImage } = useUserInfo(session?.user?.id)
  
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [])

  const handleLogout = async () => {
    localStorage.removeItem(`userName_${session?.user?.id}`)
    await signOut({ redirect: true, callbackUrl: '/' })
  }

  if (pathname === '/') return null // Don't render on the landing page

  return (
    <>
      <DynamicHeader session={session} />
      <header className="sticky top-0 bg-white dark:bg-gray-800 shadow-sm z-20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/user/home">
            <h1 className="text-2xl font-bold text-black dark:text-white">QueueSmart</h1>
          </Link>
          <nav className="flex items-center space-x-4">
            {session?.user && (
              <>
                <div className="hidden sm:block">
                  <ThemeToggle />
                </div>
                <button className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100">
                  <Bell size={24} />
                </button>
                <div className="flex items-center space-x-2 cursor-pointer" onClick={toggleSidebar}>
                  <Avatar
                    src={userImage || ''}
                    name={userName || 'User'}
                    size="sm"
                    className="w-10 h-10"
                  />
                  <span className="text-gray-700 dark:text-gray-300 hidden sm:inline">{userName || 'Set Name'}</span>
                </div>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Sidebar */}
      {session && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div 
            ref={sidebarRef}
            className={`absolute right-0 top-0 h-full w-72 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
          >
            <div className="flex flex-col h-full p-6">
              <button onClick={toggleSidebar} className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 transition-colors duration-200">
                <X size={24} />
              </button>
              <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-3 border-4 border-blue-500">
                  <User size={48} className="text-gray-600 dark:text-gray-300" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{userName || session.user?.name || 'Guest'}</h2>
              </div>
              <div className="h-px bg-gray-200 dark:bg-gray-700 my-4"></div>
              <nav className="flex-grow overflow-y-auto">
                <Link href="/user/home" className="flex items-center p-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors duration-200" onClick={toggleSidebar}>
                  <Home size={20} className="mr-3" />
                  Home
                </Link>
                <Link href="/user/queues" className="flex items-center p-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors duration-200" onClick={toggleSidebar}>
                  <Users size={20} className="mr-3" />
                  Queues
                </Link>
                {role === 'business' && (
                  <>
                    <Link href="/dashboard" className="flex items-center p-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors duration-200" onClick={toggleSidebar}>
                      <PieChart size={20} className="mr-3" />
                      Business Dashboard
                    </Link>
                    <Link href="/business/profile" className="flex items-center p-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors duration-200" onClick={toggleSidebar}>
                      <User size={20} className="mr-3" />
                      Business Profile
                    </Link>
                    <Link href="/business/support" className="flex items-center p-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors duration-200" onClick={toggleSidebar}>
                      <HelpCircle size={20} className="mr-3" />
                      Support
                    </Link>
                  </>
                )}
                <Link href="/user/dashboard" className="flex items-center p-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors duration-200" onClick={toggleSidebar}>
                  <PieChart size={20} className="mr-3" />
                  User Dashboard
                </Link>
                <Link href="/user/settings" className="flex items-center p-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors duration-200" onClick={toggleSidebar}>
                  <Settings size={20} className="mr-3" />
                  Settings
                </Link>
              </nav>
              <div className="mt-auto">
                <div className="h-px bg-gray-200 dark:bg-gray-700 my-2"></div>
                <div className="flex items-center justify-between p-3">
                  <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
                  <ThemeToggle />
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center p-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors duration-200 w-full"
                >
                  <LogOut size={20} className="mr-3" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Header