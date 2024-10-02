import { MapPin, Star, Heart, Share2, ClipboardCopy, Clock } from 'lucide-react'
import { Button, Chip, Skeleton, Card, CardBody, CardHeader, Divider } from "@nextui-org/react"
import { toast } from 'sonner'

const QueueInfoSec = ({ queueData, isLoading, handleShare }) => {
  return (
    <Card className="w-full dark:bg-gray-800">
      <Skeleton isLoaded={!isLoading} className="rounded-lg">
        <CardHeader className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold dark:text-white">{queueData?.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
              <MapPin className="w-4 h-4 mr-1" />
              {queueData?.location}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button isIconOnly size="sm" variant="light" className="text-red-500 dark:text-red-400">
              <Heart />
            </Button>
            <Button isIconOnly size="sm" variant="light" onClick={handleShare} className="text-blue-500 dark:text-blue-400">
              <Share2 />
            </Button>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center">
              <Star className="w-5 h-5 text-yellow-400 mr-2" />
              <span className="font-semibold dark:text-white">{queueData?.avg_rating || '5'}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">({queueData?.total_ratings || '0'} reviews)</span>
            </div>
            <div className="flex items-center justify-end">
              <Chip color="secondary" variant="flat">{queueData?.category}</Chip>
            </div>
          </div>
          
          <Divider className="my-4" />
          
          <p className="text-gray-600 dark:text-gray-300 mb-4">{queueData?.description}</p>
          
          <div className="flex items-center text-gray-600 dark:text-gray-300 mb-4">
            <Clock className="w-5 h-5 mr-2" />
            <span>Open: <strong>{queueData?.opening_time} - {queueData?.closing_time}</strong></span>
          </div>
          
          {queueData?.short_id && (
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg flex justify-between items-center">
              <span className="font-medium dark:text-gray-200">Queue ID: {queueData.short_id}</span>
              <Button
                size="sm"
                variant="flat"
                onClick={() => {
                  navigator.clipboard.writeText(queueData.short_id);
                  toast.success('Queue ID copied');
                }}
                className="bg-white dark:bg-gray-600 dark:text-gray-200"
              >
                <ClipboardCopy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>
          )}
        </CardBody>
      </Skeleton>
    </Card>
  )
}

export default QueueInfoSec