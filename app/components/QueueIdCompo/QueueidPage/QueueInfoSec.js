import { MapPin, Star, Share2, Map, CheckCircle, Clock, Hash, Copy } from 'lucide-react'
import { Button, Chip, Skeleton, Card, CardBody, Badge, Tooltip } from "@nextui-org/react"
import Image from 'next/image'
import { useState } from 'react'
import SaveButton from '@/app/components/UniComp/SaveButton';
import { toast } from 'sonner'

const QueueInfoSec = ({ queueData, isLoading, handleShare }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showMap, setShowMap] = useState(false);

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
    <Card className="w-full dark:bg-gray-800">
      <Skeleton isLoaded={!isLoading} className="rounded-lg">
        <div className="relative h-48 overflow-hidden rounded-t-xl">
          <Image
            src={queueData?.image_url || '/default.jpg'}
            alt={queueData?.name}
            layout="fill"
            objectFit="cover"
            className="transition-transform hover:scale-105 duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
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

        <CardBody className="space-y-6">
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
              <Chip
                variant="flat"
                color="primary"
                size="sm"
              >
                {queueData?.category || 'General'}
              </Chip>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
              <MapPin className="w-4 h-4 mr-1" />
              {queueData?.location}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <StatsCard
              icon={<Star className="h-5 w-5 text-yellow-400" />}
              value={queueData?.rating?.toFixed(1) || 'N/A'}
              label={`${queueData?.total_reviews || '0'} reviews`}
            />
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Hash className="h-5 w-5 text-blue-500" />
                  <span className="text-lg font-semibold">{queueData?.short_id || 'N/A'}</span>
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

          <div className="space-y-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Queue Details</h3>
              <Clock className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="grid gap-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Service Start</span>
                <span className="font-medium">{formatTime(queueData?.service_start_time)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Operating Hours</span>
                <span className="font-medium">
                  {queueData?.opening_time && queueData?.closing_time ? (
                    `${formatTime(queueData.opening_time)} - ${formatTime(queueData.closing_time)}`
                  ) : (
                    'Hours not specified'
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Service Time</span>
                <span className="font-medium">{queueData?.est_time_to_serve || '0'} min/person</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Max Capacity</span>
                <span className="font-medium">{queueData?.max_capacity || 'Unlimited'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">About</h3>
            <p className={`text-gray-600 dark:text-gray-300 ${!showFullDescription && 'line-clamp-3'}`}>
              {queueData?.description}
            </p>
            {queueData?.description?.length > 150 && (
              <Button
                variant="light"
                size="sm"
                onClick={() => setShowFullDescription(!showFullDescription)}
              >
                {showFullDescription ? 'Show Less' : 'Read More'}
              </Button>
            )}
          </div>

          {queueData?.features?.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Features</h3>
              <div className="flex flex-wrap gap-2">
                {queueData?.features?.map((feature, index) => (
                  <Chip key={index} variant="flat" size="sm">
                    {feature}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          <Button
            variant="bordered"
            className="w-full"
            onClick={() => setShowMap(!showMap)}
            startContent={<Map className="h-4 w-4" />}
          >
            {showMap ? 'Hide Map' : 'Show Map'}
          </Button>

          {showMap && (
            <div className="h-48 rounded-lg overflow-hidden">
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&q=${encodeURIComponent(queueData?.location)}`}
                allowFullScreen
              />
            </div>
          )}
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