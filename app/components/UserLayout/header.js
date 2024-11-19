'use client'

import Link from 'next/link'
import { useSession, signOut } from "next-auth/react"
import { Bell, X, Home, Search, Clock, History, PieChart, TrendingUp, Star, Building, Users, Settings, User, LogOut, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useUserInfo } from '../../hooks/useUserName'
import { usePathname } from 'next/navigation'
import { Avatar, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Button, Divider, Badge, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react"
import { ThemeToggle } from '../ThemeToggle'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, MapPin, Plus, BellRing } from 'lucide-react'
import { Tooltip } from "@nextui-org/react"

const DynamicHeader = dynamic(() => import('./DynamicHeader'), { ssr: false })

const Header = () => {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const sidebarRef = useRef(null)
  const { name: userName, role, image: userImage } = useUserInfo(session?.user?.id)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Your turn in 5 minutes", type: "urgent" },
    { id: 2, title: "Queue status updated", type: "info" },
    // Add more mock notifications as needed
  ])

  // Handle click outside to close sidebar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    localStorage.removeItem(`userInfo_${session?.user?.id}`)
    await signOut({ redirect: true, callbackUrl: '/' })
  }

  if (pathname === '/' || pathname === '/signin') return null

  const menuSections = [
    {
      title: "Main",
      items: [
        { icon: Home, label: "Home", href: "/user/home" },
        { icon: Search, label: "Explore Queues", href: "/user/queues" },
        { icon: Clock, label: "Active Queues", href: "/user/dashboard", badge: "3" },
        { icon: History, label: "Queue History", href: "/user/history" },
      ]
    },
    {
      title: "Analytics", 
      items: [
        { icon: PieChart, label: "Statistics", href: "/user/statistics" },
        { icon: TrendingUp, label: "Time Saved", href: "/user/time-saved" },
        { icon: Star, label: "Reviews", href: "/user/reviews" },
      ]
    },
    role === 'business' && {
      title: "Business",
      items: [
        { icon: Building, label: "Dashboard", href: "/dashboard" },
        { icon: Users, label: "Customer Management", href: "/business/customers" },
        { icon: Settings, label: "Queue Settings", href: "/business/settings" },
      ]
    },
    {
      title: "Account",
      items: [
        { icon: User, label: "Profile", href: "/user/profile" },
        { icon: Bell, label: "Notifications", href: "/user/notifications", badge: "5" },
        { icon: Settings, label: "Settings", href: "/user/settings" },
      ]
    }
  ].filter(Boolean)

  const sidebarVariants = {
    closed: {
      x: "100%",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40
      }
    },
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
        staggerChildren: 0.1
      }
    }
  };

  const menuItemVariants = {
    closed: {
      x: 50,
      opacity: 0
    },
    open: {
      x: 0,
      opacity: 1
    }
  };

  const overlayVariants = {
    closed: {
      opacity: 0,
      transition: {
        delay: 0.2
      }
    },
    open: {
      opacity: 1
    }
  };

  return (
    <>
      <DynamicHeader session={session} />
      <header className="sticky top-0 bg-white dark:bg-gray-800 shadow-sm z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center space-x-2">
              <Link href="/user/home" className="flex items-center space-x-2">
                <Image
                  src="/logo.png" // Add your logo
                  alt="Dontque Logo"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Dontque
                </h1>
              </Link>
            </div>

            {/* Center Section - Quick Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Quick Search */}
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Search queues..."
                  startContent={<SearchIcon className="text-gray-400" size={18} />}
                  className="w-64 bg-gray-50 dark:bg-gray-700"
                  size="sm"
                />
              </div>

              {/* Quick Add Button */}
              <Tooltip content="Quick Join Queue">
                <Button 
                  isIconOnly
                  variant="flat" 
                  color="primary"
                  size="sm"
                  onClick={() => {/* Handle quick join */}}
                >
                  <Plus size={20} />
                </Button>
              </Tooltip>

              {/* Location Picker */}
              <Button
                variant="light"
                startContent={<MapPin size={18} />}
                size="sm"
                className="text-sm"
              >
                New York
              </Button>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {session?.user && (
                <>
                  <div className="hidden sm:block">
                    <ThemeToggle />
                  </div>

                  {/* Notifications Dropdown */}
                  <Dropdown placement="bottom-end">
                    <DropdownTrigger>
                      <Button 
                        isIconOnly
                        variant="light"
                        className="relative"
                      >
                        <Bell size={24} />
                        {notifications.length > 0 && (
                          <Badge 
                            content={notifications.length} 
                            color="danger"
                            size="sm"
                            className="absolute -top-1 -right-1"
                          />
                        )}
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Notifications"
                      className="w-80"
                      itemClasses={{
                        base: "gap-4",
                      }}
                    >
                      <DropdownItem key="notifications" className="h-auto p-0" textValue="Notifications">
                        <div className="max-h-[300px] overflow-auto p-1">
                          {notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer"
                            >
                              <div className={`p-2 rounded-full ${
                                notif.type === 'urgent' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                              }`}>
                                <BellRing size={16} />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{notif.title}</p>
                                <p className="text-xs text-gray-500">2 minutes ago</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>

                  {/* User Profile Button */}
                  <motion.button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="flex items-center space-x-2 focus:outline-none"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Avatar
                      src={userImage || ''}
                      name={userName || 'User'}
                      size="sm"
                      className="w-10 h-10 cursor-pointer ring-2 ring-offset-2 ring-transparent hover:ring-blue-500 transition-all duration-300"
                    />
                    <motion.span className="hidden sm:inline-flex items-center space-x-1">
                      <span className="text-sm font-medium">{userName || 'Set Name'}</span>
                      <ChevronRight size={16} className="text-gray-400" />
                    </motion.span>
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={overlayVariants}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setIsSidebarOpen(false)}
            />

            {/* Sidebar */}
            <motion.div
              ref={sidebarRef}
              initial="closed"
              animate="open"
              exit="closed"
              variants={sidebarVariants}
              className="fixed right-0 top-0 h-full bg-white dark:bg-gray-900 shadow-xl w-full sm:w-80 z-50"
            >
              {/* Header with Profile */}
              <motion.div 
                className="p-6 border-b dark:border-gray-800"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Avatar
                        src={userImage || ''}
                        name={userName || 'User'}
                        size="md"
                        className="w-12 h-12 ring-2 ring-offset-2 ring-transparent hover:ring-blue-500 transition-all duration-300"
                      />
                    </motion.div>
                    <div>
                      <motion.h2 
                        className="font-semibold text-lg"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        {userName || 'User'}
                      </motion.h2>
                      <motion.p 
                        className="text-sm text-gray-500 dark:text-gray-400"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        {role}
                      </motion.p>
                    </div>
                  </div>
                  <motion.button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={24} />
                  </motion.button>
                </div>
              </motion.div>

              {/* Navigation */}
              <div className="overflow-y-auto h-[calc(100vh-180px)] sidebar-scrollbar">
                <div className="p-4 space-y-6">
                  {menuSections.map((section, sectionIndex) => (
                    <motion.div 
                      key={section.title}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + (sectionIndex * 0.1) }}
                    >
                      <h3 className="text-sm font-semibold text-gray-500 mb-3">
                        {section.title}
                      </h3>
                      <div className="space-y-1">
                        {section.items.map((item, itemIndex) => (
                          <motion.div
                            key={item.href}
                            variants={menuItemVariants}
                            custom={itemIndex}
                          >
                            <Link
                              href={item.href}
                              onClick={() => setIsSidebarOpen(false)}
                              className={`flex items-center gap-3 p-2 rounded-lg transition-colors
                                ${pathname === item.href 
                                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' 
                                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}`}
                            >
                              <div className="relative">
                                <item.icon className="h-5 w-5" />
                                {item.badge && (
                                  <motion.span 
                                    className="absolute -top-1 -right-1 h-4 w-4 text-xs flex items-center justify-center bg-red-500 text-white rounded-full"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 500, delay: 0.5 + (itemIndex * 0.1) }}
                                  >
                                    {item.badge}
                                  </motion.span>
                                )}
                              </div>
                              <span>{item.label}</span>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <motion.div 
                className="absolute bottom-0 left-0 right-0 border-t dark:border-gray-800 bg-white dark:bg-gray-900"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm">Dark Mode</span>
                    <ThemeToggle />
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      color="danger"
                      variant="flat"
                      className="w-full"
                      startContent={<LogOut />}
                      onClick={handleLogout}
                    >
                      Logout
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Header