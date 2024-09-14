'use client'

import Link from 'next/link'
import { useSession, signOut } from "next-auth/react"
import { Bell, X, Home, Settings, LogOut, User, Users, PieChart, HelpCircle } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useUserInfo } from '../../hooks/useUserName'
import { supabase } from '../../lib/supabase'
import { usePathname } from 'next/navigation'

const DynamicHeader = dynamic(() => import('./DynamicHeader'), { ssr: false })

const Header = () => {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const sidebarRef = useRef(null)
  const { name: userName, role } = useUserInfo(session?.user?.id)

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
      <header className="sticky top-0 bg-white shadow-sm z-20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/user/home">
            <h1 className="text-2xl font-bold text-black">QueueSmart</h1>
          </Link>
          <nav className="flex items-center space-x-4">
            {session?.user && (
              <>
                <button className="text-gray-600 hover:text-gray-800">
                  <Bell size={24} />
                </button>
                <div className="flex items-center space-x-2 cursor-pointer" onClick={toggleSidebar}>
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User size={24} className="text-gray-600" />
                  </div>
                  <span className="text-gray-700 hidden sm:inline">{userName || 'Set Name'}</span>
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
            className={`absolute right-0 top-0 h-full w-72 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
          >
            <div className="p-6">
              <button onClick={toggleSidebar} className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 transition-colors duration-200">
                <X size={24} />
              </button>
              <div className="flex flex-col items-center mt-8 mb-8">
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-3 border-4 border-blue-500">
                  <User size={48} className="text-gray-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">{userName || session.user?.name || 'Guest'}</h2>
              </div>
              <div className="h-px bg-gray-200 my-4"></div>
              <nav className="mt-6 space-y-2">
                <Link href="/user/home" className="flex items-center p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-200">
                  <Home size={20} className="mr-3" />
                  Home
                </Link>
                <Link href="/user/queues" className="flex items-center p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-200">
                  <Users size={20} className="mr-3" />
                  Queues
                </Link>
                {role === 'business' && (
                  <>
                    <Link href="/dashboard" className="flex items-center p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-200">
                      <PieChart size={20} className="mr-3" />
                      Business Dashboard
                    </Link>
                    <Link href="/business/profile" className="flex items-center p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-200">
                      <User size={20} className="mr-3" />
                      Business Profile
                    </Link>
                    <Link href="/business/support" className="flex items-center p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-200">
                      <HelpCircle size={20} className="mr-3" />
                      Support
                    </Link>
                  </>
                )}
                <Link href="/user/dashboard" className="flex items-center p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-200">
                  <PieChart size={20} className="mr-3" />
                  User Dashboard
                </Link>
                <Link href="/user/settings" className="flex items-center p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-200">
                  <Settings size={20} className="mr-3" />
                  Settings
                </Link>
                <div className="h-px bg-gray-200 my-2"></div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 w-full"
                >
                  <LogOut size={20} className="mr-3" />
                  Logout
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Header
