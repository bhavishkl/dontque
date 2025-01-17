'use client'

import { Button, Chip } from "@nextui-org/react"
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Star, MapPin, Share2, Clock, Users, ChevronRight } from 'lucide-react'
import SaveButton from './SaveButton'
import { categories } from '@/app/utils/category'

export default function QueueItem({ queue }) {
  const router = useRouter();
  const { icon } = categories.find(cat => cat.name === queue.category) || { icon: '🏢' };

  return (
    <div 
      className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary-100/50 dark:hover:shadow-primary-900/10"
      style={{ width: '320px' }}
    >
      {/* Image Container */}
      <div className="relative h-40">
        <Image
          src={queue.image_url || '/default.jpg'}
          alt={queue.name}
          width={400}
          height={200}
          className="w-full h-full object-cover brightness-[0.97]"
        />
        {/* Category Chip */}
        <div className="absolute top-3 left-3">
          <Chip
            className="bg-white/90 backdrop-blur-sm border-none text-gray-700 dark:bg-gray-900/90 dark:text-white"
            startContent={<span className="text-base">{icon}</span>}
          >
            {queue.category || 'General'}
          </Chip>
        </div>

        {/* Rating Badge */}
        {queue.avg_rating && (
          <div className="absolute top-3 right-3">
            <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg dark:bg-gray-900/90">
              <Star className="h-3.5 w-3.5 text-yellow-500 fill-current" />
              <span className="text-sm font-medium text-gray-700 dark:text-white">
                {queue.avg_rating.toFixed(1)}
              </span>
            </div>
          </div>
        )}

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
            <SaveButton 
              queueId={queue.queue_id}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full p-2"
            />
            <div className="flex gap-2">
              <Button
                isIconOnly
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full p-2"
                onClick={() => window.open(
                  `https://maps.app.goo.gl/uYAVo2VP4Gz3B9FK6?q`,
                  '_blank'
                )}
              >
                <MapPin className="h-4 w-4" />
              </Button>
              <Button
                isIconOnly
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full p-2"
                onClick={() => {
                  navigator.share({
                    title: queue.name,
                    text: `Check out ${queue.name} on DontQ!`,
                    url: `/user/queue/${queue.queue_id}`
                  });
                }}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start gap-4 mb-4">
          {/* Left side - Name and Hours */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold mb-2 line-clamp-1 text-gray-900 dark:text-gray-100">
              {queue.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="h-4 w-4 shrink-0" />
              <span className="truncate">{queue.operating_hours || 'Hours not available'}</span>
            </div>
          </div>

          {/* Right side - Stats */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            {/* Queue Count */}
            <div className="flex items-center gap-1.5 bg-gray-100/80 dark:bg-gray-700/50 px-2 py-1 rounded-lg">
              <Users className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{queue.current_queue_count || 0}</span>
            </div>

            {/* Wait Time */}
            {queue.total_estimated_wait_time > 0 && (
              <div className="flex items-center gap-1.5 bg-gray-100/80 dark:bg-gray-700/50 px-2 py-1 rounded-lg">
                <Clock className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">~{Math.round(queue.total_estimated_wait_time)}m</span>
              </div>
            )}

            {/* High Demand Badge */}
            {queue.capacity_percentage > 80 && (
              <div className="flex items-center gap-1.5 bg-red-100/80 dark:bg-red-900/30 px-2 py-1 rounded-lg">
                <span className="text-xs font-medium text-red-600 dark:text-red-400">High Demand</span>
              </div>
            )}
          </div>
        </div>

        {/* View Button */}
        <Button
          className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
          onClick={() => router.push(`/user/queue/${queue.queue_id}`)}
        >
          View Details
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 