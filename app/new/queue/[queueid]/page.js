'use client'

import { Card, CardBody, Button, Chip, Divider } from "@nextui-org/react"
import { MapPin, Clock, Star, Phone, Globe, Share2, Heart, Users } from 'lucide-react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useState } from "react"

// Mock Data (simulating fetching based on ID)
const getMockQueueDetails = (id) => ({
    queue_id: id,
    name: 'Dr. Smith Clinic',
    category: 'Health',
    description: 'Expert general practitioner with 20 years of experience. We provide comprehensive healthcare services for all ages.',
    image_url: '/default.jpg',
    avg_rating: 4.5,
    rating_count: 120,
    operating_hours: '09:00 AM - 05:00 PM',
    current_queue_count: 12,
    total_estimated_wait_time: 45,
    address: '123 Health St, Medical District',
    phone: '+1 234 567 8900',
    website: 'https://example.com',
    services: [
        { name: 'General Consultation', duration: 15, price: 50 },
        { name: 'Check-up', duration: 30, price: 80 }
    ],
    is_open: true
});

export default function QueueDetails() {
  const params = useParams()
  const router = useRouter()
  const [isJoined, setIsJoined] = useState(false)

  const queue = getMockQueueDetails(params.queueid)

  const handleJoinQueue = () => {
    setIsJoined(true)
    // In a real app, you'd call an API here
  }

  return (
    <div className="min-h-screen pb-24 dark:bg-gray-900 dark:text-gray-100">
        {/* Header Image */}
        <div className="relative h-64 md:h-80 w-full">
            <Image
                src={queue.image_url}
                alt={queue.name}
                fill
                className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="container mx-auto">
                    <Chip color="primary" variant="solid" className="mb-2">
                        {queue.category}
                    </Chip>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">{queue.name}</h1>
                    <div className="flex items-center gap-4 text-sm md:text-base">
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="font-semibold">{queue.avg_rating}</span>
                            <span className="opacity-80">({queue.rating_count} reviews)</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{queue.address}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="container mx-auto px-4 py-6 grid md:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
                {/* Status Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <Card>
                        <CardBody className="flex flex-row items-center gap-4 p-4">
                            <div className="p-3 bg-orange-100 text-orange-600 rounded-full">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">In Queue</p>
                                <p className="text-xl font-bold">{queue.current_queue_count}</p>
                            </div>
                        </CardBody>
                    </Card>
                    <Card>
                        <CardBody className="flex flex-row items-center gap-4 p-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Est. Wait</p>
                                <p className="text-xl font-bold">{queue.total_estimated_wait_time} min</p>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* About */}
                <section>
                    <h2 className="text-xl font-bold mb-3">About</h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {queue.description}
                    </p>
                </section>

                {/* Services */}
                <section>
                    <h2 className="text-xl font-bold mb-3">Services</h2>
                    <div className="space-y-3">
                        {queue.services.map((service, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 border rounded-lg dark:border-gray-700">
                                <div>
                                    <p className="font-medium">{service.name}</p>
                                    <p className="text-sm text-gray-500">{service.duration} mins</p>
                                </div>
                                <p className="font-semibold">${service.price}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Sidebar Actions */}
            <div className="space-y-6">
                <Card className="sticky top-6">
                    <CardBody className="space-y-4 p-6">
                        <div className="flex items-center justify-between text-sm">
                             <span className={queue.is_open ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                                {queue.is_open ? 'Open Now' : 'Closed'}
                             </span>
                             <span className="text-gray-500">{queue.operating_hours}</span>
                        </div>

                        {isJoined ? (
                            <div className="bg-green-50 text-green-700 p-4 rounded-lg text-center">
                                <p className="font-bold">You are in the queue!</p>
                                <Button
                                    className="mt-2 w-full"
                                    variant="bordered"
                                    color="success"
                                    onClick={() => router.push('/new/current-queues')}
                                >
                                    View Status
                                </Button>
                            </div>
                        ) : (
                            <Button
                                size="lg"
                                color="primary"
                                className="w-full font-bold shadow-lg shadow-orange-500/30"
                                onClick={handleJoinQueue}
                                isDisabled={!queue.is_open}
                            >
                                Join Queue
                            </Button>
                        )}

                        <Divider />

                        <div className="space-y-3">
                            <Button variant="light" startContent={<Phone className="w-4 h-4" />} className="w-full justify-start">
                                Call Now
                            </Button>
                            <Button variant="light" startContent={<Globe className="w-4 h-4" />} className="w-full justify-start">
                                Visit Website
                            </Button>
                            <Button variant="light" startContent={<Share2 className="w-4 h-4" />} className="w-full justify-start">
                                Share
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    </div>
  )
}
