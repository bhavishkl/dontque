'use client'

import { Card, CardBody, Chip } from "@nextui-org/react"
import { Calendar, MapPin, Clock } from 'lucide-react'

// Mock Data
const mockHistory = [
  {
    queue_id: 'q1',
    name: 'Dr. Smith Clinic',
    join_time: '2023-10-26T10:00:00Z',
    completion_time: '2023-10-26T10:45:00Z',
    status: 'completed',
    wait_time: 45
  },
  {
    queue_id: 'q2',
    name: 'Downtown Barber',
    join_time: '2023-10-25T14:30:00Z',
    completion_time: '2023-10-25T14:50:00Z',
    status: 'completed',
    wait_time: 20
  },
    {
    queue_id: 'q3',
    name: 'City Bank',
    join_time: '2023-10-24T09:00:00Z',
    completion_time: null,
    status: 'cancelled',
    wait_time: 10
  }
]

export default function QueueHistory() {
  return (
    <div className="min-h-screen p-4 pb-24 dark:bg-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-bold mb-6">History</h1>
      <div className="space-y-4">
        {mockHistory.map((item, index) => (
          <Card key={index} className="w-full">
            <CardBody>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <Chip
                  size="sm"
                  color={item.status === 'completed' ? 'success' : 'danger'}
                  variant="flat"
                >
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Chip>
              </div>

              <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(item.join_time).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(item.join_time).toLocaleTimeString()} - {item.completion_time ? new Date(item.completion_time).toLocaleTimeString() : 'Cancelled'}</span>
                </div>
                {item.wait_time && (
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Waited: {item.wait_time} mins</span>
                    </div>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  )
}
