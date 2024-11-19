import { MapPin, Star, Heart, Share2, ClipboardCopy, Clock, Map, CheckCircle, Users } from 'lucide-react'
import { Button, Chip, Skeleton, Card, CardBody, CardHeader, Divider, Badge, Tooltip } from "@nextui-org/react"
import Image from 'next/image'
import { useState } from 'react'

const QueueInfoSec = ({ queueData, isLoading, handleShare, handleFavorite }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showMap, setShowMap] = useState(false);

  return (
    <Card className="w-full dark:bg-gray-800">
      <Skeleton isLoaded={!isLoading} className="rounded-lg">
        <div className="relative h-48 overflow-hidden rounded-t-xl">
          <Image
            src={queueData?.image_url || '/default-queue.jpg'}
            alt={queueData?.name}
            layout="fill"
            objectFit="cover"
            className="transition-transform hover:scale-105 duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          <div className="absolute top-4 left-4">
            <Chip
              color={queueData?.status === 'active' ? 'success' : 'warning'}
              variant="shadow"
              startContent={<div className="animate-pulse w-2 h-2 rounded-full bg-current" />}
            >
              {queueData?.status === 'active' ? 'Open Now' : 'Closed'}
            </Chip>
          </div>

          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              isIconOnly
              variant="flat"
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
              onClick={handleFavorite}
            >
              <Heart className={`h-5 w-5 ${queueData?.isFavorited ? 'fill-red-500 text-red-500' : 'text-white'}`} />
            </Button>
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

        <CardBody className="space-y-4">
          <div>
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
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
              <MapPin className="w-4 h-4 mr-1" />
              {queueData?.location}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <StatsCard
              icon={<Star className="h-5 w-5 text-yellow-400" />}
              value={queueData?.avg_rating?.toFixed(1) || '4.5'}
              label={`${queueData?.total_ratings || '0'} reviews`}
            />
            <StatsCard
              icon={<Clock className="h-5 w-5 text-blue-500" />}
              value={`${queueData?.avg_wait_time || '0'} min`}
              label="avg. wait"
            />
            <StatsCard
              icon={<Users className="h-5 w-5 text-green-500" />}
              value={queueData?.current_queue || '0'}
              label="in queue"
            />
          </div>

          <Divider />
          <div className="space-y-2">
            <h3 className="font-semibold">Operating Hours</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {queueData?.operating_hours?.map((hours, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-500">{hours.day}</span>
                  <span>{hours.hours}</span>
                </div>
              ))}
            </div>
          </div>

          <Divider />
          <div>
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

          <div className="flex flex-wrap gap-2">
            {queueData?.features?.map((feature, index) => (
              <Chip key={index} variant="flat" size="sm">
                {feature}
              </Chip>
            ))}
          </div>

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