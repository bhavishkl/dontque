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
          className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-[1rem] transition-all duration-200 group
            ${isActive 
              ? 'bg-amber-500 text-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2),inset_-2px_-2px_4px_rgba(255,255,255,0.2)] dark:bg-amber-600 dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(255,255,255,0.1)]' 
              : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 hover:shadow-[4px_4px_8px_rgba(0,0,0,0.05),-4px_-4px_8px_rgba(255,255,255,0.5)] dark:hover:shadow-[4px_4px_8px_rgba(0,0,0,0.2),-4px_-4px_8px_rgba(255,255,255,0.05)]'
            }`}
          onClick={toggleSidebar}
        >
          <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'group-hover:text-amber-500 transition-colors'}`} />
          <span>{children}</span>
          {isActive && (
            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_4px_rgba(255,255,255,0.8)]" />
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
            className={`absolute right-4 top-4 bottom-4 w-72 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-[2rem] shadow-[12px_12px_24px_rgba(0,0,0,0.1),-12px_-12px_24px_rgba(255,255,255,0.4),inset_2px_2px_4px_rgba(255,255,255,1),inset_-2px_-2px_4px_rgba(0,0,0,0.05)] border border-white/50 dark:border-gray-700/50 dark:shadow-[12px_12px_24px_rgba(0,0,0,0.4),-12px_-12px_24px_rgba(255,255,255,0.05),inset_2px_2px_4px_rgba(255,255,255,0.1),inset_-2px_-2px_4px_rgba(0,0,0,0.2)] transform transition-transform duration-300 ease-in-out flex flex-col ${
              sidebarOpen ? 'translate-x-0' : 'translate-x-[calc(100%+2rem)]'
            }`}
          >
            {/* Close Button */}
            <button 
              onClick={toggleSidebar}
              className="absolute top-4 right-4 p-2 bg-white/50 dark:bg-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-600/80 rounded-full shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.4)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.3),-4px_-4px_8px_rgba(255,255,255,0.05)] transition-all z-10"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>

            {/* Profile Section */}
            <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 flex-shrink-0 mt-4">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="relative w-20 h-20 rounded-[1.5rem] overflow-hidden shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,1)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.1)] p-1 bg-white/50 dark:bg-gray-700/50">
                  {userLoading ? (
                    <div className="w-full h-full rounded-[1.2rem] bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  ) : userImage ? (
                    <img
                      src={userImage}
                      alt={userName || 'User avatar'}
                      className="w-full h-full object-cover rounded-[1.2rem]"
                    />
                  ) : (
                    <div className="w-full h-full rounded-[1.2rem] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-xl text-gray-900 dark:text-white mb-1">
                    {userLoading ? 'Loading...' : (userName || session.user?.name || 'Guest')}
                  </h2>
                  <div className="inline-block px-3 py-1 bg-amber-100/50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded-full shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.5)] dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2),inset_-2px_-2px_4px_rgba(255,255,255,0.05)] mb-3">
                    {userLoading ? '...' : (role || 'User')}
                  </div>
                  {!userLoading && shortid && (
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <div className="flex items-center bg-gray-100/80 dark:bg-gray-800/80 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-2px_-2px_5px_rgba(255,255,255,0.5)] dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.3),inset_-2px_-2px_5px_rgba(255,255,255,0.05)] rounded-full px-4 py-1.5">
                        <code className="text-xs font-mono font-medium text-gray-700 dark:text-gray-300 mr-2">
                          ID: {shortid}
                        </code>
                        <div className="flex gap-1 border-l border-gray-300 dark:border-gray-600 pl-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(shortid)
                              toast.success('Shortid copied to clipboard')
                            }}
                            className="p-1 hover:text-amber-500 transition-colors"
                            title="Copy ID"
                          >
                            <Copy className="w-3.5 h-3.5" />
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
                            className="p-1 hover:text-amber-500 transition-colors"
                            title="Share ID"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-4 space-y-6 overflow-y-auto clay-scrollbar">
              {!userLoading && role === 'admin' && (
                <>
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