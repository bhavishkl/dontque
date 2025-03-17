// Modern UI Navigation Icons with bold, contemporary design
export const NavigationIcons = {
  // Home - Bold geometric design
  HomeOutlined: ({ className, ...props }) => (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className} 
      {...props}
    >
      <path 
        d="M4.5 21.5v-10l7.5-6.5 7.5 6.5v10h-5.5v-5c0-.8-.7-1.5-1.5-1.5s-1.5.7-1.5 1.5v5H4.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),

  HomeFilled: ({ className, ...props }) => (
    <svg 
      viewBox="0 0 24 24" 
      className={className} 
      {...props}
    >
      <path 
        d="M4.5 21.5v-10l7.5-6.5 7.5 6.5v10h-5.5v-5c0-.8-.7-1.5-1.5-1.5s-1.5.7-1.5 1.5v5H4.5z"
        fill="currentColor"
      />
    </svg>
  ),

  // Search - Bold circular design
  SearchOutlined: ({ className, ...props }) => (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className} 
      {...props}
    >
      <path 
        d="M15 15l5 5M10.5 17c3.59 0 6.5-2.91 6.5-6.5S14.09 4 10.5 4 4 6.91 4 10.5 6.91 17 10.5 17z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),

  SearchFilled: ({ className, ...props }) => (
    <svg 
      viewBox="0 0 24 24" 
      className={className} 
      {...props}
    >
      <path 
        d="M10.5 17c3.59 0 6.5-2.91 6.5-6.5S14.09 4 10.5 4 4 6.91 4 10.5 6.91 17 10.5 17z"
        fill="currentColor"
      />
      <path 
        d="M15 15l5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),

  // Feedback - Modern chat design
  FeedbackOutlined: ({ className, ...props }) => (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className} 
      {...props}
    >
      <path 
        d="M20 12c0 4.4-4 8-9 8-1.5 0-3-.3-4.3-.8L3 21l1.7-4C3.9 15.5 3 13.8 3 12c0-4.4 4-8 9-8s8 3.6 8 8z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path 
        d="M12 8v4m-2-2h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),

  FeedbackFilled: ({ className, ...props }) => (
    <svg 
      viewBox="0 0 24 24" 
      className={className} 
      {...props}
    >
      <path 
        d="M20 12c0 4.4-4 8-9 8-1.5 0-3-.3-4.3-.8L3 21l1.7-4C3.9 15.5 3 13.8 3 12c0-4.4 4-8 9-8s8 3.6 8 8z"
        fill="currentColor"
      />
      <path 
        d="M12 8v4m-2-2h4"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),

  // History - Dynamic clock design
  HistoryOutlined: ({ className, ...props }) => (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className} 
      {...props}
    >
      <path 
        d="M12 20c4.4 0 8-3.6 8-8s-3.6-8-8-8-8 3.6-8 8 3.6 8 8 8z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path 
        d="M12 7.5V12l3.5 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),

  HistoryFilled: ({ className, ...props }) => (
    <svg 
      viewBox="0 0 24 24" 
      className={className} 
      {...props}
    >
      <path 
        d="M12 20c4.4 0 8-3.6 8-8s-3.6-8-8-8-8 3.6-8 8 3.6 8 8 8z"
        fill="currentColor"
      />
      <path 
        d="M12 7.5V12l3.5 2"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),

  // Profile - Contemporary user design
  ProfileOutlined: ({ className, ...props }) => (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className} 
      {...props}
    >
      <path 
        d="M12 13c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path 
        d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),

  ProfileFilled: ({ className, ...props }) => (
    <svg 
      viewBox="0 0 24 24" 
      className={className} 
      {...props}
    >
      <path 
        d="M12 13c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4z"
        fill="currentColor"
      />
      <path 
        d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6v1H5v-1z"
        fill="currentColor"
      />
    </svg>
  ),
} 