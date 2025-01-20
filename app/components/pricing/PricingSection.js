'use client'

import { useState } from 'react'
import PricingCard from './PricingCard'

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true)

  const plans = [
    {
      name: "STARTER",
      price: isAnnual ? "1.33" : "1.99", // $40/mo or $49/mo converted to daily
      features: [
        "Up to 50 queue entries/day",
        "Basic queue analytics",
        "SMS notifications (100/month)",
        "Single location support",
        "QR code generation",
        "Basic customer display system",
        "Email support (48h response)",
        "Mobile app access"
      ],
      description: "Perfect for small businesses and cafes"
    },
    {
      name: "PROFESSIONAL",
      price: isAnnual ? "2.63" : "3.30", // $79/mo or $99/mo converted to daily
      features: [
        "Unlimited queue entries",
        "Real-time analytics dashboard",
        "SMS & WhatsApp notifications",
        "Multi-location support (up to 3)",
        "Custom branding",
        "Staff management",
        "Priority email & chat support",
        "API access",
        "Customer feedback system"
      ],
      description: "Ideal for restaurants and retail chains"
    },
    {
      name: "ENTERPRISE",
      price: "7.99", // $239/mo converted to daily
      features: [
        "Everything in Professional",
        "Unlimited locations",
        "Advanced AI predictions",
        "Custom integrations",
        "Dedicated account manager",
        "24/7 priority support",
        "Staff performance analytics",
        "Custom reporting",
        "SLA guarantees",
        "On-premise deployment option"
      ],
      description: "For hospitals and large enterprises"
    }
  ]

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-orange-600 font-semibold text-sm uppercase tracking-wider">
            Pricing
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 mt-2">
            Simple, transparent pricing
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan for your business. All plans include a 30-day free trial.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex flex-col items-center mb-8 sm:mb-12">
          <div className="flex items-center bg-gray-100 p-1 rounded-full">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                !isAnnual 
                  ? 'bg-orange-600 text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly billing
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                isAnnual 
                  ? 'bg-orange-600 text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Annual billing <span className="hidden sm:inline">(Save 20%)</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <PricingCard
              key={plan.name}
              plan={plan}
              isPopular={index === 1}
              isAnnual={isAnnual}
            />
          ))}
        </div>
      </div>
    </section>
  )
} 