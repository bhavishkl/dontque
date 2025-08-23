import { useState } from 'react';
import { Button } from "@nextui-org/react";
import { Bookmark } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';

// Define fetcher function
const fetcher = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch save status');
  return res.json();
};

export default function SaveButton({ queueId, className }) {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  
  // Use SWR for caching and deduplication of requests
  const { data, mutate } = useSWR(
    session ? `/api/queues/${queueId}/save` : null,
    fetcher,
    {
      dedupingInterval: 60000, // Dedupe requests within 1 minute
      revalidateOnFocus: false, // Don't revalidate on window focus
      revalidateOnReconnect: false // Don't revalidate on reconnect
    }
  );

  const isSaved = data?.saved;

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

      const result = await response.json();
      // Optimistically update the UI
      await mutate({ saved: result.saved }, false);
      toast.success(result.saved ? 'Queue saved!' : 'Queue removed from saved');
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
        // When saved: fill the icon, remove stroke, and use yellow color.
        // When unsaved: no fill, use stroke to display a border outline in gray.
        fill={isSaved ? 'currentColor' : 'none'}
        stroke={isSaved ? 'none' : 'currentColor'}
        className={`h-5 w-5 ${isSaved ? 'text-gray-600' : 'text-gray-400'}`}
      />
    </Button>
  );
} 