'use client'

import { useState, useEffect } from 'react'
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'
import { Settings, Phone } from 'lucide-react'
import { Button, Card, CardBody, Avatar, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Checkbox } from "@nextui-org/react"
import { toast } from 'sonner'
import { useApi } from '../../hooks/useApi'
import { useUserInfo } from '../../hooks/useUserName'

export default function UserDashboard() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editedUserData, setEditedUserData] = useState(null)
  const { data: userData, isLoading: isUserLoading, isError: isUserError, mutate: mutateUser } = useApi('/api/user/profile')
  const { data: session, update: updateSession } = useSession()
  const router = useRouter()
  const { updateUserInfo } = useUserInfo(session?.user?.id)

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
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedUserData)
      })
      if (!response.ok) throw new Error('Failed to update profile')
      
      await mutateUser(editedUserData)
      await updateSession({ ...session, user: { ...session.user, name: editedUserData.name } })
      updateUserInfo({ name: editedUserData.name })
      
      setIsEditModalOpen(false)
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <Card className="dark:bg-gray-800 border-none shadow-lg">
          <CardBody>
            <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 sm:gap-6 p-2 sm:p-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6 w-full sm:w-auto">
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
              </div>
              <Button 
                className="bg-primary text-white dark:bg-primary-dark hover:opacity-90 transition-opacity w-full sm:w-auto"
                startContent={<Settings className="h-4 w-4" />}
                onClick={handleEditProfile}
              >
                Edit Profile
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Edit Profile Modal */}
        <Modal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)}
          size="2xl"
          className="sm:mx-4"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <h2 className="text-lg sm:text-xl font-semibold">Edit Profile</h2>
                </ModalHeader>
                <ModalBody>
                  <div className="space-y-4 sm:space-y-6">
                    <Input
                      label="Name"
                      value={editedUserData?.name || ''}
                      onChange={(e) => setEditedUserData({...editedUserData, name: e.target.value})}
                      variant="bordered"
                      className="w-full text-sm sm:text-base"
                    />
                    <Input
                      label="Phone Number"
                      value={editedUserData?.phone_number || ''}
                      onChange={(e) => setEditedUserData({...editedUserData, phone_number: e.target.value})}
                      variant="bordered"
                      type="tel"
                      className="w-full text-sm sm:text-base"
                    />
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button 
                    color="danger" 
                    variant="light" 
                    onPress={onClose}
                    className="text-sm sm:text-base"
                  >
                    Cancel
                  </Button>
                  <Button 
                    color="primary"
                    onPress={handleSaveChanges}
                    className="text-sm sm:text-base"
                  >
                    Save Changes
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </main>
    </div>
  )
}