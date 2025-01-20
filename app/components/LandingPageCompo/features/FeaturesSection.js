'use client'

import FeatureCard from './FeatureCard'
import { QrCode, Users, Clock, LineChart, Bot, Shield } from 'lucide-react'

export default function FeaturesSection() {
  const features = [
    {
      title: "Smart Queue Management",
      description: "AI-powered system that automatically optimizes queue flow and predicts peak times for better resource allocation.",
      icon: <Clock className="w-6 h-6 sm:w-8 sm:h-8" />
    },
    {
      title: "QR Code Integration",
      description: "Seamless queue joining experience with dynamic QR codes and mobile app support for virtual queuing.",
      icon: <QrCode className="w-6 h-6 sm:w-8 sm:h-8" />
    },
    {
      title: "Real-time Analytics",
      description: "Comprehensive dashboard with live metrics, customer behavior insights, and performance analytics.",
      icon: <LineChart className="w-6 h-6 sm:w-8 sm:h-8" />
    },
    {
      title: "Multi-tenant Support",
      description: "Manage multiple locations and service points with centralized control and customized settings.",
      icon: <Users className="w-6 h-6 sm:w-8 sm:h-8" />
    },
    {
      title: "AI Chatbot Assistant",
      description: "24/7 automated customer support with intelligent responses and queue status updates.",
      icon: <Bot className="w-6 h-6 sm:w-8 sm:h-8" />
    },
    {
      title: "Enterprise Security",
      description: "Bank-grade encryption and compliance with data protection regulations including GDPR and CCPA.",
      icon: <Shield className="w-6 h-6 sm:w-8 sm:h-8" />
    }
  ]

  return (
    <section className="py-16 sm:py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-orange-600 font-semibold text-sm uppercase tracking-wider">
            Features
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 mt-2">
            Built for modern businesses
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to manage queues efficiently and delight your customers with seamless experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  )
} 