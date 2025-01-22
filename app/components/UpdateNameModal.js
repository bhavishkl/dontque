import { useState } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from "@nextui-org/react"
import { toast } from 'sonner'
import { useUserInfo } from '../hooks/useUserName'

export default function UpdateNameModal({ isOpen, onClose, userId }) {
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { updateUserName } = useUserInfo(userId)

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Please enter your name')
      return
    }

    setIsLoading(true)
    try {
      await updateUserName(name)
      toast.success('Name updated successfully')
      onClose()
    } catch (error) {
      toast.error('Failed to update name')
      console.error('Error updating name:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      isDismissable={false}
      hideCloseButton
    >
      <ModalContent>
        <ModalHeader>Welcome! Please enter your name</ModalHeader>
        <ModalBody>
          <Input
            label="Name"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onClick={handleSubmit}
            isLoading={isLoading}
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
} 