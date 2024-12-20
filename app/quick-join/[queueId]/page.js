'use client'

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Spinner } from "@nextui-org/react";

export default function QuickJoinPage({ params }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      // Store the queue ID in sessionStorage before redirecting to sign in
      sessionStorage.setItem('quickJoinQueueId', params.queueId);
      router.push(`/auth/signin?callbackUrl=/quick-join/${params.queueId}`);
    } else if (status === 'authenticated') {
      // Check if we're coming back from authentication
      const storedQueueId = sessionStorage.getItem('quickJoinQueueId');
      if (storedQueueId === params.queueId) {
        // Clear the stored queue ID
        sessionStorage.removeItem('quickJoinQueueId');
      }
      
      // Redirect to the queue page with quick-join parameter
      router.push(`/user/queue/${params.queueId}?quick_join=true`);
    }
  }, [status, params.queueId, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Spinner size="lg" />
      <p className="mt-4">Processing quick join...</p>
    </div>
  );
} 