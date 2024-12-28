import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Switch, Spinner } from "@nextui-org/react";
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function NotificationPreferencesModal({ isOpen, onClose, onSave }) {
  const [preferences, setPreferences] = useState({
    email_enabled: false,
    sms_enabled: false,
    whatsapp_enabled: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPreferences();
    }
  }, [isOpen]);

  const fetchPreferences = async () => {
    setIsFetching(true);
    try {
      const response = await fetch('/api/user/notification-preferences');
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast.error('Failed to load preferences');
    } finally {
      setIsFetching(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/notification-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      });

      if (!response.ok) throw new Error('Failed to save preferences');
      
      toast.success('Notification preferences saved');
      onSave(preferences);
      onClose();
    } catch (error) {
      toast.error('Failed to save preferences');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Notification Preferences</ModalHeader>
        <ModalBody>
          {isFetching ? (
            <div className="flex justify-center items-center py-8">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-base font-semibold flex items-center text-gray-900 dark:text-gray-100">
                      <span className="mr-2">WhatsApp Notifications</span>
                      <span className="text-xs bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 px-2 py-1 rounded">Default</span>
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Primary notification channel</p>
                  </div>
                  <Switch
                    isSelected={preferences.whatsapp_enabled}
                    onValueChange={(checked) => 
                      setPreferences(prev => ({ ...prev, whatsapp_enabled: checked }))
                    }
                    classNames={{
                      wrapper: "group-data-[selected=true]:bg-green-500"
                    }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Additional Notifications</h4>
                
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-base font-semibold">Email Notifications</h4>
                    <p className="text-sm text-gray-500">Receive additional updates via email</p>
                  </div>
                  <Switch
                    isSelected={preferences.email_enabled}
                    onValueChange={(checked) => 
                      setPreferences(prev => ({ ...prev, email_enabled: checked }))
                    }
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-base font-semibold">SMS Notifications</h4>
                    <p className="text-sm text-gray-500">Receive additional updates via SMS</p>
                  </div>
                  <Switch
                    isSelected={preferences.sms_enabled}
                    onValueChange={(checked) => 
                      setPreferences(prev => ({ ...prev, sms_enabled: checked }))
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Cancel
          </Button>
          <Button color="primary" onPress={handleSave} isLoading={isLoading}>
            Save Preferences
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 