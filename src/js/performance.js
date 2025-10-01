// Performance Monitoring System
export class PerformanceMonitor {
  constructor(options = {}) {
    this.options = {
      enableWebVitals: true,
      enableResourceTiming: true,
      reportInterval: 30000,
      thresholds: {
        fcp: 2000,
        lcp: 2500,
        fid: 100,
        cls: 0.1,
        ttfb: 600
      },
      enableReporting: false,
      reportEndpoint: '/api/analytics/performance',
      ...options
    };
    
    this.metrics = new Map();
    this.observers = [];
    this.reportBuffer = [];
    this.sessionId = this.generateSessionId();
    
    this.init();
  }
  
  async init() {
    
    if (this.options.enableWebVitals) {
      await this.initializeWebVitals();
    }
    
    if (this.options.enableResourceTiming) {
      this.initializeResourceTiming();
    }
    
    this.initializeCustomMetrics();
    
    if (this.options.enableReporting) {
      this.startPeriodicReporting();
    }
    
    window.addEventListener('beforeunload', () => this.sendReport());
    
  }
  
  async initializeWebVitals() {
    try {
      const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals');
      
      getFCP((metric) => {
        this.recordMetric('fcp', metric.value, metric);
        this.checkThreshold('fcp', metric.value);
      });
      
      getLCP((metric) => {
        this.recordMetric('lcp', metric.value, metric);
        this.checkThreshold('lcp', metric.value);
      });
      
      getFID((metric) => {
        this.recordMetric('fid', metric.value, metric);
        this.checkThreshold('fid', metric.value);
      });
      
      getCLS((metric) => {
        this.recordMetric('cls', metric.value, metric);
        this.checkThreshold('cls', metric.value);
      });
      
      getTTFB((metric) => {
        this.recordMetric('ttfb', metric.value, metric);
        this.checkThreshold('ttfb', metric.value);
      });
      
    } catch (error) {
      this.initializeFallbackWebVitals();
    }
  }
  
