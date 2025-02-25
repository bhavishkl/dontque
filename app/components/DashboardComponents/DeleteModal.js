'use client'

import { useState } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/modal"
import { Button } from "@nextui-org/button"

export default function DeleteModal({ 
  isOpen, 
  onClose, 
  onDelete, 
  queueName, 
  isDeleting 
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Delete Queue</ModalHeader>
            <ModalBody>
              <p>
                Are you sure you want to delete <strong>{queueName}</strong>?
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This action cannot be undone. All queue data, including customer entries and analytics, will be permanently removed.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onClose} disabled={isDeleting}>
                Cancel
              </Button>
              <Button 
                color="danger" 
                onPress={onDelete}
                isLoading={isDeleting}
              >
                Delete
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
} 