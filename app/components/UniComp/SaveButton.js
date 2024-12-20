import { useState, useEffect } from 'react';
import { Button } from "@nextui-org/react";
import { Bookmark } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

export default function SaveButton({ queueId, className }) {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const checkSaveStatus = async () => {
      if (!session) return;
      
      try {
        const response = await fetch(`/api/queues/${queueId}/save`);
        if (response.ok) {
          const data = await response.json();
          setIsSaved(data.saved);
        }
      } catch (error) {
        console.error('Error checking save status:', error);
      }
    };

    checkSaveStatus();
  }, [queueId, session]);

  const handleToggleSave = async () => {
    if (!session) {
      toast.error('Please sign in to save queues');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/queues/${queueId}/save`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to toggle save status');

      const data = await response.json();
      setIsSaved(data.saved);
      toast.success(data.saved ? 'Queue saved!' : 'Queue removed from saved');
    } catch (error) {
      console.error('Error toggling save:', error);
      toast.error('Failed to update save status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      isIconOnly
      variant="bordered"
      aria-label={isSaved ? "Unsave queue" : "Save queue"}
      onClick={handleToggleSave}
      isLoading={isLoading}
      className={className}
    >
      <Bookmark 
        className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} 
      />
    </Button>
  );
} 