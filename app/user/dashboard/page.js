'use client'

import { useState, useEffect } from 'react'
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'
import { Clock, Star, Settings, History, LogOut, ExternalLink } from 'lucide-react'
import { Button, Card, CardBody, CardHeader, Avatar, Badge, Tabs, Tab, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Skeleton } from "@nextui-org/react"
import Link from 'next/link'
import { toast } from 'sonner'
export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState('my-queues')
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    image: ''
  });
  const [currentQueues, setCurrentQueues] = useState([])
  const [pastQueues, setPastQueues] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!session) {
      router.push('/signin')
    } else {
      fetchUserData()
      fetchCurrentQueues()
      fetchPastQueues()
    }
  }, [session, router])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (!response.ok) throw new Error('Failed to fetch user data')
      const data = await response.json()
      setUserData(data)
    } catch (error) {
      console.error('Error fetching user data:', error)
      toast.error('Failed to load user data')
    }
  }
  
  const fetchCurrentQueues = async () => {
    try {
      const response = await fetch('/api/user/current-queues')
      if (!response.ok) throw new Error('Failed to fetch current queues')
      const data = await response.json()
      setCurrentQueues(data)
    } catch (error) {
      console.error('Error fetching current queues:', error)
      toast.error('Failed to load current queues')
    }
  }
  
  const fetchPastQueues = async () => {
    try {
      const response = await fetch('/api/user/past-queues')
      if (!response.ok) throw new Error('Failed to fetch past queues')
      const data = await response.json()
      setPastQueues(data)
    } catch (error) {
      console.error('Error fetching past queues:', error)
      toast.error('Failed to load past queues')
    } finally {
      setIsLoading(false)
    }
  }
  
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
    <div className="min-h-screen bg-gray-50">

      <main className="container mx-auto px-4 py-8">
        <Tabs selectedKey={activeTab} onSelectionChange={setActiveTab}>
          <Tab key="my-queues" title="My Queues">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Current Queues</h2>
              </CardHeader>
              <CardBody>
                {currentQueues.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableColumn>Queue Name</TableColumn>
                      <TableColumn>Position</TableColumn>
                      <TableColumn>Estimated Wait Time</TableColumn>
                      <TableColumn>Actions</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {currentQueues.map((queue) => (
                        <TableRow key={queue.id}>
                          <TableCell>{queue.name}</TableCell>
                          <TableCell>{queue.position}</TableCell>
                          <TableCell>{queue.estimatedWaitTime} min</TableCell>
                          <TableCell>
                            <Button size="sm">View Details</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p>You are not currently in any queues.</p>
                )}
              </CardBody>
            </Card>
          </Tab>
          <Tab key="history" title="History">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Queue History</h2>
              </CardHeader>
              <CardBody>
                <Table>
                  <TableHeader>
                    <TableColumn>Queue Name</TableColumn>
                    <TableColumn>Date</TableColumn>
                    <TableColumn>Wait Time</TableColumn>
                    <TableColumn>Rating</TableColumn>
                    <TableColumn>Details</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {pastQueues.map((queue) => (
                      <TableRow key={queue.id}>
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
                            <Button size="sm" variant="bordered">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          </Tab>
          <Tab key="profile" title="Profile Settings">
  <Card>
    <CardHeader>
      <h2 className="text-xl font-semibold">Profile Settings</h2>
    </CardHeader>
    <CardBody>
      <form onSubmit={handleSaveChanges} className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar src={userData.image} name={userData.name} className="h-20 w-20" />
          <Button>Change Avatar</Button>
        </div>
        <div>
          <label className="text-sm font-medium">Name</label>
          <input
            type="text"
            value={userData.name}
            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
            className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            value={userData.email}
            onChange={(e) => setUserData({ ...userData, email: e.target.value })}
            className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Notification Preferences</label>
          <div className="mt-2 space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={userData.emailNotifications}
                onChange={(e) => setUserData({ ...userData, emailNotifications: e.target.checked })}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-2">Email notifications</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={userData.pushNotifications}
                onChange={(e) => setUserData({ ...userData, pushNotifications: e.target.checked })}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-2">Push notifications</span>
            </label>
          </div>
        </div>
        <Button color="primary" type="submit" className="w-full">Save Changes</Button>
      </form>
    </CardBody>
  </Card>
</Tab>
        </Tabs>
      </main>
    </div>
  )
}