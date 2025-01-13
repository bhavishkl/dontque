'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitalsTracker() {
  useReportWebVitals(metric => {
    const { id, name, label, value } = metric;
    
    // Send to Google Analytics or your analytics platform
    console.log({
      metric: name,
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      label,
      id,
    });
  });

  return null;
} 