'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Spinner, Card, CardBody } from "@nextui-org/react";

export default function QuickJoinPage({ params }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const queueId = params?.queueId;

  useEffect(() => {
    if (!queueId) {
      toast.error('Invalid queue ID');
      router.push('/');
      return;
    }

    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      // Store the queue ID in sessionStorage before redirecting to sign in
      sessionStorage.setItem('quickJoinQueueId', queueId);
      router.push(`/auth/signin?callbackUrl=/quick-join/${queueId}`);
    } else if (status === 'authenticated') {
      // Check if we're coming back from authentication
      const storedQueueId = sessionStorage.getItem('quickJoinQueueId');
      if (storedQueueId === queueId) {
        // Clear the stored queue ID
        sessionStorage.removeItem('quickJoinQueueId');
      }
      
      // Redirect to the queue page with quick-join parameter
      router.push(`/user/queue/${queueId}?quick_join=true`);
    }
  }, [status, queueId, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card>
        <CardBody className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Processing Quick Join</h1>
          <p className="text-sm text-gray-600">
            {status === 'unauthenticated' 
              ? 'Redirecting to sign in...' 
              : 'Preparing to join queue...'}
          </p>
        </CardBody>
      </Card>
    </div>
  );
} 