import React from 'react'
import Link from 'next/link'
import { Card, CardBody, CardHeader, Badge, Progress, Chip, Button } from '@nextui-org/react'
import { MapPin, Calendar, Clock, ChevronRight } from 'lucide-react'

function getWaitTimeStatus(estimatedWaitTime) {
	const wait = estimatedWaitTime || 0
	if (wait <= 5) return { color: 'success', text: 'Almost there!' }
	if (wait <= 15) return { color: 'warning', text: 'Getting closer' }
	return { color: 'default', text: 'Please be patient' }
}

function getPositionStatus(position) {
	const pos = position || 0
	if (pos <= 3) return { color: 'success', text: 'Next up!' }
	if (pos <= 10) return { color: 'warning', text: 'Getting close' }
	return { color: 'default', text: 'In queue' }
}

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
	const waitTimeStatus = getWaitTimeStatus(queue.estimatedWaitTime)
	const positionStatus = getPositionStatus(queue.position)

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
							{queue.service_type === 'advanced' && (
								<Chip size="sm" variant="flat" color="secondary" className="text-xs">
									PRO
								</Chip>
							)}
						</div>
						<div className="flex items-center gap-2 text-sm text-default-500">
							<MapPin className="w-3 h-3" />
							<span className="truncate">{queue.location || 'Location not specified'}</span>
						</div>
					</div>
					<Badge 
						color={positionStatus.color} 
						variant="flat" 
						className="text-xs font-medium"
					>
						#{queue.position}
					</Badge>
				</div>
			</CardHeader>
			
			<CardBody className="pt-0">
				<div className="mb-4">
					<div className="flex items-center justify-between mb-2">
						<span className="text-sm text-default-600">Queue Progress</span>
						<span className="text-xs text-default-500">{positionStatus.text}</span>
					</div>
					<Progress 
						value={Math.max(0, 100 - ((queue.position || 0) * 10))} 
						color={positionStatus.color}
						className="h-2"
					/>
				</div>

				<div className="grid grid-cols-2 gap-3 mb-4">
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
							<Calendar className="w-3 h-3 text-default-400" />
							<span className="text-xs text-default-600">Joined</span>
						</div>
						<span className="text-xs text-default-500">
							{formatJoinTime(queue.join_time)}
						</span>
					</div>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Clock className="w-3 h-3 text-default-400" />
							<span className="text-xs text-default-600">Wait Status</span>
						</div>
						<Chip 
							size="sm" 
							variant="flat" 
							color={waitTimeStatus.color}
							className="text-xs"
						>
							{waitTimeStatus.text}
						</Chip>
					</div>
				</div>

				<div className="flex gap-2">
					<Link href={`/user/queue/${queue.id}`} className="flex-1">
						<Button 
							color="primary" 
							variant="flat" 
							size="sm" 
							className="w-full"
							endContent={<ChevronRight className="w-3 h-3" />}
						>
							View Details
						</Button>
					</Link>
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