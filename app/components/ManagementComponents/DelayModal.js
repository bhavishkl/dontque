'use client'

import { useState, useEffect } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Select, SelectItem } from "@nextui-org/react"
import { Clock } from "lucide-react"

const DELAY_REASONS = [
  { value: 'technical', label: 'Technical Issues' },
  { value: 'staff', label: 'Staff Unavailable' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'other', label: 'Other' }
]

export default function DelayModal({ isOpen, onClose, onSubmit }) {
  const [selectedTime, setSelectedTime] = useState('')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeOptions, setTimeOptions] = useState([])

  useEffect(() => {
    // Generate time options for the next 4 hours in 15-minute intervals
    const options = []
    const now = new Date()
    const currentMinutes = now.getMinutes()
    
    // Round up to the next 15-minute interval
    const roundedMinutes = Math.ceil(currentMinutes / 15) * 15
    now.setMinutes(roundedMinutes)
    now.setSeconds(0)
    
    for (let i = 0; i < 16; i++) { // 4 hours * 4 (15-min intervals)
      const time = new Date(now.getTime() + (i * 15 * 60000))
      const hours = time.getHours()
      const minutes = time.getMinutes()
      const ampm = hours >= 12 ? 'PM' : 'AM'
      const formattedHours = hours % 12 || 12
      const formattedMinutes = minutes.toString().padStart(2, '0')
      const timeString = `${formattedHours}:${formattedMinutes} ${ampm}`
      
      options.push({
        value: time.toISOString(),
        label: timeString
      })
    }
    
    setTimeOptions(options)
  }, [isOpen]) // Regenerate options when modal opens

  const handleSubmit = async () => {
    if (!selectedTime || !reason) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        delayUntil: selectedTime,  // Changed from selectedTime to delayUntil
        reason
      });
      onClose();
      setSelectedTime('');
      setReason('');
    } catch (error) {
      console.error('Error submitting delay:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          Add Queue Delay
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Select
              label="Delay Until"
              placeholder="Select time"
              selectedKeys={selectedTime ? [selectedTime] : []}
              onChange={(e) => setSelectedTime(e.target.value)}
              startContent={<Clock className="h-4 w-4 text-default-400" />}
            >
              {timeOptions.map((time) => (
                <SelectItem key={time.value} value={time.value}>
                  {time.label}
                </SelectItem>
              ))}
            </Select>
            <Select
              label="Reason for Delay"
              placeholder="Select a reason"
              selectedKeys={reason ? [reason] : []}
              onChange={(e) => setReason(e.target.value)}
            >
              {DELAY_REASONS.map((reason) => (
                <SelectItem key={reason.value} value={reason.value}>
                  {reason.label}
                </SelectItem>
              ))}
            </Select>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Cancel
          </Button>
          <Button 
            color="primary" 
            onPress={handleSubmit}
            isLoading={isSubmitting}
            isDisabled={!selectedTime || !reason}
          >
            Add Delay
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 