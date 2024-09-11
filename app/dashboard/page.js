'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Users, Clock, Settings, Plus, Search, MoreVertical, PieChart } from 'lucide-react'
import { Button, Input, Card, CardBody, CardHeader, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Progress, Chip, Skeleton } from "@nextui-org/react"
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'

export default function QueueOwnerDashboard() {
  const [queuesData, setQueuesData] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      fetchQueuesData()
    } else {
      router.push('/login')
    }
  }, [session, router])

  const fetchQueuesData = async () => {
    try {
      const response = await fetch('/api/queues/owner')
      if (!response.ok) {
        throw new Error('Failed to fetch queues')
      }
      const data = await response.json()
      setQueuesData(data)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching queues:', error)
      setIsLoading(false)
    }
  }

  const filteredQueues = queuesData.filter(queue => 
    queue.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const overallStats = {
    totalQueues: queuesData.length,
    totalCustomers: queuesData.reduce((sum, queue) => sum + queue.current_queue, 0),
    avgWaitTime: Math.round(queuesData.reduce((sum, queue) => sum + queue.avg_wait_time, 0) / queuesData.length),
  }

  const handleDeleteQueue = async (queueId) => {
    if (window.confirm('Are you sure you want to delete this queue?')) {
      try {
        const response = await fetch(`/api/queues/${queueId}`, {
          method: 'DELETE',
        })
        if (!response.ok) {
          throw new Error('Failed to delete queue')
        }
        fetchQueuesData()
      } catch (error) {
        console.error('Error deleting queue:', error)
      }
    }
  }

  const handlePauseQueue = async (queueId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active'
    try {
      const response = await fetch(`/api/queues/${queueId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!response.ok) {
        throw new Error('Failed to update queue status')
      }
      fetchQueuesData()
    } catch (error) {
      console.error('Error updating queue status:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 bg-white shadow-sm z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Queue Owner Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Button variant="bordered" startContent={<Settings />}>
              Settings
            </Button>
            <Link href="/dashboard/create-queue">
              <Button color="primary" startContent={<Plus />}>
                Create New Queue
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {isLoading ? (
            <>
              <Skeleton className="h-24 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
            </>
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium">Total Queues</h3>
                  <PieChart className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardBody>
                  <div className="text-2xl font-bold">{overallStats.totalQueues}</div>
                </CardBody>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium">Total Customers in Queue</h3>
                  <Users className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardBody>
                  <div className="text-2xl font-bold">{overallStats.totalCustomers}</div>
                </CardBody>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium">Average Wait Time</h3>
                  <Clock className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardBody>
                  <div className="text-2xl font-bold">{overallStats.avgWaitTime} min</div>
                </CardBody>
              </Card>
            </>
          )}
        </div>

        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Your Queues</h2>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Search queues..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardBody>
            <Table>
              <TableHeader>
                <TableColumn>Queue Name</TableColumn>
                <TableColumn>Current Queue</TableColumn>
                <TableColumn>Avg. Wait Time</TableColumn>
                <TableColumn>Total Served Today</TableColumn>
                <TableColumn>Status</TableColumn>
                <TableColumn>Actions</TableColumn>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill().map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-3/4" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-1/2" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-1/2" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-1/2" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  filteredQueues.map((queue) => (
                    <TableRow key={queue.queue_id}>
                      <TableCell>{queue.name}</TableCell>
                      <TableCell>{queue.current_queue}</TableCell>
                      <TableCell>{queue.avg_wait_time} min</TableCell>
                      <TableCell>{queue.total_served}</TableCell>
                      <TableCell>
                        <Chip color={queue.status === 'active' ? 'success' : 'warning'}>
                          {queue.status}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={() => router.push(`/dashboard/manage/${queue.queue_id}`)}>Manage Queue</Button>
                          <Button size="sm" variant="bordered" onClick={() => handlePauseQueue(queue.queue_id, queue.status)}>
                            {queue.status === 'active' ? 'Pause' : 'Activate'}
                          </Button>
                          <Dropdown>
                            <DropdownTrigger>
                              <Button isIconOnly variant="light" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="More Actions">
                              <DropdownItem onClick={() => router.push(`/dashboard/edit-queue/${queue.queue_id}`)}>Edit Queue</DropdownItem>
                              <DropdownItem className="text-danger" color="danger" onClick={() => handleDeleteQueue(queue.queue_id)}>Delete Queue</DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </main>
    </div>
  )
}