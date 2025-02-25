'use client'

import Link from 'next/link'
import { useSession, signOut } from "next-auth/react"
import { 
  Bell, X, Home, Settings, User, 
  Users, PieChart, HelpCircle,
  Clock, Copy, Share2, History,
  Bookmark, MessageSquare
} from 'lucide-react'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { Button, Popover, PopoverTrigger, PopoverContent, Tooltip } from "@nextui-org/react"
import { toast } from 'sonner'
import { ThemeToggle } from '../ThemeToggle'
import { useApi } from '../../hooks/useApi'

const DynamicHeader = dynamic(() => import('./DynamicHeader'), { ssr: false })

const Header = () => {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const sidebarRef = useRef(null)

  const { data: apiData, isLoading: userLoading, isError: userError } = useApi(
    session?.user?.id ? `/api/user?userId=${session.user.id}` : null
  )

  const userInfo = apiData && apiData.success ? {
    name: apiData.data.name,
    role: apiData.data.role,
    image: apiData.data.image,
    short_id: apiData.data.user_short_id,
    needsNameUpdate: !apiData.data.name || apiData.data.name === 'User'
  } : {}

  const userName = userInfo.name
  const role = userInfo.role
  const userImage = userInfo.image
  const shortid = userInfo.short_id

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

  if (pathname === '/signin' || pathname === '/') return null

  const NavLink = ({ href, icon: Icon, children }) => {
    const pathname = usePathname()
    const isActive = pathname === href || pathname.startsWith(`${href}?`)

    return (
      <Tooltip content={children} placement="right" delay={300}>
        <Link 
          href={href}
          className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group
            ${isActive 
              ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300' 
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          onClick={toggleSidebar}
        >
          <Icon className={`w-5 h-5 ${isActive ? 'text-amber-600 dark:text-amber-400' : 'group-hover:text-amber-500 transition-colors'}`} />
          <span>{children}</span>
          {isActive && (
            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
          )}
        </Link>
      </Tooltip>
    )
  }

  const NavGroup = ({ title, children }) => (
    <div className="space-y-1">
      <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {title}
      </h3>
      {children}
    </div>
  )

  return (
    <>
      <DynamicHeader session={session} />
      {/* Header */}
      <header className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-20 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left section with hover effect */}
            <div className="flex items-center group">
              <Link href="/dashboard" className="flex items-center gap-2 transition-transform duration-200 hover:scale-105">
                <Image
                  src="/logo.webp"
                  alt="DontQ Logo"
                  width={32}
                  height={32}
                  priority
                  className="transition-opacity duration-200"
                />
              </Link>
              <span className="ml-2 text-xl sm:text-2xl font-bold text-black dark:text-white">
                Dont<span className="text-orange-500">Que</span>
              </span>
            </div>

            {/* Right section */}
            {session?.user && (
              <div className="flex items-center gap-4">
                <Popover placement="bottom-end">
                  <PopoverTrigger>
                    <button className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
                      <Bell size={20} />
                      <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        0
                      </span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold">Recent Notifications</h3>
                        <Link href="/user/notifications">
                          <Button size="sm" variant="light">
                            View All
                          </Button>
                        </Link>
                      </div>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                          No notification yet
                        </p>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <div 
                  className="flex items-center gap-3 cursor-pointer p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  onClick={toggleSidebar}
                >
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden ring-1">
                    {userLoading ? (
                      <div className="animate-pulse w-full h-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800" />
                    ) : userImage ? (
                      <img
                        src={userImage}
                        alt={userName || 'User avatar'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </div>
                    )}
                  </div>
                  {userLoading ? (
                    <div className="hidden sm:block w-24 h-4 animate-pulse bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded" />
                  ) : (
                    <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200">
                      {userName}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar */}
      {session && (
        <div className={`fixed inset-0 z-30 transition-all duration-500 ${
          sidebarOpen 
            ? 'bg-black/30 backdrop-blur-sm perspective-[1000px] transform-gpu' 
            : 'pointer-events-none bg-transparent backdrop-blur-none perspective-none'
        }`}
        >
          <div
            ref={sidebarRef}
            className={`absolute right-0 top-0 h-screen w-72 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col ${
              sidebarOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {/* Profile Section */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden ring-2 ring-amber-200 dark:ring-amber-800">
                  {userLoading ? (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  ) : userImage ? (
                    <img
                      src={userImage}
                      alt={userName || 'User avatar'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-gray-900 dark:text-white">
                    {userLoading ? 'Loading...' : (userName || session.user?.name || 'Guest')}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {userLoading ? '...' : (role || 'User')}
                  </p>
                  {!userLoading && shortid && (
                    <div className="flex items-center gap-2 mt-2 overflow-x-auto">
                      <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono whitespace-nowrap">
                        ID: {shortid}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(shortid)
                          toast.success('Shortid copied to clipboard')
                        }}
                        className="flex-shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                        title="Copy ID"
                      >
                        <Copy className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await navigator.share({
                              title: 'My Queue Shortid',
                              text: `My DontQue id: ${shortid}`,
                            })
                          } catch (err) {
                            navigator.clipboard.writeText(shortid)
                            toast.success('Shortid copied to clipboard')
                          }
                        }}
                        className="flex-shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                        title="Share ID"
                      >
                        <Share2 className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
              {!userLoading && role === 'admin' && (
                <>
                  <NavGroup title="Admin">
                    <NavLink href="/admin/dashboard" icon={PieChart}>Admin Dashboard</NavLink>
                    <NavLink href="/admin/users" icon={Users}>Manage Users</NavLink>
                    <NavLink href="/admin/businesses" icon={Users}>Manage Businesses</NavLink>
                  </NavGroup>
                  
                  <NavGroup title="Business">
                    <NavLink href="/dashboard" icon={PieChart}>Queue Dashboard</NavLink>
                    <NavLink href="/dashboard/business-profile" icon={User}>Business Profile</NavLink>
                  </NavGroup>
                  
                  <NavGroup title="Main">
                    <NavLink href="/user/home" icon={Home}>Home</NavLink>
                    <NavLink href="/user/queues" icon={Users}>Queues</NavLink>
                    <NavLink href="/user/saved-queues" icon={Bookmark}>Saved Queues</NavLink>
                    <NavLink href="/user/current-queues" icon={Clock}>Current Queues</NavLink>
                    <NavLink href="/user/queue-history" icon={History}>Queue History</NavLink>
                  </NavGroup>
                </>
              )}

              {!userLoading && role === 'user' && (
                <NavGroup title="Main">
                  <NavLink href="/user/home" icon={Home}>Home</NavLink>
                  <NavLink href="/user/queues" icon={Users}>Queues</NavLink>
                  <NavLink href="/user/saved-queues" icon={Bookmark}>Saved Queues</NavLink>
                  <NavLink href="/user/current-queues" icon={Clock}>Current Queues</NavLink>
                  <NavLink href="/user/queue-history" icon={History}>Queue History</NavLink>
                </NavGroup>
              )}

              {!userLoading && role === 'business' && (
                <NavGroup title="Business">
                  <NavLink href="/dashboard" icon={PieChart}>Queue Dashboard</NavLink>
                  <NavLink href="/dashboard/business-profile" icon={User}>Business Profile</NavLink>
                </NavGroup>
              )}

              <NavGroup title="Account">
                <NavLink href="/user/dashboard" icon={User}>Profile</NavLink>
                <NavLink href="/support" icon={HelpCircle}>Support</NavLink>
                <NavLink href="/feedback" icon={MessageSquare}>App Feedback</NavLink>
              </NavGroup>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}

export default Header