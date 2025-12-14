'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button, Card, CardBody, Input, Select, SelectItem, Spinner, Chip, Pagination } from "@nextui-org/react"
import { Search, MapPin, Star, Filter, Clock, Users } from 'lucide-react'
import Image from 'next/image'
import { categories } from '../../utils/category'
import SearchBar from '@/app/components/SearchBar'

const mockQueues = Array(10).fill(null).map((_, i) => ({
    queue_id: `q${i}`,
    name: `Queue ${i + 1}`,
    category: categories[i % categories.length].name,
    image_url: '/default.jpg',
    avg_rating: (3 + Math.random() * 2).toFixed(1),
    operating_hours: '09:00 AM - 05:00 PM',
    current_queue_count: Math.floor(Math.random() * 20),
    total_estimated_wait_time: Math.floor(Math.random() * 60),
    distance: (Math.random() * 10).toFixed(1),
    address: '123 Main St, New York, NY'
}));

export default function QueuesPage() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All')
    const [sortBy, setSortBy] = useState('distance')
    const [page, setPage] = useState(1)

    const isLoading = false;
    const queues = mockQueues;
    const totalPages = 5;

    const handleSearch = (value) => {
        setSearchQuery(value)
        setPage(1)
    }

    const handleCategoryChange = (category) => {
        setSelectedCategory(category)
        setPage(1)
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
                <div className="container mx-auto px-4 py-4 space-y-4">
                    <SearchBar
                        initialValue={searchQuery}
                        onSearch={handleSearch}
                        placeholder="Search for queues..."
                    />

                    {/* Filters */}
                    <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
                        <Button
                            size="sm"
                            variant={selectedCategory === 'All' ? 'solid' : 'bordered'}
                            color={selectedCategory === 'All' ? 'primary' : 'default'}
                            onPress={() => handleCategoryChange('All')}
                            className="min-w-fit"
                        >
                            All
                        </Button>
                        {categories.map((cat) => (
                            <Button
                                key={cat.name}
                                size="sm"
                                variant={selectedCategory === cat.name ? 'solid' : 'bordered'}
                                color={selectedCategory === cat.name ? 'primary' : 'default'}
                                onPress={() => handleCategoryChange(cat.name)}
                                startContent={<span>{cat.icon}</span>}
                                className="min-w-fit"
                            >
                                {cat.name}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Queue List */}
            <div className="container mx-auto px-4 py-6">
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Spinner size="lg" color="primary" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {queues.map((queue) => (
                            <Card
                                key={queue.queue_id}
                                isPressable
                                onPress={() => router.push(`/new/queue/${queue.queue_id}`)}
                                className="w-full hover:scale-[1.02] transition-transform duration-200"
                            >
                                <CardBody className="p-3">
                                    <div className="flex gap-4">
                                        <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                                            <Image
                                                src={queue.image_url || '/default.jpg'}
                                                alt={queue.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start gap-2">
                                                    <h3 className="font-semibold text-lg line-clamp-1">{queue.name}</h3>
                                                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs font-medium">
                                                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                        {queue.avg_rating}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 flex items-center gap-1 mt-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {queue.address || '2.5 km away'}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-4 mt-2">
                                                <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                                                    <Users className="w-3.5 h-3.5" />
                                                    <span>{queue.current_queue_count} in queue</span>
                                                </div>
                                                {queue.total_estimated_wait_time > 0 && (
                                                    <div className="flex items-center gap-1.5 text-xs text-orange-600 dark:text-orange-400 font-medium">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        <span>~{queue.total_estimated_wait_time} min wait</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                <div className="flex justify-center mt-8 pb-20">
                    <Pagination
                        total={totalPages}
                        initialPage={1}
                        page={page}
                        onChange={setPage}
                        color="primary"
                    />
                </div>
            </div>
        </div>
    )
}
