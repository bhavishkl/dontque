'use client'

import { Card, CardBody, Button, Chip } from "@nextui-org/react"
import { MapPin, Star, Clock, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

// Mock Data
const mockSavedQueues = [
    {
        queue_id: 'q1',
        name: 'Dr. Smith Clinic',
        category: 'Health',
        image_url: '/default.jpg',
        avg_rating: 4.5,
        address: '123 Health St',
        operating_hours: '09:00 - 17:00'
    },
    {
        queue_id: 'q3',
        name: 'Tasty Burger Joint',
        category: 'Food',
        image_url: '/default.jpg',
        avg_rating: 4.2,
        address: '456 Food Ave',
        operating_hours: '11:00 - 23:00'
    }
]

export default function SavedQueues() {
    const router = useRouter()

    return (
        <div className="min-h-screen p-4 pb-24 dark:bg-gray-900 dark:text-gray-100">
            <h1 className="text-2xl font-bold mb-6">Saved Queues</h1>

            {mockSavedQueues.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <p>No saved queues yet.</p>
                    <Button
                        color="primary"
                        variant="light"
                        className="mt-2"
                        onClick={() => router.push('/new/queues')}
                    >
                        Explore Queues
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mockSavedQueues.map((queue) => (
                        <Card key={queue.queue_id} className="w-full">
                            <CardBody className="p-0">
                                <div className="relative h-40">
                                    <Image
                                        src={queue.image_url}
                                        alt={queue.name}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute top-2 right-2">
                                        <Button isIconOnly size="sm" color="danger" variant="flat" className="bg-white/80 backdrop-blur">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <Chip
                                        size="sm"
                                        variant="flat"
                                        className="absolute top-2 left-2 bg-black/30 text-white backdrop-blur-md border-none"
                                    >
                                        {queue.category}
                                    </Chip>
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold text-lg">{queue.name}</h3>
                                        <div className="flex items-center gap-1 text-xs font-medium bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                                            <Star className="w-3 h-3 fill-current" />
                                            {queue.avg_rating}
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-3.5 h-3.5" />
                                            <span className="truncate">{queue.address}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>{queue.operating_hours}</span>
                                        </div>
                                    </div>
                                    <Button
                                        className="w-full mt-4"
                                        color="primary"
                                        variant="flat"
                                        onPress={() => router.push(`/new/queue/${queue.queue_id}`)}
                                    >
                                        View Details
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
