'use client'

export default function TestimonialCard({ testimonial }) {
  return (
    <div className="group relative flex-shrink-0 w-[280px] sm:w-[400px] rounded-xl bg-white p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-orange-200">
      <div className="flex items-center gap-3">
        <img 
          src={testimonial.avatar} 
          alt={testimonial.name}
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full ring-2 ring-orange-100"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {testimonial.name}
              </h3>
              <p className="text-xs text-gray-500 truncate">
                {testimonial.title}
              </p>
            </div>
            <span className="text-orange-600 text-[10px] sm:text-xs font-medium bg-orange-50 px-2 py-1 rounded-full shrink-0">
              {testimonial.metrics}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-2 sm:mt-3 line-clamp-2">
            {testimonial.content}
          </p>
        </div>
      </div>

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-orange-50/30 to-orange-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
    </div>
  )
} 