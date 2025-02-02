'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import Hero from './components/LandingPageCompo/hero/Hero'
import Header from './components/LandingPageCompo/Header'
import { Card } from "@nextui-org/card"
import { Skeleton } from "@nextui-org/skeleton"
import { useSession } from 'next-auth/react'
import { useRouter, redirect } from 'next/navigation'

// Loading components with proper skeletons
const LoadingSkeleton = () => (
  <div className="w-full max-w-6xl mx-auto px-4 py-8">
    <Card className="w-full p-4">
      <Skeleton className="rounded-lg">
        <div className="h-48 rounded-lg bg-default-300"></div>
      </Skeleton>
      <div className="space-y-3 mt-4">
        <Skeleton className="w-3/5 rounded-lg">
          <div className="h-3 w-3/5 rounded-lg bg-default-200"></div>
        </Skeleton>
        <Skeleton className="w-4/5 rounded-lg">
          <div className="h-3 w-4/5 rounded-lg bg-default-200"></div>
        </Skeleton>
        <Skeleton className="w-2/5 rounded-lg">
          <div className="h-3 w-2/5 rounded-lg bg-default-300"></div>
        </Skeleton>
      </div>
    </Card>
  </div>
)

// Dynamic imports with proper loading states
const PerformanceMetrics = dynamic(() => import('./components/PerformanceMetrics'), {
  loading: () => <LoadingSkeleton />
})

const PricingSection = dynamic(() => import('./components/LandingPageCompo/pricing/PricingSection'), {
  loading: () => <LoadingSkeleton />
})

const FeaturesSection = dynamic(() => import('./components/LandingPageCompo/features/FeaturesSection'), {
  loading: () => <LoadingSkeleton />
})

const FaqSection = dynamic(() => import('./components/LandingPageCompo/faq/FaqSection'), {
  loading: () => <LoadingSkeleton />
})

const Footer = dynamic(() => import('./components/LandingPageCompo/Footer'), {
  loading: () => (
    <div className="w-full bg-background/60 backdrop-blur-lg">
      <div className="max-w-6xl mx-auto p-4">
        <Skeleton className="w-full h-40 rounded-lg" />
      </div>
    </div>
  )
})

export default function LandingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Move redirect logic before render
  if (status === 'authenticated' && session?.user?.role) {
    if (session.user.role === 'user') {
      redirect('/user/home')
    } else if (session.user.role === 'business') {
      redirect('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white dark:from-gray-900 dark:to-gray-800 scroll-smooth">
      {/* Header loaded statically for better initial load */}
      <Header showNavLinks={true} />

      <main>
        <Suspense fallback={<LoadingSkeleton />}>
          <Hero />
        </Suspense>
        
        <section id="features">
          <Suspense fallback={<LoadingSkeleton />}>
            <FeaturesSection />
          </Suspense>
        </section>

        <section id="pricing">
          <Suspense fallback={<LoadingSkeleton />}>
            <PricingSection />
          </Suspense>
        </section>

        <section id="faq">
          <Suspense fallback={<LoadingSkeleton />}>
            <FaqSection />
          </Suspense>
        </section>
      </main>

      <Suspense fallback={<LoadingSkeleton />}>
        <Footer />
      </Suspense>
      
      <Suspense fallback={null}>
        <PerformanceMetrics />
      </Suspense>
    </div>
  )
}