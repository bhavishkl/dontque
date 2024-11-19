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

const DynamicHeader = dynamic(() => import('./DynamicHeader'), { ssr: false })

const Header = () => {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const sidebarRef = useRef(null)
  const { name: userName, role, image: userImage, isNameNull, updateUserInfo } = useUserInfo(session?.user?.id)
  const [isNameModalOpen, setIsNameModalOpen] = useState(false)
  const [newName, setNewName] = useState('')
  
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

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

  const handleNameSubmit = async () => {
    if (newName.trim()) {
      try {
        const response = await fetch('/api/user/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newName.trim() })
        })
        if (response.ok) {
          updateUserInfo({ name: newName.trim() })
          setIsNameModalOpen(false)
        } else {
          throw new Error('Failed to update name')
        }
      } catch (error) {
        console.error('Error updating name:', error)
      }
    }
  }

  if (pathname === '/' || pathname === '/signin') return null

  const SidebarLink = ({ href, icon: Icon, children }) => (
    <Link 
      href={href} 
      className="flex items-center p-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors duration-200" 
      onClick={toggleSidebar}
    >
      <Icon size={20} className="mr-3" />
      <span className="flex-grow">{children}</span>
      <ChevronRight size={16} />
    </Link>
  )

  return (
    <>
      <DynamicHeader session={session} />
      <header className="sticky top-0 bg-white dark:bg-gray-800 shadow-sm z-20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-black dark:text-white">Dontque</h1>
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

      {/* Improved Sidebar */}
      {session && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div 
            ref={sidebarRef}
            className={`absolute right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
          >
            <div className="flex flex-col h-full">
              <div className="p-6 bg-blue-600 dark:bg-blue-800 text-white">
                <button onClick={toggleSidebar} className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors duration-200">
                  <X size={24} />
                </button>
                <div className="flex items-center space-x-4">
                  <Avatar
                    src={userImage || ''}
                    name={userName || 'User'}
                    size="lg"
                    className="w-16 h-16 border-2 border-white"
                  />
                  <div>
                    <h2 className="text-xl font-bold">{userName || session.user?.name || 'Guest'}</h2>
                    <p className="text-sm opacity-80">{role === 'business' ? 'Business Account' : 'User Account'}</p>
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