'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { useUserInfo } from '../hooks/useUserName';
import { Button } from "@nextui-org/react";

export default function LandingPageClient() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();
  const { role } = useUserInfo(session?.user?.id);

  useEffect(() => {
    if (session) {
      if (role === 'business') {
        router.push('/dashboard');
      } else {
        router.push('/user/home');
      }
    }
  }, [session, router, role]);

  const handleStartFreeTrial = () => {
    router.push('/signin');
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (session) {
    return null; // or a loading spinner if you prefer
  }

  return (
    <>
      <Button color="default" onClick={handleStartFreeTrial}>
        Get Started
      </Button>
      {isVideoPlaying && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <video autoPlay controls>
              <source src="/demo-video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <Button onClick={() => setIsVideoPlaying(false)}>Close</Button>
          </div>
        </div>
      )}
    </>
  );
}