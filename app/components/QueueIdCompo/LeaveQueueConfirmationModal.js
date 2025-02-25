'use client'

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react"
import { LogOut, AlertTriangle } from 'lucide-react'

export default function LeaveQueueConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isLoading,
  position,
  waitTime 
}) {
  // Calculate what the user might lose
  const getLossMessage = () => {
    if (position === 1) {
      return "You're next in line! Are you sure you want to leave now?"
    } else if (position <= 3) {
      return `You're only ${position} ${position === 1 ? 'person' : 'people'} away from being served!`
    } else if (waitTime) {
      return `You've already waited ${waitTime}. Leaving means losing your spot.`
    }
    return "Leaving will remove you from the queue and you'll lose your current position."
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      classNames={{
        base: "bg-white dark:bg-gray-800 shadow-lg border dark:border-gray-700 rounded-lg",
        header: "border-b pb-4 dark:border-gray-700",
        footer: "border-t pt-4 dark:border-gray-700"
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex gap-2 items-center text-danger">
              <AlertTriangle className="h-5 w-5 text-danger" />
              <span>Leave Queue Confirmation</span>
            </ModalHeader>
            <ModalBody>
              <div className="py-2">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {getLossMessage()}
                </p>
                <div className="bg-danger-50 dark:bg-danger-900/20 p-4 rounded-lg border border-danger-200 dark:border-danger-800">
                  <p className="text-sm text-danger-600 dark:text-danger-400">
                    If you leave, you'll need to rejoin at the back of the queue if you return.
                  </p>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button 
                variant="flat" 
                onPress={onClose} 
                disabled={isLoading}
                className="font-medium"
              >
                Stay in Queue
              </Button>
              <Button 
                color="danger" 
                onPress={onConfirm}
                isLoading={isLoading}
                startContent={!isLoading && <LogOut className="h-4 w-4" />}
                className="font-medium"
              >
                {isLoading ? 'Leaving...' : 'Leave Queue'}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
} 