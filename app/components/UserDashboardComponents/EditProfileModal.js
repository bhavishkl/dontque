'use client'

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Button } from "@nextui-org/react"

export default function EditProfileModal({ 
  isOpen, 
  onClose, 
  editedUserData, 
  setEditedUserData, 
  handleSaveChanges, 
  isUserLoading
}) {
  const handleSave = async () => {
    try {
      await handleSaveChanges()
    } catch (error) {
      console.error('Error saving changes:', error)
    }
  }

  // Function to format phone number for display
  const formatPhoneForDisplay = (phone) => {
    if (!phone) return ''
    return phone.startsWith('+91') ? phone.slice(3) : phone
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="2xl"
      className="sm:mx-4"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-lg sm:text-xl font-semibold">Edit Profile</h2>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4 sm:space-y-6">
                {isUserLoading ? (
                  <>
                    <div className="h-14 w-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded animate-pulse" />
                    <div className="h-14 w-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded animate-pulse" />
                  </>
                ) : (
                  <>
                    <Input
                      label="Name"
                      value={editedUserData?.name || ''}
                      onChange={(e) => setEditedUserData({...editedUserData, name: e.target.value})}
                      variant="bordered"
                      className="w-full text-sm sm:text-base"
                    />
                    <Input
                      label="Phone Number"
                      value={formatPhoneForDisplay(editedUserData?.phone_number)}
                      onChange={(e) => setEditedUserData({
                        ...editedUserData, 
                        phone_number: e.target.value
                      })}
                      startContent={
                        <div className="pointer-events-none flex items-center">
                          <span className="text-default-400 text-sm">+91</span>
                        </div>
                      }
                      variant="bordered"
                      type="tel"
                      className="w-full text-sm sm:text-base"
                    />
                  </>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button 
                color="danger" 
                variant="light" 
                onPress={onClose}
                className="text-sm sm:text-base"
              >
                Cancel
              </Button>
              <Button 
                color="primary"
                onPress={handleSave}
                className="text-sm sm:text-base"
                isLoading={isUserLoading}
              >
                Save Changes
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
} 