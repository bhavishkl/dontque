'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, MoreVertical } from 'lucide-react'
import { Input } from "@nextui-org/input"
import { Card, CardBody } from "@nextui-org/card"
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/dropdown"
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/table"
import { Skeleton } from "@nextui-org/skeleton"
import { Button } from "@nextui-org/button"
import { useRouter } from 'next/navigation'

export default function QueueTable({ 
  isLoading, 
  queues, 
  handleDeleteQueue, 
  handlePauseQueue 
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  const filteredQueues = queues ? queues.filter(queue => 
    queue.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) : []

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-semibold">Your Queues</h2>
        <div className="w-full sm:w-auto max-w-sm">
          <Input
            type="search"
            placeholder="Search queues..."
            startContent={<Search className="w-4 h-4 text-default-400" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      <Card className="bg-background/60 shadow-sm">
        <CardBody>
          <Table aria-label="Queues table" className="min-h-[400px]">
            <TableHeader>
              <TableColumn>QUEUE NAME</TableColumn>
              <TableColumn>CURRENT</TableColumn>
              <TableColumn>7-DAY AVG WAIT TIME</TableColumn>
              <TableColumn>SERVED TODAY</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>RATING</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill().map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-3/4" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-1/2" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-1/2" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-1/2" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-6 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-full" /></TableCell>
                  </TableRow>
                ))
              ) : (
                filteredQueues.map((queue) => (
                  <TableRow key={queue.queue_id} className="dark:bg-gray-800 dark:text-white">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {queue.name}
                        {queue.service_type === 'advanced' && (
                          <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-purple-400 rounded-full border border-purple-400/20">
                            PRO
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{queue.current_queue}</TableCell>
                    <TableCell>{queue.seven_day_avg_wait_time?.toFixed(1) || '0'} min</TableCell>
                    <TableCell>{queue.total_served}</TableCell>
                    <TableCell>
                      <div>
                        <div 
                          className={`w-2 h-2 rounded-full ${
                            queue.status === 'active' 
                              ? 'bg-success-500' 
                              : 'bg-warning-500'
                          }`}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400 text-lg">★</span>
                        <span className="text-sm text-default-600">
                          {queue.avg_rating?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link href={`/dashboard/manage/${queue.queue_id}`} className="inline-flex items-center justify-center gap-1 px-4 py-2 text-sm font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200">Manage</Link>
                        <Button 
                          size="sm" 
                          variant="bordered" 
                          className="w-24"
                          onClick={() => handlePauseQueue(queue.queue_id, queue.status)}
                        >
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
                            <DropdownItem>
                              <Link href={`/dashboard/analytics/${queue.queue_id}`}>View Analytics</Link>
                            </DropdownItem>
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
    </>
  )
} 