  initializeFallbackWebVitals() {
    if ('PerformanceObserver' in window) {
      try {
        const paintObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              this.recordMetric('fcp', entry.startTime);
              this.checkThreshold('fcp', entry.startTime);
            }
          }
        });
        paintObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(paintObserver);
      } catch (error) {
        console.debug('Paint observer not supported');
      }
      
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.recordMetric('lcp', lastEntry.startTime);
          this.checkThreshold('lcp', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (error) {
        console.debug('LCP observer not supported');
      }
    }
  }
  
  initializeResourceTiming() {
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.analyzeResourceTiming(entry);
        }
      });
      
      try {
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      } catch (error) {
        console.debug('Resource timing observer not supported');
      }
    }
  }
  
  initializeCustomMetrics() {
    document.addEventListener('component:loaded', (e) => {
      const { component, loadTime } = e.detail;
      this.recordMetric(`component_load_${component}`, loadTime);
    });
    
    document.addEventListener('api:response', (e) => {
      const { endpoint, duration, status } = e.detail;
      this.recordMetric('api_response_time', duration, {
        endpoint,
        status,
        timestamp: Date.now()
      });
      
      if (duration > 3000) {
        this.recordEvent('slow_api_response', { endpoint, duration, status });
      }
    });
    
  }
  
  analyzeResourceTiming(entry) {
    const timing = {
      name: entry.name,
      duration: entry.duration,
      transferSize: entry.transferSize,
      initiatorType: entry.initiatorType
    };
    
    if (entry.duration > 1000) {
      this.recordEvent('slow_resource', timing);
    }
    
    if (entry.transferSize > 1024 * 1024) {
      this.recordEvent('large_resource', timing);
    }
    
    this.recordMetric('resource_load_time', entry.duration, timing);
  }
  
  recordMetric(name, value, metadata = {}) {
    const metric = {
      name,
      value: Math.round(value * 100) / 100,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      url: window.location.href,
      metadata
    };
    
    this.metrics.set(`${name}_${Date.now()}`, metric);
    this.reportBuffer.push(metric);
    
    document.dispatchEvent(new CustomEvent('performance:metric', {
      detail: metric
    }));
    
    console.debug(`📊 Metric recorded: ${name} = ${value}ms`);
  }
  
  recordEvent(name, data = {}) {
    const event = {
      type: 'event',
      name,
      data,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      url: window.location.href
    };
    
    this.reportBuffer.push(event);
    
    document.dispatchEvent(new CustomEvent('performance:event', {
      detail: event
    }));
    
  }
  
  checkThreshold(metricName, value) {
    const threshold = this.options.thresholds[metricName];
    if (threshold && value > threshold) {
      this.recordEvent('threshold_exceeded', {
        metric: metricName,
        value,
        threshold,
        exceedBy: value - threshold
      });
      
    }
  }
  
  startPeriodicReporting() {
    setInterval(() => {
      this.sendReport();
    }, this.options.reportInterval);
  }
  
  async sendReport() {
    if (this.reportBuffer.length === 0) return;
    
    const report = {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      connection: this.getConnectionInfo(),
      metrics: [...this.reportBuffer]
    };
    
    this.reportBuffer = [];
    
    try {
      if (this.options.enableReporting) {
        await fetch(this.options.reportEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(report)
        });
        
      }
      
      document.dispatchEvent(new CustomEvent('performance:report', {
        detail: report
      }));
    } catch (error) {
      console.error('Failed to send performance report:', error);
      this.reportBuffer.unshift(...report.metrics);
    }
  }
  
  getConnectionInfo() {
    if ('connection' in navigator) {
      return {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData
      };
    }
    return null;
  }
  
  generateSessionId() {
    return `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  getMetrics() {
    return Array.from(this.metrics.values());
  }
  
  getMetricsByName(name) {
    return this.getMetrics().filter(metric => metric.name === name);
  }
  
  getAverageMetric(name) {
    const metrics = this.getMetricsByName(name);
    if (metrics.length === 0) return 0;
    
    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / metrics.length;
  }
  
  getPerformanceSummary() {
    return {
      sessionId: this.sessionId,
      totalMetrics: this.metrics.size,
      averages: {
        fcp: this.getAverageMetric('fcp'),
        lcp: this.getAverageMetric('lcp'),
        fid: this.getAverageMetric('fid'),
        cls: this.getAverageMetric('cls'),
        ttfb: this.getAverageMetric('ttfb')
      },
      connection: this.getConnectionInfo(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
  }
  
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
    this.reportBuffer = [];
  }
}

export class PerformanceUtils {
  static measureFunction(fn, name) {
    return function(...args) {
      const start = performance.now();
      const result = fn.apply(this, args);
      const end = performance.now();
      
      document.dispatchEvent(new CustomEvent('performance:metric', {
        detail: {
          name: `function_${name}`,
          value: end - start,
          timestamp: Date.now()
        }
      }));
      
      return result;
    };
  }
  
  static measureAsync(fn, name) {
    return async function(...args) {
      const start = performance.now();
      const result = await fn.apply(this, args);
      const end = performance.now();
      
      document.dispatchEvent(new CustomEvent('performance:metric', {
        detail: {
          name: `async_${name}`,
          value: end - start,
          timestamp: Date.now()
        }
      }));
      
      return result;
    };
  }
  
  static markStart(name) {
    performance.mark(`${name}_start`);
  }
  
  static markEnd(name) {
    performance.mark(`${name}_end`);
    performance.measure(name, `${name}_start`, `${name}_end`);
    
    const measure = performance.getEntriesByName(name, 'measure')[0];
    if (measure) {
      document.dispatchEvent(new CustomEvent('performance:metric', {
        detail: {
          name: `measure_${name}`,
          value: measure.duration,
          timestamp: Date.now()
        }
      }));
    }
  }
}

export function initializePerformanceMonitoring(options = {}) {
  const monitor = new PerformanceMonitor({
    enableReporting: process.env.NODE_ENV === 'production',
    ...options
  });
  
  window.PerformanceUtils = PerformanceUtils;
  
  if (process.env.NODE_ENV !== 'production') {
    setTimeout(() => {
      console.table(monitor.getPerformanceSummary());
    }, 5000);
  }
  
  return monitor;
}