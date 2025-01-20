'use client'

import { useState, useEffect } from 'react';import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { useUserInfo } from './hooks/useUserName';
import PerformanceMetrics from './components/PerformanceMetrics';
import PricingSection from './components/LandingPageCompo/pricing/PricingSection'
import TestimonialSection from './components/LandingPageCompo/testimonials/TestimonialSection'
import FeaturesSection from './components/LandingPageCompo/features/FeaturesSection'
import FaqSection from './components/LandingPageCompo/faq/FaqSection'
import Footer from './components/LandingPageCompo/Footer'
import Hero from './components/LandingPageCompo/hero/Hero'
import Header from './components/LandingPageCompo/Header'

export default function LandingPage() {
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

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (session) {
    return null; // or a loading spinner if you prefer
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white dark:from-gray-900 dark:to-gray-800 scroll-smooth">
      <Header showNavLinks={true} />

      <main>
        <Hero />
        
        <section id="features">
          <FeaturesSection />
        </section>

        <section id="pricing">
          <PricingSection />
        </section>

        <section id="testimonials">
          <TestimonialSection />
        </section>

        <section id="faq">
          <FaqSection />
        </section>
      </main>

      <Footer />
      <PerformanceMetrics />
    </div>
  );
}