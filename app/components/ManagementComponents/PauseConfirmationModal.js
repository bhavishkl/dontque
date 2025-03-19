'use client'

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react"
import { Pause, Play } from "lucide-react"

export default function PauseConfirmationModal({ isOpen, onClose, onConfirm, isActive, isLoading }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          {isActive ? 'Pause Queue' : 'Activate Queue'}
        </ModalHeader>
        <ModalBody>
          <p>
            {isActive 
              ? 'Are you sure you want to pause the queue? This will temporarily stop new customers from joining.'
              : 'Are you sure you want to activate the queue? This will allow customers to start joining.'}
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Cancel
          </Button>
          <Button 
            color={isActive ? "warning" : "success"}
            onPress={onConfirm}
            isLoading={isLoading}
            startContent={isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          >
            {isLoading ? "Updating..." : (isActive ? "Pause Queue" : "Activate Queue")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 