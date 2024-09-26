import Image from 'next/image'
import { MapPin, Star, Heart, Share2, ClipboardCopy, Clock } from 'lucide-react'
import { Button, Chip, Skeleton } from "@nextui-org/react"
import { toast } from 'sonner'

const QueueInfoSec = ({ queueData, isLoading, handleShare }) => {
  return (
    <div className="space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <Skeleton isLoaded={!isLoading} className="rounded-lg mb-4">
        <div className="relative aspect-video rounded-lg overflow-hidden">
          <Image
            src={queueData?.image_url || 'https://via.placeholder.com/300x200'}
            alt={queueData?.name || 'Queue Image'}
            layout="fill"
            objectFit="cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
          <div className="absolute bottom-4 left-4 text-white">
            <h2 className="text-xl font-bold mb-1">{queueData?.name}</h2>
            <p className="text-sm flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {queueData?.location}
            </p>
          </div>
          <div className="absolute top-4 right-4 bg-yellow-500 dark:bg-yellow-700 rounded-full px-3 py-1 flex items-center">
            <Star className="w-4 h-4 text-white mr-1" />
            <span className="font-medium text-white">{queueData?.avg_rating || '5'}</span>
          </div>
          <div className="absolute bottom-4 right-4 flex gap-2">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="bg-white bg-opacity-20"
            >
              <Heart className="h-4 w-4 text-white" />
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="bg-white bg-opacity-20"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 text-white" />
            </Button>
          </div>
        </div>
      </Skeleton>
      <div className="space-y-4">
        <Skeleton isLoaded={!isLoading} className="mb-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Chip color="secondary" variant="flat" className="text-sm">{queueData?.category}</Chip>
            </div>
            <div className="flex flex-col items-end gap-2">
              {queueData?.short_id && (
                <Chip
                  variant="flat"
                  color="default"
                  className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white"
                >
                  <span className="mr-2">Queue ID: {queueData.short_id}</span>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onClick={() => {
                      navigator.clipboard.writeText(queueData.short_id);
                      toast.success('Queue ID copied');
                    }}
                  >
                    <ClipboardCopy className="h-4 w-4" />
                  </Button>
                </Chip>
              )}
            </div>
          </div>
        </Skeleton>
        <Skeleton isLoaded={!isLoading} className="mb-4">
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{queueData?.description}</p>
        </Skeleton>
        <Skeleton isLoaded={!isLoading}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <Clock className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
              <span>Open: {queueData?.opening_time} - {queueData?.closing_time}</span>
            </div>
          </div>
        </Skeleton>
      </div>
    </div>
  )
}

export default QueueInfoSec
