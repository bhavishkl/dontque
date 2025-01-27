'use client'

import dynamic from 'next/dynamic';
import Hero from './components/LandingPageCompo/hero/Hero';


// Dynamic imports with loading fallbacks
const PerformanceMetrics = dynamic(() => import('./components/PerformanceMetrics'), {
  loading: () => <div>Loading metrics...</div>
});
const PricingSection = dynamic(() => import('./components/LandingPageCompo/pricing/PricingSection'), {
  loading: () => <div>Loading pricing...</div>
});
const TestimonialSection = dynamic(() => import('./components/LandingPageCompo/testimonials/TestimonialSection'), {
  loading: () => <div>Loading testimonials...</div>
});
const FeaturesSection = dynamic(() => import('./components/LandingPageCompo/features/FeaturesSection'), {
  loading: () => <div>Loading features...</div>
});
const FaqSection = dynamic(() => import('./components/LandingPageCompo/faq/FaqSection'), {
  loading: () => <div>Loading FAQ...</div>
});
const Footer = dynamic(() => import('./components/LandingPageCompo/Footer'), {
  loading: () => <div>Loading footer...</div>
});
const Header = dynamic(() => import('./components/LandingPageCompo/Header'), {
  loading: () => <div>Loading header...</div>
});

export default function LandingPage() {
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