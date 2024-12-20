'use client'

import { useState, useEffect } from 'react'
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'
import { Clock, Star, Settings, History, LogOut, ExternalLink, Phone } from 'lucide-react'
import { Button, Card, CardBody, CardHeader, Avatar, Badge, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Skeleton, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Checkbox } from "@nextui-org/react"
import Link from 'next/link'
import { toast } from 'sonner'
import { useApi } from '../../hooks/useApi'
import { useUserInfo } from '../../hooks/useUserName'

export default function UserDashboard() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editedUserData, setEditedUserData] = useState(null)
  const { data: userData, isLoading: isUserLoading, isError: isUserError, mutate: mutateUser } = useApi('/api/user/profile')
  const { data: currentQueues, isLoading: isCurrentQueuesLoading, isError: isCurrentQueuesError, mutate: mutateCurrentQueues } = useApi('/api/user/current-queues')
  const { data: pastQueues, isLoading: isPastQueuesLoading, isError: isPastQueuesError, mutate: mutatePastQueues } = useApi('/api/user/past-queues')
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

  const isLoading = isUserLoading || isCurrentQueuesLoading || isPastQueuesLoading
  const isError = isUserError || isCurrentQueuesError || isPastQueuesError

  useEffect(() => {
    if (isError) {
      toast.error('Failed to load data. Please try again.')
    }
  }, [isError])

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

  const renderCurrentQueuesSkeleton = () => (
    <Table>
      <TableHeader>
        <TableColumn className="dark:text-gray-200">Queue Name</TableColumn>
        <TableColumn className="dark:text-gray-200">Position</TableColumn>
        <TableColumn className="dark:text-gray-200">Estimated Wait Time</TableColumn>
        <TableColumn className="dark:text-gray-200">Actions</TableColumn>
      </TableHeader>
      <TableBody>
        {[...Array(3)].map((_, index) => (
          <TableRow key={index} className="dark:bg-gray-800 dark:text-white">
            <TableCell><Skeleton className="w-full h-6" /></TableCell>
            <TableCell><Skeleton className="w-16 h-6" /></TableCell>
            <TableCell><Skeleton className="w-24 h-6" /></TableCell>
            <TableCell><Skeleton className="w-24 h-8 rounded-md" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  const handleTabChange = (key) => {
    setActiveTab(key)
    router.push(`/user/dashboard?tab=${key}`, undefined, { shallow: true })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Profile Section */}
        <Card className="dark:bg-gray-800 border-none shadow-lg">
          <CardBody>
            <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 sm:gap-6 p-2 sm:p-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6 w-full sm:w-auto">
                <Avatar 
                  src={userData?.image} 
                  name={userData?.name} 
                  className="h-20 w-20 sm:h-24 sm:w-24 text-large"
                  showFallback
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

        {/* Current Queues Section */}
        <Card className="dark:bg-gray-800 border-none shadow-lg">
          <CardHeader className="flex items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary dark:text-primary-dark" />
              <h2 className="text-lg sm:text-xl font-semibold dark:text-white">Current Queues</h2>
            </div>
          </CardHeader>
          <CardBody className="px-2 sm:px-6">
            {isLoading ? (
              renderCurrentQueuesSkeleton()
            ) : currentQueues && currentQueues.length > 0 ? (
              <div className="overflow-x-auto">
                <Table aria-label="Current queues">
                  <TableHeader>
                    <TableColumn className="dark:text-gray-200 text-sm sm:text-base">Queue Name</TableColumn>
                    <TableColumn className="dark:text-gray-200 text-sm sm:text-base">Position</TableColumn>
                    <TableColumn className="dark:text-gray-200 text-sm sm:text-base whitespace-nowrap">Est. Wait Time</TableColumn>
                    <TableColumn className="dark:text-gray-200 text-sm sm:text-base">Actions</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {currentQueues.map((queue) => (
                      <TableRow key={queue.id} className="dark:bg-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <TableCell className="font-medium text-sm sm:text-base">{queue.name}</TableCell>
                        <TableCell>
                          <Badge color="primary" variant="flat" className="text-xs sm:text-sm">#{queue.position}</Badge>
                        </TableCell>
                        <TableCell className="text-sm sm:text-base">{queue.estimatedWaitTime} min</TableCell>
                        <TableCell>
                          <Link href={`/user/queue/${queue.id}`} passHref>
                            <Button 
                              size="sm"
                              className="text-xs sm:text-sm bg-primary/10 text-primary dark:bg-primary-dark/10 dark:text-primary-dark hover:bg-primary/20 dark:hover:bg-primary-dark/20"
                            >
                              View Details
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <p className="dark:text-gray-300 text-base sm:text-lg">You are not currently in any queues.</p>
                <Link href="/user/queues" passHref>
                  <Button 
                    className="mt-4 bg-primary text-white dark:bg-primary-dark hover:opacity-90 transition-opacity text-sm sm:text-base"
                  >
                    Join a Queue
                  </Button>
                </Link>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Queue History Section */}
        <Card className="dark:bg-gray-800 border-none shadow-lg">
          <CardHeader className="flex items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary dark:text-primary-dark" />
              <h2 className="text-lg sm:text-xl font-semibold dark:text-white">Queue History</h2>
            </div>
          </CardHeader>
          <CardBody className="px-2 sm:px-6">
            {isLoading ? (
              <Skeleton className="w-full h-60" />
            ) : pastQueues && pastQueues.length > 0 ? (
              <div className="overflow-x-auto">
                <Table aria-label="Queue history">
                  <TableHeader>
                    <TableColumn className="dark:text-gray-200 text-sm sm:text-base">Queue Name</TableColumn>
                    <TableColumn className="dark:text-gray-200 text-sm sm:text-base">Date</TableColumn>
                    <TableColumn className="dark:text-gray-200 text-sm sm:text-base">Wait Time</TableColumn>
                    <TableColumn className="dark:text-gray-200 text-sm sm:text-base">Rating</TableColumn>
                    <TableColumn className="dark:text-gray-200 text-sm sm:text-base">Details</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {pastQueues.map((queue) => (
                      <TableRow key={queue.id} className="dark:bg-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <TableCell className="font-medium text-sm sm:text-base">{queue.name}</TableCell>
                        <TableCell className="text-sm sm:text-base whitespace-nowrap">{queue.date}</TableCell>
                        <TableCell className="text-sm sm:text-base">{queue.waitTime} min</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm sm:text-base">{queue.rating}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link href={`/user/queue-history/${queue.id}`} passHref>
                            <Button 
                              size="sm"
                              variant="bordered" 
                              className="text-xs sm:text-sm bg-transparent border-primary text-primary dark:border-primary-dark dark:text-primary-dark hover:bg-primary/10 dark:hover:bg-primary-dark/10"
                              startContent={<ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />}
                            >
                              View Details
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <p className="dark:text-gray-300 text-base sm:text-lg">You have no queue history.</p>
              </div>
            )}
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
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <Avatar 
                        src={editedUserData?.image} 
                        name={editedUserData?.name}
                        className="h-16 w-16 sm:h-20 sm:w-20"
                        showFallback
                      />
                      <Button 
                        color="primary"
                        variant="flat"
                        className="w-full sm:w-auto text-sm sm:text-base"
                      >
                        Change Avatar
                      </Button>
                    </div>
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
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium">Notification Preferences</h3>
                      <div className="space-y-2">
                        <Checkbox
                          isSelected={editedUserData?.emailNotifications}
                          onValueChange={(checked) => setEditedUserData({...editedUserData, emailNotifications: checked})}
                          className="text-sm sm:text-base"
                        >
                          Email notifications
                        </Checkbox>
                        <Checkbox
                          isSelected={editedUserData?.pushNotifications}
                          onValueChange={(checked) => setEditedUserData({...editedUserData, pushNotifications: checked})}
                          className="text-sm sm:text-base"
                        >
                          Push notifications
                        </Checkbox>
                      </div>
                    </div>
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