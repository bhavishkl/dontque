'use client'

export default function FeatureCard({ feature }) {
  // Different psychological effects based on feature
  const getMarketingEffect = (title) => {
    const effects = {
      "Smart Queue Management": {
        type: "loss_aversion",
        message: "Stop losing 30% of customers to long queues",
        badge: "Popular choice" // Most important feature
      },
      "QR Code Integration": {
        type: "social_proof",
        message: "Join 2000+ businesses using QR queuing",
        badge: null
      },
      "Real-time Analytics": {
        type: "fomo",
        message: "Gain insights your competitors already have",
        badge: "Trending" // Analytics is trending
      },
      "Multi-tenant Support": {
        type: "growth",
        message: "Scale your business across multiple locations",
        badge: null
      },
      "AI Chatbot Assistant": {
        type: "efficiency",
        message: "24/7 automated customer support",
        recentlyUpdated: true // New AI features
      },
      "Enterprise Security": {
        type: "trust",
        message: "Bank-grade security trusted by major brands",
        badge: null
      }
    }
    return effects[title] || { type: "default", message: "", badge: null }
  }

  const effect = getMarketingEffect(feature.title)

  return (
    <div className="group relative overflow-hidden rounded-xl bg-white p-6 sm:p-8 hover:bg-orange-50/80 transition-all duration-300 shadow-sm hover:shadow-lg">
      <div className="relative z-10">
        {/* Conditional badge */}
        {effect.badge && (
          <div className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs px-2 py-1 rounded-full transform rotate-12">
            {effect.badge}
          </div>
        )}

        {/* Visual hierarchy and attention grabbing */}
        <div className="mb-4 text-orange-600 group-hover:text-orange-700 transition-colors duration-300">
          {feature.icon}
        </div>

        {/* Clear value proposition */}
        <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
          {feature.title}
        </h3>

        {/* Dynamic marketing message based on psychology */}
        <p className={`text-xs font-medium mb-2 ${
          effect.type === 'loss_aversion' ? 'text-orange-600' :
          effect.type === 'social_proof' ? 'text-blue-600' :
          effect.type === 'fomo' ? 'text-purple-600' :
          effect.type === 'growth' ? 'text-green-600' :
          effect.type === 'efficiency' ? 'text-cyan-600' :
          effect.type === 'trust' ? 'text-gray-600' :
          'text-gray-600'
        }`}>
          {effect.message}
        </p>

        {/* Feature description with benefit framing */}
        <p className="text-sm sm:text-base text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
          {feature.description}
        </p>

        {/* Action-oriented micro-interaction */}
        <div className="mt-4 flex items-center text-xs text-orange-600">
          <span className="mr-1">Learn more</span>
          <svg 
            className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
      
      {/* Enhanced gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-orange-50/30 to-orange-100/20 opacity-30 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Conditional recently updated indicator */}
      {effect.recentlyUpdated && (
        <div className="absolute bottom-3 right-3 flex items-center text-xs text-orange-600">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></span>
          <span>Recently updated</span>
        </div>
      )}
      
      {/* Enhanced border */}
      <div className="absolute inset-0 rounded-xl border border-gray-200 group-hover:border-orange-200 transition-colors duration-300" />
    </div>
  )
} 