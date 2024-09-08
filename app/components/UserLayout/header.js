import Link from 'next/link'
import { useSession, signOut } from "next-auth/react"
import { Bell, X, Home, Settings, LogOut, User } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'

const DynamicHeader = dynamic(() => import('./DynamicHeader'), { ssr: false })

const Header = () => {
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const sidebarRef = useRef(null)

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
    await signOut({ redirect: true, callbackUrl: '/' })
  }

  return (
    <>
      <DynamicHeader session={session} />
      <header className="sticky top-0 bg-white shadow-sm z-20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/home">
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
                  <span className="text-gray-700">{session.user.name}</span>
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
            className={`absolute right-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
          >
            <div className="p-4">
              <button onClick={toggleSidebar} className="absolute top-4 right-4 text-gray-600 hover:text-gray-800">
                <X size={24} />
              </button>
              <div className="flex flex-col items-center mt-8 mb-6">
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                  <User size={40} className="text-gray-600" />
                </div>
                <h2 className="text-xl font-semibold">{session.user?.name || 'Guest'}</h2>
              </div>
              <nav className="mt-8">
                <Link href="/home" className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded">
                  <Home size={20} className="mr-3" />
                  Home
                </Link>
                <Link href="/settings" className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded">
                  <Settings size={20} className="mr-3" />
                  Settings
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded w-full"
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
