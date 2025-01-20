'use client'

export default function PricingCard({ plan, isPopular, isAnnual }) {
  const getMonthlyPrice = (dailyPrice) => {
    return (parseFloat(dailyPrice) * 30).toFixed(2);
  }

  return (
    <div className={`relative rounded-2xl bg-white p-6 sm:p-8 border transition-all duration-300 shadow-sm hover:shadow-lg
      ${isPopular 
        ? 'border-orange-200 md:scale-105 md:translate-y-0 z-10' 
        : 'border-gray-200 md:scale-95 md:translate-y-4 z-0'
      }
      hover:scale-[1.02]
    `}>
      {isPopular && (
        <div className="absolute -top-4 left-0 right-0 mx-auto w-32 rounded-full bg-orange-600 px-3 py-1 text-center text-sm font-medium text-white shadow-sm">
          Popular
        </div>
      )}

      <div className="text-center">
        <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">{plan.name}</h3>
        <div className="flex items-baseline justify-center">
          <span className="text-sm text-gray-600">Only </span>
          <span className="text-4xl sm:text-5xl font-bold text-orange-600 ml-2">${plan.price}</span>
          <span className="ml-1 text-lg sm:text-xl text-gray-600">/day</span>
        </div>
        
        <div className="mt-1 text-sm text-gray-600">
          ${getMonthlyPrice(plan.price)}/month
        </div>
        
        <p className="mt-1 text-sm text-gray-500">
          {isAnnual ? 'billed annually' : 'billed monthly'}
          {isAnnual && <span className="text-orange-600 ml-1">(Save 20%)</span>}
        </p>
      </div>

      {/* Queue-specific features */}
      <ul className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <svg className="h-5 w-5 text-orange-600 mt-1 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="ml-3 text-sm sm:text-base text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>

      {/* Value proposition */}
      <div className="mt-6 mb-6 sm:mb-8 text-xs sm:text-sm text-gray-600 bg-orange-50 p-3 rounded-lg">
        {plan.name === "STARTER" && "Perfect for small businesses - Start managing queues instantly"}
        {plan.name === "PROFESSIONAL" && "Most popular for growing businesses - All essential features included"}
        {plan.name === "ENTERPRISE" && "Ultimate flexibility and support for large organizations"}
      </div>

      <button 
        className={`w-full rounded-lg py-3 px-4 text-center font-medium transition-all duration-300
          ${isPopular 
            ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-md hover:shadow-lg' 
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
      >
        {plan.name === "ENTERPRISE" ? "Contact Sales" : "Get Started"}
      </button>

      {/* Urgency effect */}
      {isPopular && (
        <p className="mt-4 text-xs sm:text-sm text-center text-orange-600">
          🔥 Limited time offer - Save 20% with annual billing
        </p>
      )}

      <p className="mt-4 text-xs sm:text-sm text-center text-gray-500">
        {plan.description}
      </p>
    </div>
  )
} 