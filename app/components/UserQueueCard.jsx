import React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardBody, CardHeader, Chip, Button } from '@nextui-org/react'
import { MapPin, Calendar, Clock, ChevronRight } from 'lucide-react'

function formatJoinTime(joinTime) {
	if (!joinTime) return '—'
	const now = new Date()
	const join = new Date(joinTime)
	const diffInMinutes = Math.floor((now - join) / (1000 * 60))
	if (diffInMinutes < 60) return `${diffInMinutes} min ago`
	if (diffInMinutes < 1440) {
		const hours = Math.floor(diffInMinutes / 60)
		return `${hours} hr${hours > 1 ? 's' : ''} ago`
	}
	const days = Math.floor(diffInMinutes / 1440)
	return `${days} day${days > 1 ? 's' : ''} ago`
}

export default function UserQueueCard({ queue }) {
	const router = useRouter()

	const handleViewDetails = () => {
		router.push(`/user/queue/${queue.id}`)
	}

	return (
		<Card 
			className="bg-background/60 shadow-sm hover:shadow-md transition-all duration-200 border border-divider/50 hover:border-divider"
		>
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between w-full">
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2 mb-2">
							<h3 className="text-lg font-semibold text-default-900 truncate">
								{queue.name}
							</h3>
							{queue.category && (
								<Chip size="sm" variant="flat" color="secondary" className="text-xs">
									{queue.category}
								</Chip>
							)}
						</div>
						<div className="flex items-center gap-2 text-sm text-default-500">
							<MapPin className="w-3 h-3" />
							<span className="truncate">{queue.location || 'Location not specified'}</span>
						</div>
					</div>
				</div>
			</CardHeader>
			
			<CardBody className="pt-0">
				<div className="grid grid-cols-2 gap-3 mb-4 mt-2">
					<div className="text-center p-3 bg-default-50 rounded-lg">
						<div className="text-lg font-bold text-primary">
							{queue.estimatedWaitTime || 0}
						</div>
						<div className="text-xs text-default-500">Est. Wait (min)</div>
					</div>
					<div className="text-center p-3 bg-default-50 rounded-lg">
						<div className="text-lg font-bold text-secondary">
							#{queue.position}
						</div>
						<div className="text-xs text-default-500">Your Position</div>
					</div>
				</div>

				<div className="space-y-2 mb-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Clock className="w-3 h-3 text-default-400" />
							<span className="text-xs text-default-600">Operating Hours</span>
						</div>
						<span className="text-xs text-default-500">
							{queue.operating_hours || 'Not available'}
						</span>
					</div>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Calendar className="w-3 h-3 text-default-400" />
							<span className="text-xs text-default-600">Joined</span>
						</div>
						<span className="text-xs text-default-500">
							{formatJoinTime(queue.join_time)}
						</span>
					</div>
				</div>

				<div className="flex gap-2">
					<Button 
						color="primary" 
						variant="flat" 
						size="sm" 
						className="flex-1"
						endContent={<ChevronRight className="w-3 h-3" />}
						onClick={handleViewDetails}
					>
						View Details
					</Button>
					<Button 
						size="sm" 
						variant="bordered"
						className="text-xs"
					>
						Leave Queue
					</Button>
				</div>
			</CardBody>
		</Card>
	)
}