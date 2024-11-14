'use client'

import Link from 'next/link'
import { useSession, signOut } from "next-auth/react"
import { Bell, X, Home, Settings, LogOut, User, Users, PieChart, HelpCircle, ChevronRight } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useUserInfo } from '../../hooks/useUserName'
import { usePathname } from 'next/navigation'
import { Avatar, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Button, Divider } from "@nextui-org/react"
import { ThemeToggle } from '../ThemeToggle'
import { toast } from 'sonner'

const DynamicHeader = dynamic(() => import('./DynamicHeader'), { ssr: false })

const Header = () => {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const sidebarRef = useRef(null)
  const { name: userName, role, image: userImage, short_id: userShortId, isNameNull, updateUserInfo } = useUserInfo(session?.user?.id)
  const [isNameModalOpen, setIsNameModalOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [pressTimer, setPressTimer] = useState(null)
  
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

  useEffect(() => {
    if (isNameNull && pathname !== '/signin') {
      setIsNameModalOpen(true)
    }
  }, [isNameNull, pathname])

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

  const handlePressStart = () => {
    const timer = setTimeout(() => {
      if (userShortId) {
        navigator.clipboard.writeText(userShortId)
        toast.success('ID copied to clipboard')
      }
    }, 500) // 500ms for long press
    setPressTimer(timer)
  }

  const handlePressEnd = () => {
    if (pressTimer) {
      clearTimeout(pressTimer)
      setPressTimer(null)
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
                <div 
                  className="flex items-center space-x-2 cursor-pointer"
                  onMouseEnter={() => setSidebarOpen(true)}
                >
                  <div className="flex flex-col items-end">
                    <span className="text-gray-700 dark:text-gray-300 hidden sm:inline">{userName || 'Set Name'}</span>
                    {userShortId && (
                      <div className="relative group">
                        <p className="text-sm opacity-80 cursor-pointer"
                          onMouseDown={handlePressStart}
                          onMouseUp={handlePressEnd}
                          onMouseLeave={handlePressEnd}
                          onTouchStart={handlePressStart}
                          onTouchEnd={handlePressEnd}
                        >
                          ID: {userShortId}
                        </p>
                        <span className="absolute -bottom-6 left-0 text-xs bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                          Long press to copy ID
                        </span>
                      </div>
                    )}
                  </div>
                  <Avatar
                    src={userImage || ''}
                    name={userName || 'User'}
                    size="sm"
                    className="w-10 h-10"
                  />
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
                    {userShortId && (
                      <div className="relative group">
                        <p className="text-sm opacity-80 cursor-pointer"
                          onMouseDown={handlePressStart}
                          onMouseUp={handlePressEnd}
                          onMouseLeave={handlePressEnd}
                          onTouchStart={handlePressStart}
                          onTouchEnd={handlePressEnd}
                        >
                          ID: {userShortId}
                        </p>
                        <span className="absolute -bottom-6 left-0 text-xs bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                          Long press to copy ID
                        </span>
                      </div>
                    )}
                    <p className="text-sm opacity-80">{role === 'business' ? 'Business Account' : 'User Account'}</p>
                  </div>
                </div>
              </div>
              <nav className="flex-grow overflow-y-auto p-4">
                <SidebarLink href="/user/home" icon={Home}>Home</SidebarLink>
                <SidebarLink href="/user/queues" icon={Users}>Queues</SidebarLink>
                <SidebarLink href="/user/dashboard" icon={PieChart}>User Dashboard</SidebarLink>
                {role === 'business' && (
                  <>
                    <Divider className="my-2" />
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 mt-4">Business</h3>
                    <SidebarLink href="/dashboard" icon={PieChart}>Business Dashboard</SidebarLink>
                    <SidebarLink href="/business/profile" icon={User}>Business Profile</SidebarLink>
                    <SidebarLink href="/business/support" icon={HelpCircle}>Support</SidebarLink>
                  </>
                )}
                <Divider className="my-2" />
                <SidebarLink href="/user/settings" icon={Settings}>Settings</SidebarLink>
              </nav>
              <div className="p-4 bg-gray-100 dark:bg-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
                  <ThemeToggle />
                </div>
                <Button 
                  onClick={handleLogout}
                  color="danger"
                  variant="flat"
                  startContent={<LogOut size={20} />}
                  className="w-full"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Modal isOpen={isNameModalOpen} onClose={() => {}} hideCloseButton>
        <ModalContent>
          <ModalHeader>Welcome! Please enter your name</ModalHeader>
          <ModalBody>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Your name"
            />
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={handleNameSubmit} disabled={!newName.trim()}>
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default Header