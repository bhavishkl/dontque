'use client'

import { useState, useEffect } from 'react'
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'
import { Clock, Star, Settings, History, LogOut, ExternalLink } from 'lucide-react'
import { Button, Card, CardBody, CardHeader, Avatar, Badge, Tabs, Tab, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Skeleton } from "@nextui-org/react"
import Link from 'next/link'
import { toast } from 'sonner'
import { useApi } from '../../hooks/useApi'

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState('my-queues')
  const { data: userData, isLoading: isUserLoading, isError: isUserError, mutate: mutateUser } = useApi('/api/user/profile')
  const { data: currentQueues, isLoading: isCurrentQueuesLoading, isError: isCurrentQueuesError, mutate: mutateCurrentQueues } = useApi('/api/user/current-queues')
  const { data: pastQueues, isLoading: isPastQueuesLoading, isError: isPastQueuesError, mutate: mutatePastQueues } = useApi('/api/user/past-queues')
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!session) {
      router.push('/signin')
    }
  }, [session, router])

  const isLoading = isUserLoading || isCurrentQueuesLoading || isPastQueuesLoading
  const isError = isUserError || isCurrentQueuesError || isPastQueuesError

  useEffect(() => {
    if (isError) {
      toast.error('Failed to load data. Please try again.')
    }
  }, [isError])
  
  const handleSaveChanges = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })
      if (!response.ok) throw new Error('Failed to update profile')
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    }
  }
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        <Tabs selectedKey={activeTab} onSelectionChange={setActiveTab}>
          <Tab key="my-queues" title="My Queues">
            <Card className="dark:bg-gray-800">
              <CardHeader>
                <h2 className="text-xl font-semibold dark:text-white">Current Queues</h2>
              </CardHeader>
              <CardBody>
                {isLoading ? (
                  <Skeleton className="w-full h-40" />
                ) : currentQueues.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableColumn className="dark:text-gray-200">Queue Name</TableColumn>
                      <TableColumn className="dark:text-gray-200">Position</TableColumn>
                      <TableColumn className="dark:text-gray-200">Estimated Wait Time</TableColumn>
                      <TableColumn className="dark:text-gray-200">Actions</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {currentQueues.map((queue) => (
                        <TableRow key={queue.id} className="dark:bg-gray-800 dark:text-white">
                          <TableCell>{queue.name}</TableCell>
                          <TableCell>{queue.position}</TableCell>
                          <TableCell>{queue.estimatedWaitTime} min</TableCell>
                          <TableCell>
                            <Link href={`/user/queue/${queue.id}`} passHref>
                              <Button size="sm" className="dark:bg-gray-700 dark:text-white">View Details</Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="dark:text-gray-300">You are not currently in any queues.</p>
                )}
              </CardBody>
            </Card>
          </Tab>
          <Tab key="history" title="History">
            <Card className="dark:bg-gray-800">
              <CardHeader>
                <h2 className="text-xl font-semibold dark:text-white">Queue History</h2>
              </CardHeader>
              <CardBody>
                {isLoading ? (
                  <Skeleton className="w-full h-60" />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableColumn className="dark:text-gray-200">Queue Name</TableColumn>
                      <TableColumn className="dark:text-gray-200">Date</TableColumn>
                      <TableColumn className="dark:text-gray-200">Wait Time</TableColumn>
                      <TableColumn className="dark:text-gray-200">Rating</TableColumn>
                      <TableColumn className="dark:text-gray-200">Details</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {pastQueues.map((queue) => (
                        <TableRow key={queue.id} className="dark:bg-gray-800 dark:text-white">
                          <TableCell>{queue.name}</TableCell>
                          <TableCell>{queue.date}</TableCell>
                          <TableCell>{queue.waitTime} min</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                              <span>{queue.rating}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Link href={`/user/queue-history/${queue.id}`} passHref>
                              <Button size="sm" variant="bordered" className="dark:bg-gray-700 dark:text-white">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardBody>
            </Card>
          </Tab>
          <Tab key="profile" title="Profile Settings">
            <Card className="dark:bg-gray-800">
              <CardHeader>
                <h2 className="text-xl font-semibold dark:text-white">Profile Settings</h2>
              </CardHeader>
              <CardBody>
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-20 w-20 rounded-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <form onSubmit={handleSaveChanges} className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Avatar src={userData.image} name={userData.name} className="h-20 w-20" />
                      <Button className="dark:bg-gray-700 dark:text-white">Change Avatar</Button>
                    </div>
                    <div>
                      <label className="text-sm font-medium dark:text-gray-300">Name</label>
                      <input
                        type="text"
                        value={userData.name}
                        onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                        className="w-full mt-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium dark:text-gray-300">Phone Number</label>
                      <input
                        type="tel"
                        value={userData.phone_number}
                        onChange={(e) => setUserData({ ...userData, phone_number: e.target.value })}
                        className="w-full mt-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium dark:text-gray-300">Notification Preferences</label>
                      <div className="mt-2 space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={userData.emailNotifications}
                            onChange={(e) => setUserData({ ...userData, emailNotifications: e.target.checked })}
                            className="rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700"
                          />
                          <span className="ml-2 dark:text-gray-300">Email notifications</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={userData.pushNotifications}
                            onChange={(e) => setUserData({ ...userData, pushNotifications: e.target.checked })}
                            className="rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700"
                          />
                          <span className="ml-2 dark:text-gray-300">Push notifications</span>
                        </label>
                      </div>
                    </div>
                    <Button color="primary" type="submit" className="w-full dark:bg-blue-600 dark:hover:bg-blue-700">Save Changes</Button>
                  </form>
                )}
              </CardBody>
            </Card>
          </Tab>
        </Tabs>
      </main>
    </div>
  )
}