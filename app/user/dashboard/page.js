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
      // Call the logout API to clear cookies
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Failed to logout. Please try again.');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <Card className="dark:bg-gray-800 border-none shadow-lg">
          <CardBody>
            <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 sm:gap-6 p-2 sm:p-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6 w-full sm:w-auto">
                {isUserLoading ? (
                  <>
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse" />
                    <div className="space-y-3 text-center sm:text-left">
                      <div className="h-6 w-32 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded animate-pulse" />
                      <div className="h-5 w-40 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded animate-pulse" />
                    </div>
                  </>
                ) : (
                  <>
                    <Avatar 
                      src={userData?.image || `https://ui-avatars.com/api/?name=${userData?.name}&background=random`} 
                      name={userData?.name} 
                      className="h-20 w-20 sm:h-24 sm:w-24 text-large"
                      showFallback
                      fallback={
                        <div className="bg-primary text-white font-semibold text-xl">
                          {userData?.name?.charAt(0)?.toUpperCase()}
                        </div>
                      }
                    />
                    <div className="space-y-2 text-center sm:text-left">
                      <h1 className="text-xl sm:text-2xl font-bold dark:text-white">{userData?.name}</h1>
                      <p className="text-gray-600 dark:text-gray-300 flex items-center justify-center sm:justify-start gap-2">
                        <Phone className="h-4 w-4" />
                        {userData?.phone_number}
                      </p>
                    </div>
                  </>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
                {isUserLoading ? (
                  <>
                    <div className="h-10 w-28 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded animate-pulse" />
                    <div className="h-10 w-28 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded animate-pulse" />
                  </>
                ) : (
                  <>
                    <Button 
                      className="bg-primary text-white dark:bg-primary-dark hover:opacity-90 transition-opacity"
                      startContent={<Settings className="h-4 w-4" />}
                      onClick={handleEditProfile}
                    >
                      Edit Profile
                    </Button>
                    <Button 
                      className="bg-danger text-white hover:opacity-90 transition-opacity"
                      startContent={<LogOut className="h-4 w-4" />}
                      onClick={handleLogout}
                    >
                      Logout
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

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