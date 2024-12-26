export class PerformanceMonitor {
  constructor(operation) {
    this.operation = operation;
    this.steps = new Map();
    this.start = performance.now();
  }

  markStep(step) {
    this.steps.set(step, performance.now() - this.start);
  }

  end() {
    const end = performance.now();
    const total = end - this.start;
    
    const results = {
      operation: this.operation,
      totalDuration: total,
      steps: Object.fromEntries(this.steps),
    };

    console.log('Performance Results:', results);
    return results;
  }
} 