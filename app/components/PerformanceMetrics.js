'use client'

import { useState, useEffect } from 'react';

export default function PerformanceMetrics() {
  const [loadTime, setLoadTime] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const navigationTiming = performance.getEntriesByType('navigation')[0];
      const loadTime = navigationTiming.loadEventEnd - navigationTiming.startTime;
      setLoadTime(loadTime.toFixed(2));
    }
  }, []);

  if (!loadTime) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-2 rounded-md text-sm">
      Page Load Time: {loadTime} ms
    </div>
  );
}