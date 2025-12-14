'use client'

import UserQueueCard from '@/app/components/UserQueueCard'

const mockCurrentQueues = [
  {
    id: 'cq1',
    name: 'City Bank',
    location: 'Main Street',
    position: 3,
    estimatedWaitTime: 10,
    join_time: new Date(Date.now() - 30 * 60000).toISOString(),
    service_type: 'regular'
  },
  {
    id: 'cq2',
    name: 'Tech Support',
    location: 'Online',
    position: 12,
    estimatedWaitTime: 45,
    join_time: new Date(Date.now() - 10 * 60000).toISOString(),
    service_type: 'advanced'
  }
];

export default function CurrentQueues() {
  return (
    <div className="min-h-screen p-4 pb-24 dark:bg-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-bold mb-6">Current Queues</h1>
      <div className="space-y-4">
        {mockCurrentQueues.map((queue) => (
          <UserQueueCard key={queue.id} queue={queue} />
        ))}
      </div>
    </div>
  )
}
