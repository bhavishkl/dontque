'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, Clock, TrendingUp, Settings, Play, Pause, MessageSquare, UserPlus, UserMinus, RefreshCw, Check, X } from 'lucide-react'
import { Button, Input, Card, CardBody, CardHeader, Chip, Switch, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react"

// Mock data for the specific queue
const queueData = {
  id: 1,
  name: 'Central Perk Coffee',
  status: 'active',
  currentQueue: 15,
  avgWaitTime: 20,
  totalServed: 150,
  estimatedServiceTime: 10,
}

const customersInQueue = [
  { id: 1, name: 'John Doe', position: 1, waitTime: 5 },
  { id: 2, name: 'Jane Smith', position: 2, waitTime: 10 },
  { id: 3, name: 'Bob Johnson', position: 3, waitTime: 15 },
  { id: 4, name: 'Alice Brown', position: 4, waitTime: 20 },
  { id: 5, name: 'Charlie Davis', position: 5, waitTime: 25 },
]

export default function QueueManagementPage() {
  const [isQueueActive, setIsQueueActive] = useState(queueData.status === 'active')
  const [serviceTime, setServiceTime] = useState(queueData.estimatedServiceTime.toString())

  const handleToggleQueue = () => {
    setIsQueueActive(!isQueueActive)
    // In a real application, you would update the backend here
  }

  const handleUpdateServiceTime = () => {
    // In a real application, you would update the backend here
    console.log('Updating service time to:', serviceTime)
  }

  const handleServed = (customerId) => {
    // In a real application, you would update the backend here
    console.log('Customer served:', customerId)
  }

  const handleNoShow = (customerId) => {
    // In a real application, you would update the backend here
    console.log('Customer no-show:', customerId)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 bg-white shadow-sm z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center text-blue-600">
            <ArrowLeft className="mr-2" />
            <span className="font-semibold">Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-bold">{queueData.name}</h1>
          <Button variant="bordered" startContent={<Settings />}>
            Queue Settings
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Queue Status and Controls */}
        <Card className="mb-8">
          <CardBody>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Chip color={isQueueActive ? "success" : "default"}>
                  {isQueueActive ? "Active" : "Paused"}
                </Chip>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={isQueueActive}
                    onChange={handleToggleQueue}
                  />
                  <span>
                    {isQueueActive ? "Pause Queue" : "Activate Queue"}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={serviceTime}
                    onChange={(e) => setServiceTime(e.target.value)}
                    className="w-20"
                  />
                  <span>min</span>
                </div>
                <Button onClick={handleUpdateServiceTime}>Update Service Time</Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Queue Statistics */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Current Queue</h3>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardBody>
              <div className="text-2xl font-bold">{queueData.currentQueue}</div>
            </CardBody>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Avg. Wait Time</h3>
              <Clock className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardBody>
              <div className="text-2xl font-bold">{queueData.avgWaitTime} min</div>
            </CardBody>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Total Served Today</h3>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardBody>
              <div className="text-2xl font-bold">{queueData.totalServed}</div>
            </CardBody>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Est. Service Time</h3>
              <RefreshCw className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardBody>
              <div className="text-2xl font-bold">{queueData.estimatedServiceTime} min</div>
            </CardBody>
          </Card>
        </div>

        {/* Queue Management Actions */}
        <div className="flex space-x-4 mb-8">
          <Button color="primary" startContent={<UserPlus />}>
            Add Customer
          </Button>
          <Button variant="bordered" startContent={<UserMinus />}>
            Remove Customer
          </Button>
          <Button variant="bordered" startContent={<MessageSquare />}>
            Notify All
          </Button>
        </div>

        {/* Customers in Queue */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Customers in Queue</h2>
          </CardHeader>
          <CardBody>
            <Table>
              <TableHeader>
                <TableColumn>Position</TableColumn>
                <TableColumn>Name</TableColumn>
                <TableColumn>Estimated Wait Time</TableColumn>
                <TableColumn>Actions</TableColumn>
              </TableHeader>
              <TableBody>
                {customersInQueue.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>{customer.position}</TableCell>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.waitTime} min</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="bordered" onClick={() => handleServed(customer.id)}>
                          <Check className="mr-1 h-4 w-4" />
                          Served
                        </Button>
                        <Button size="sm" variant="bordered" onClick={() => handleNoShow(customer.id)}>
                          <X className="mr-1 h-4 w-4" />
                          No Show
                        </Button>
                        <Button size="sm" variant="bordered">Notify</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </main>
    </div>
  )
}