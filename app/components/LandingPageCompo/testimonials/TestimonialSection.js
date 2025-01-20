'use client'

import { useEffect, useRef } from 'react'
import TestimonialCard from './TestimonialCard'

export default function TestimonialSection() {
  const scrollRef = useRef(null)
  
  const testimonials = [
    {
      name: "Emma Thompson",
      title: "Operations Manager at CityHospital",
      handle: "emmaai",
      avatar: "/avatars/emma.jpg",
      content: "The AI platform has transformed how we handle patient queues. The speed and efficiency are unprecedented.",
      metrics: "40% reduction in wait times"
    },
    {
      name: "David Park",
      title: "Tech Lead at RetailGiant",
      handle: "davidtech",
      avatar: "/avatars/david.jpg",
      content: "The API integration is flawless. We've reduced our development time by 60% since implementing this solution.",
      metrics: "95% customer satisfaction"
    },
    {
      name: "Sofia Rodriguez",
      title: "Customer Experience Director",
      handle: "sofiaml",
      avatar: "/avatars/sofia.jpg",
      content: "Finally, an AI tool that actually understands context! The accuracy in natural language processing is impressive.",
      metrics: "2x customer throughput"
    },
    {
      name: "Michael Chen",
      title: "Restaurant Owner",
      handle: "mikefoodtech",
      avatar: "/avatars/michael.jpg",
      content: "Queue management has never been easier. Our customers love the real-time updates.",
      metrics: "30% more throughput"
    },
    {
      name: "Sarah Williams",
      title: "Retail Operations Head",
      handle: "sarahretail",
      avatar: "/avatars/sarah.jpg",
      content: "The multi-location support is a game-changer for our chain stores.",
      metrics: "50% less complaints"
    },
  ]

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    let scrollInterval
    const startAutoScroll = () => {
      scrollInterval = setInterval(() => {
        if (scrollContainer.scrollLeft >= (scrollContainer.scrollWidth - scrollContainer.clientWidth)) {
          scrollContainer.scrollLeft = 0
        } else {
          scrollContainer.scrollLeft += 1
        }
      }, 30)
    }

    startAutoScroll()

    const handleMouseEnter = () => clearInterval(scrollInterval)
    const handleMouseLeave = () => startAutoScroll()
    const handleTouchStart = () => clearInterval(scrollInterval)
    const handleTouchEnd = () => startAutoScroll()

    scrollContainer.addEventListener('mouseenter', handleMouseEnter)
    scrollContainer.addEventListener('mouseleave', handleMouseLeave)
    scrollContainer.addEventListener('touchstart', handleTouchStart)
    scrollContainer.addEventListener('touchend', handleTouchEnd)

    return () => {
      clearInterval(scrollInterval)
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter)
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave)
      scrollContainer.removeEventListener('touchstart', handleTouchStart)
      scrollContainer.removeEventListener('touchend', handleTouchEnd)
    }
  }, [])

  return (
    <section className="py-16 sm:py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-orange-600 font-semibold text-sm uppercase tracking-wider">
            Testimonials
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 mt-2">
            Trusted by businesses worldwide
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of businesses already transforming their queue management
          </p>
        </div>

        <div 
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide py-4 no-scrollbar"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={`${testimonial.name}-${index}`} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  )
} 