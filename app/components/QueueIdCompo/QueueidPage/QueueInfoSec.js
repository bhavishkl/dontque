import { MapPin, Star, Share2, Map, CheckCircle, Clock, Hash, Copy } from 'lucide-react'
import { Button, Chip, Skeleton, Card, CardBody, Badge, Tooltip } from "@nextui-org/react"
import Image from 'next/image'
import { useState } from 'react'
import SaveButton from '@/app/components/UniComp/SaveButton';
import { toast } from 'sonner'

const QueueInfoSec = ({ queueData, isLoading, handleShare }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  const handleCopyId = () => {
    navigator.clipboard.writeText(queueData?.short_id);
    toast.success('Queue ID copied to clipboard');
  };

  // Helper function to format time
  const formatTime = (timeStr) => {
    if (!timeStr) return 'Not specified';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}${minutes !== '00' ? ':' + minutes : ''} ${period}`;
  };

  return (
    <Card className="w-full dark:bg-gray-800 shadow-md">
      <Skeleton isLoaded={!isLoading} className="rounded-lg">
        <div className="relative h-56 overflow-hidden rounded-t-xl">
          <Image
            src={queueData?.image_url || '/default.jpg'}
            alt={queueData?.name}
            layout="fill"
            objectFit="cover"
            className="transition-transform hover:scale-105 duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          
          <div className="absolute bottom-4 left-4">
            <Chip
              variant="flat"
              size="sm"
              className="backdrop-blur-md bg-black/30 text-white font-medium border border-white/20"
            >
              {queueData?.category || 'General'}
            </Chip>
          </div>
          
          <div className="absolute top-4 right-4 flex gap-2">
            <SaveButton queueId={queueData?.queue_id} />
            <Button
              isIconOnly
              variant="flat"
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
              onClick={handleShare}
            >
              <Share2 className="h-5 w-5 text-white" />
            </Button>
          </div>
        </div>

        <CardBody className="space-y-6 px-4 sm:px-6">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                {queueData?.name}
                {queueData?.verified && (
                  <Tooltip content="Verified Business">
                    <Badge variant="flat" color="primary">
                      <CheckCircle className="h-4 w-4" />
                    </Badge>
                  </Tooltip>
                )}
              </h2>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="truncate">{queueData?.location}</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-start mt-1">
              <Map className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">{queueData?.address || 'Address not available'}</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
              <Clock className="w-4 h-4 mr-1 flex-shrink-0" />
              <span>
                {queueData?.opening_time || queueData?.closing_time
                  ? `${formatTime(queueData?.opening_time)} - ${formatTime(queueData?.closing_time)}`
                  : (queueData?.operating_hours || 'Hours not available')}
              </span>
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <StatsCard
              icon={<Star className="h-5 w-5 text-yellow-400" />}
              value={queueData?.avg_rating || '0'}
              label={`${queueData?.total_reviews || '0'} reviews`}
            />
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Hash className="h-5 w-5 text-blue-500" />
                  <span className="text-lg font-semibold truncate">{queueData?.short_id || 'N/A'}</span>
                </div>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onClick={handleCopyId}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Queue ID</p>
            </div>
          </div>
        </CardBody>
      </Skeleton>
    </Card>
  )
}

const StatsCard = ({ icon, value, label }) => (
  <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-lg font-semibold">{value}</span>
    </div>
    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
  </div>
);

export default QueueInfoSec
