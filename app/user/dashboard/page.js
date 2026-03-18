'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from "next-auth/react"
import { useRouter } from 'next/navigation'
import { Settings, Phone, LogOut } from 'lucide-react'
import { Button, Card, CardBody, Avatar } from "@nextui-org/react"
import { toast } from 'sonner'
import { useApi } from '../../hooks/useApi'
import { useUserInfo } from '../../hooks/useUserName'
import dynamic from 'next/dynamic'

// Dynamic import of EditProfileModal
const EditProfileModal = dynamic(
  () => import('../../components/UserDashboardComponents/EditProfileModal'),
  {
    loading: () => null,
    ssr: false
  }
)

export default function UserDashboard() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editedUserData, setEditedUserData] = useState(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { data: userData, isLoading: isUserLoading, isError: isUserError, mutate: mutateUser } = useApi('/api/user/profile')
  const { data: session, update: updateSession } = useSession()
  const router = useRouter()
  
  // Get role and updateUserInfo separately to handle potential undefined
  const { role, updateUserInfo: updateInfo } = useUserInfo(session?.user?.id) || {}

  useEffect(() => {
    if (!session) {
      router.push('/signin')
    }
  }, [session, router])

  useEffect(() => {
    if (userData && !editedUserData) {
      setEditedUserData(userData)
    }
  }, [userData])

  const handleEditProfile = () => {
    setEditedUserData(userData)
    setIsEditModalOpen(true)
  }
  
  const handleSaveChanges = async () => {
    try {
      if (!editedUserData?.name || !editedUserData?.phone_number) {
        toast.error('Please fill in all required fields')
        return
      }

      // Format phone number with +91 prefix if not already present
      const formattedPhoneNumber = editedUserData.phone_number.startsWith('+91') 
        ? editedUserData.phone_number 
        : `+91${editedUserData.phone_number}`

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editedUserData,
          phone_number: formattedPhoneNumber
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile')
      }
      
      // Update local data with formatted phone number
      await mutateUser({
        ...editedUserData,
        phone_number: formattedPhoneNumber
      })
      
      // Update session
      if (updateSession) {
        await updateSession({ ...session, user: { ...session.user, name: editedUserData.name } })
      }
      
      // Update user info only if the function exists
      if (typeof updateInfo === 'function') {
        await updateInfo({ name: editedUserData.name })
      }
      
      setIsEditModalOpen(false)
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error(error.message || 'Failed to update profile. Please try again.')
    }
  }

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)

      // Call the logout API to clear cookies
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      // Call NextAuth signOut
      await signOut({ redirect: false })
      
      toast.success('Logged out successfully')
      router.push('/signin')
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Failed to logout. Please try again.');
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 transition-colors duration-300">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-[2rem] border border-white/50 dark:border-gray-700/50 shadow-[12px_12px_24px_rgba(0,0,0,0.05),-12px_-12px_24px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(255,255,255,1),inset_-2px_-2px_4px_rgba(0,0,0,0.02)] dark:shadow-[12px_12px_24px_rgba(0,0,0,0.3),-12px_-12px_24px_rgba(255,255,255,0.05),inset_2px_2px_4px_rgba(255,255,255,0.1),inset_-2px_-2px_4px_rgba(0,0,0,0.2)] p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8">
            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 w-full sm:w-auto">
              {isUserLoading ? (
                <>
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[1.5rem] bg-gray-200/80 dark:bg-gray-700/80 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,1)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.1)] animate-pulse" />
                  <div className="space-y-4 text-center sm:text-left">
                    <div className="h-8 w-40 bg-gray-200/80 dark:bg-gray-700/80 rounded-full animate-pulse" />
                    <div className="h-6 w-48 bg-gray-200/80 dark:bg-gray-700/80 rounded-full animate-pulse" />
                  </div>
                </>
              ) : (
                <>
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-[1.5rem] overflow-hidden shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,1)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.1)] p-1.5 bg-white/50 dark:bg-gray-700/50">
                    <Avatar 
                      src={userData?.image || `https://ui-avatars.com/api/?name=${userData?.name}&background=random`} 
                      name={userData?.name} 
                      className="w-full h-full text-large rounded-[1.2rem]"
                      showFallback
                      fallback={
                        <div className="bg-amber-500 text-white font-semibold text-2xl w-full h-full flex items-center justify-center rounded-[1.2rem]">
                          {userData?.name?.charAt(0)?.toUpperCase()}
                        </div>
                      }
                    />
                  </div>
                  <div className="space-y-3 text-center sm:text-left">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{userData?.name}</h1>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100/80 dark:bg-gray-800/80 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.5)] dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.2),inset_-2px_-2px_5px_rgba(255,255,255,0.05)]">
                      <Phone className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                      <span className="text-gray-700 dark:text-gray-300 font-medium tracking-wide">
                        {userData?.phone_number}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              {isUserLoading ? (
                <>
                  <div className="h-12 w-32 bg-gray-200/80 dark:bg-gray-700/80 rounded-[1rem] animate-pulse" />
                  <div className="h-12 w-32 bg-gray-200/80 dark:bg-gray-700/80 rounded-[1rem] animate-pulse" />
                </>
              ) : (
                <>
                  <Button 
                    className="h-12 px-6 bg-amber-500 text-white rounded-[1rem] font-semibold shadow-[6px_6px_12px_rgba(0,0,0,0.1),-6px_-6px_12px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(255,255,255,0.4),inset_-2px_-2px_4px_rgba(0,0,0,0.1)] hover:bg-amber-400 active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2),inset_-4px_-4px_8px_rgba(255,255,255,0.2)] transition-all dark:bg-amber-600 dark:shadow-[6px_6px_12px_rgba(0,0,0,0.3),-6px_-6px_12px_rgba(255,255,255,0.05),inset_2px_2px_4px_rgba(255,255,255,0.1),inset_-2px_-2px_4px_rgba(0,0,0,0.2)]"
                    startContent={<Settings className="h-4 w-4" />}
                    onClick={handleEditProfile}
                  >
                    Edit Profile
                  </Button>
                  <Button 
                    className="h-12 px-6 bg-red-500 text-white rounded-[1rem] font-semibold shadow-[6px_6px_12px_rgba(0,0,0,0.1),-6px_-6px_12px_rgba(255,255,255,0.8),inset_2px_2px_4px_rgba(255,255,255,0.4),inset_-2px_-2px_4px_rgba(0,0,0,0.1)] hover:bg-red-400 active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2),inset_-4px_-4px_8px_rgba(255,255,255,0.2)] transition-all dark:bg-red-600 dark:shadow-[6px_6px_12px_rgba(0,0,0,0.3),-6px_-6px_12px_rgba(255,255,255,0.05),inset_2px_2px_4px_rgba(255,255,255,0.1),inset_-2px_-2px_4px_rgba(0,0,0,0.2)]"
                    startContent={!isLoggingOut && <LogOut className="h-4 w-4" />}
                    onClick={handleLogout}
                    isLoading={isLoggingOut}
                  >
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        <EditProfileModal 
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          editedUserData={editedUserData}
          setEditedUserData={setEditedUserData}
          handleSaveChanges={handleSaveChanges}
          isUserLoading={isUserLoading}
        />
      </main>
    </div>
  )
}