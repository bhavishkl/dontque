import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, useDisclosure } from "@nextui-org/react";
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';

const AddKnownUserModal = ({ queueId, onSuccess, isAdvanced, selectedServices, counterId }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [shortId, setShortId] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddKnown = async () => {
    setIsAdding(true);
    try {
      const endpoint = isAdvanced 
        ? `/api/queues/${queueId}/advanced-queues/add-known`
        : `/api/queues/${queueId}/add-known`;

      const body = isAdvanced 
        ? { 
            shortId,
            services: Array.from(selectedServices),
            counterId
          }
        : { shortId };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add known user to queue');
      }

      onClose();
      setShortId('');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error adding known user:', error);
      toast.error(error.message);
    } finally {
      setIsAdding(false);
    }
  };


  return (
    <>
      <Button 
        onClick={onOpen} 
        color="success" 
        variant="flat"
        startContent={<UserPlus className="w-4 h-4" />}
      >
        Add User 
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Add User to Queue</ModalHeader>
          <ModalBody>
            <Input
              label="Known User's Short ID"
              value={shortId}
              onChange={(e) => {
                const numericValue = e.target.value.replace(/\D/g, '');
                setShortId(numericValue);
              }}
              placeholder="Enter 6-digit ID"
              maxLength={6}
              autoFocus
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (shortId.length === 6) {
                    handleAddKnown();
                  } else {
                    toast.error("Please enter a valid 6-digit ID");
                  }
                }
              }}
              isInvalid={shortId.length > 0 && shortId.length < 6}
              errorMessage={shortId.length > 0 && shortId.length < 6 ? "Please enter a 6-digit ID" : ""}
            />
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              color="primary" 
              onClick={handleAddKnown} 
              isLoading={isAdding}
              isDisabled={shortId.length !== 6}
            >
              {isAdding ? 'Adding...' : 'Add Known User'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {shortId.length > 0 && shortId.length < 6 && (
        <p className="text-red-500 mt-2">Error: ID must be 6 digits</p>
      )}
    </>
  );
};

export default AddKnownUserModal;