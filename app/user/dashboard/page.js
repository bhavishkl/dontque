'use client'

import { useState } from 'react'
import { Clock, Star, Settings, History, LogOut, ExternalLink } from 'lucide-react'
import { Button, Card, CardBody, CardHeader, Avatar, Badge, Tabs, Tab, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react"
import Header from '../../components/UserLayout/header'
import Link from 'next/link'

// Mock data for current queues
const currentQueues = [
  { id: 1, name: 'Central Perk Coffee', position: 3, estimatedWaitTime: 15 },
  { id: 2, name: 'DMV Services', position: 12, estimatedWaitTime: 45 },
]

// Mock data for past queues
const pastQueues = [
  { id: 3, name: 'Apple Store Genius Bar', date: '2023-06-10', waitTime: 25, rating: 4 },
  { id: 4, name: 'Smithsonian Museum', date: '2023-06-05', waitTime: 20, rating: 5 },
  { id: 5, name: 'City Hospital ER', date: '2023-05-28', waitTime: 40, rating: 3 },
]

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState('my-queues')

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

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
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar src={userData.image} name={userData.name} className="h-20 w-20" />
                    <Button>Change Avatar</Button>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <input
                      type="text"
                      value={userData.name}
                      className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <input
                      type="email"
                      value={userData.email}
                      className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Notification Preferences</label>
                    <div className="mt-2 space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                        <span className="ml-2">Email notifications</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                        <span className="ml-2">Push notifications</span>
                      </label>
                    </div>
                  </div>
                  <Button color="primary" className="w-full">Save Changes</Button>
                </div>
              </CardBody>
            </Card>
          </Tab>
        </Tabs>
      </main>
    </div>
  )
}