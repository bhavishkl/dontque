'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/mock-auth';
import { Spinner, Card, CardBody } from "@nextui-org/react";
import { toast } from 'sonner';
import { useApi } from '@/app/hooks/useApi';

export default function QuickJoinPage({ params }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const queueId = params?.queueId;

  // Fetch queue data to check if user is already in queue
  const { data: queueData, isLoading } = useApi(
    status === 'authenticated' ? `/api/queues/${queueId}` : null
  );

  useEffect(() => {
    if (!queueId) {
      toast.error('Invalid queue ID');
      router.push('/');
      return;
    }

    if (status === 'loading' || isLoading) return;

    if (status === 'unauthenticated') {
      sessionStorage.setItem('quickJoinQueueId', queueId);
      router.push(`/auth/signin?callbackUrl=/quick-join/${queueId}`);
    } else if (status === 'authenticated') {
      const storedQueueId = sessionStorage.getItem('quickJoinQueueId');
      if (storedQueueId === queueId) {
        sessionStorage.removeItem('quickJoinQueueId');
      }
      
      // Check if user is already in queue
      if (queueData?.userQueueEntry) {
        toast.error('You are already in this queue');
        router.push(`/user/queue/${queueId}`);
      } else {
        // Only add quick_join parameter if user is not already in queue
        router.push(`/user/queue/${queueId}?quick_join=true`);
      }
    }
  }, [status, queueId, router, queueData, isLoading]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card>
        <CardBody className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Processing Quick Join</h1>
          <p className="text-sm text-gray-600">
            {status === 'unauthenticated' 
              ? 'Redirecting to sign in...' 
              : isLoading 
                ? 'Checking queue status...'
                : 'Preparing to join queue...'}
          </p>
        </CardBody>
      </Card>
    </div>
  );
} 