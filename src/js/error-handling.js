// Comprehensive Error Handling and Logging System
export class Logger {
  constructor(options = {}) {
    this.options = {
      level: 'info', // debug, info, warn, error
      enableConsole: true,
      enableRemote: false,
      remoteEndpoint: '/api/logs',
      maxRetries: 3,
      bufferSize: 100,
      sessionId: this.generateSessionId(),
      ...options
    };
    
    this.logBuffer = [];
    this.retryCount = 0;
    this.levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    
    this.init();
  }
  
  init() {
    // Set up global error handlers
    this.setupGlobalErrorHandlers();
    
    // Set up periodic log flushing
    if (this.options.enableRemote) {
      setInterval(() => this.flushLogs(), 30000); // Flush every 30 seconds
    }
    
    // Clean up on page unload
    window.addEventListener('beforeunload', () => this.flushLogs());
    
  }
  
  setupGlobalErrorHandlers() {
    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.error('JavaScript Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      });
    });
    
    // Promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled Promise Rejection', {
        reason: event.reason,
        promise: event.promise,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        stack: event.reason?.stack || 'No stack trace available'
      });
    });
    
    // Network errors
    this.setupNetworkErrorHandling();
    
    // Performance errors
    this.setupPerformanceMonitoring();
  }
  
  setupNetworkErrorHandling() {
    // Monitor fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Log slow requests
        if (duration > 5000) {
          this.warn('Slow Network Request', {
            url: args[0],
            duration: Math.round(duration),
            status: response.status,
            timestamp: new Date().toISOString()
          });
        }
        
        // Log failed requests
        if (!response.ok) {
          this.error('Network Request Failed', {
            url: args[0],
            status: response.status,
            statusText: response.statusText,
            duration: Math.round(duration),
            timestamp: new Date().toISOString()
          });
        }
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.error('Network Request Error', {
          url: args[0],
          error: error.message,
          duration: Math.round(duration),
          timestamp: new Date().toISOString(),
          stack: error.stack
        });
        
        throw error;
      }
    };
  }
  
  setupPerformanceMonitoring() {
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      // Check if 'longtask' entry type is supported
      if (PerformanceObserver.supportedEntryTypes?.includes('longtask')) {
        try {
          const longTaskObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.duration > 50) { // Long task threshold
                this.warn('Long Task Detected', {
                  duration: Math.round(entry.duration),
                  startTime: Math.round(entry.startTime),
                  name: entry.name,
                  timestamp: new Date().toISOString()
                });
              }
            }
          });
          
          longTaskObserver.observe({ entryTypes: ['longtask'] });
        } catch (error) {
          this.debug('Failed to setup longtask observer:', error);
        }
      } else {
        this.debug('longtask entry type not supported in this browser');
      }
      
      // Check if 'layout-shift' entry type is supported
      if (PerformanceObserver.supportedEntryTypes?.includes('layout-shift')) {
        try {
          const clsObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.value > 0.1) { // CLS threshold
                this.warn('Layout Shift Detected', {
                  value: entry.value,
                  hadRecentInput: entry.hadRecentInput,
                  timestamp: new Date().toISOString(),
                  sources: entry.sources?.map(s => ({
                    node: s.node?.tagName,
                    currentRect: s.currentRect,
                    previousRect: s.previousRect
                  }))
                });
              }
            }
          });
          
          clsObserver.observe({ entryTypes: ['layout-shift'] });
        } catch (error) {
          this.debug('Failed to setup layout-shift observer:', error);
        }
      } else {
        this.debug('layout-shift entry type not supported in this browser');
      }
    }
  }
  
  // Logging methods
  debug(message, data = {}) {
    this.log('debug', message, data);
  }
  
  info(message, data = {}) {
    this.log('info', message, data);
  }
  
  warn(message, data = {}) {
    this.log('warn', message, data);
  }
  
  error(message, data = {}) {
    this.log('error', message, data);
  }
  
  log(level, message, data = {}) {
    const logLevel = this.levels[level] || 0;
    const currentLevel = this.levels[this.options.level] || 0;
    
    if (logLevel < currentLevel) return;
    
    const logEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      sessionId: this.options.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
    
    // Console logging
    if (this.options.enableConsole) {
      this.logToConsole(level, message, data);
    }
    
    // Buffer for remote logging
    if (this.options.enableRemote) {
      this.logBuffer.push(logEntry);
      
      if (this.logBuffer.length >= this.options.bufferSize) {
        this.flushLogs();
      }
    }
    
    // Dispatch custom event for other systems to listen
    document.dispatchEvent(new CustomEvent('logger:entry', {
      detail: logEntry
    }));
  }
  
  logToConsole(level, message, data) {
    const emoji = {
      debug: '🐛',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌'
    }[level] || '';
    
    const consoleMethod = level === 'error' ? 'error' : 
                         level === 'warn' ? 'warn' : 
                         level === 'debug' ? 'debug' : 'log';
    
    if (Object.keys(data).length > 0) {
      console[consoleMethod](`${emoji} ${message}`, data);
    } else {
      console[consoleMethod](`${emoji} ${message}`);
    }
  }
  
  async flushLogs() {
    if (this.logBuffer.length === 0) return;
    
    const logsToSend = [...this.logBuffer];
    this.logBuffer = [];
    
    try {
      const response = await fetch(this.options.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logs: logsToSend,
          sessionId: this.options.sessionId
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      this.retryCount = 0;
    } catch (error) {
      this.retryCount++;
      
      if (this.retryCount <= this.options.maxRetries) {
        // Re-add logs to buffer for retry
        this.logBuffer.unshift(...logsToSend);
        
        // Retry with exponential backoff
        setTimeout(() => this.flushLogs(), Math.pow(2, this.retryCount) * 1000);
      } else {
        console.error('Failed to send logs after max retries:', error);
        this.retryCount = 0;
      }
    }
  }
  
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Utility methods
  setLevel(level) {
    this.options.level = level;
  }
  
  getSessionId() {
    return this.options.sessionId;
  }
  
  getUserContext() {
    return {
      sessionId: this.options.sessionId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      language: navigator.language,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth
      },
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt
      } : null
    };
  }
}

// Error Handler Class
export class ErrorHandler {
  constructor(logger) {
    this.logger = logger;
    this.errorCounts = new Map();
    this.suppressedErrors = new Set();
    
    this.init();
  }
  
  init() {
    // Component-specific error handling
    this.setupComponentErrorHandling();
    
    // API error handling
    this.setupAPIErrorHandling();
    
    // Form error handling
    this.setupFormErrorHandling();
    
  }
  
  setupComponentErrorHandling() {
    // Listen for component errors
    document.addEventListener('component:error', (e) => {
      const { component, error, context } = e.detail;
      
      this.handleComponentError(component, error, context);
    });
    
    // Carousel errors
    document.addEventListener('carousel:error', (e) => {
      this.handleComponentError('carousel', e.detail.error, e.detail);
    });
    
    // Modal errors
    document.addEventListener('modal:error', (e) => {
      this.handleComponentError('modal', e.detail.error, e.detail);
    });
    
    // Form errors
    document.addEventListener('form:error', (e) => {
      this.handleComponentError('form', e.detail.error, e.detail);
    });
  }
  
  setupAPIErrorHandling() {
    // Listen for API errors
    document.addEventListener('api:error', (e) => {
      const { endpoint, error, response, context } = e.detail;
      
      this.handleAPIError(endpoint, error, response, context);
    });
  }
  
  setupFormErrorHandling() {
    // Listen for form validation errors
    document.addEventListener('field:error', (e) => {
      const { field, message, element } = e.detail;
      
      this.handleFieldError(field, message, element);
    });
  }
  
  handleComponentError(component, error, context = {}) {
    const errorKey = `${component}:${error.message}`;
    
    // Track error frequency
    const count = (this.errorCounts.get(errorKey) || 0) + 1;
    this.errorCounts.set(errorKey, count);
    
    // Suppress repeated errors
    if (count > 5 && !this.suppressedErrors.has(errorKey)) {
      this.suppressedErrors.add(errorKey);
      this.logger.warn('Error suppressed due to high frequency', {
        component,
        error: error.message,
        count,
        context
      });
      return;
    }
    
    if (count <= 5) {
      this.logger.error(`Component Error: ${component}`, {
        error: error.message,
        stack: error.stack,
        context,
        count
      });
    }
    
    // Attempt recovery based on component type
    this.attemptRecovery(component, error, context);
  }
  
  handleAPIError(endpoint, error, response, context = {}) {
    const errorData = {
      endpoint,
      error: error.message,
      status: response?.status,
      statusText: response?.statusText,
      context
    };
    
    if (response?.status >= 500) {
      this.logger.error('Server Error', errorData);
    } else if (response?.status >= 400) {
      this.logger.warn('Client Error', errorData);
    } else {
      this.logger.error('Network Error', errorData);
    }
    
    // Show user-friendly error message
    this.showUserError(this.getErrorMessage(response?.status, error));
  }
  
  handleFieldError(field, message, element) {
    this.logger.debug('Field Validation Error', {
      field,
      message,
      elementType: element.tagName,
      value: element.value
    });
  }
  
  attemptRecovery(component, error, context) {
    switch (component) {
      case 'carousel':
        this.recoverCarousel(context);
        break;
      case 'modal':
        this.recoverModal(context);
        break;
      case 'form':
        this.recoverForm(context);
        break;
      default:
        this.logger.debug(`No recovery strategy for component: ${component}`);
    }
  }
  
  recoverCarousel(context) {
    // Reset carousel to first slide
    if (context.element && context.element._carouselInstance) {
      try {
        context.element._carouselInstance.goToSlide(0, false);
        this.logger.info('Carousel recovered: Reset to first slide');
      } catch (error) {
        this.logger.error('Carousel recovery failed', { error: error.message });
      }
    }
  }
  
  recoverModal(context) {
    // Force close modal
    if (context.element && context.element._modalInstance) {
      try {
        context.element._modalInstance.close();
        this.logger.info('Modal recovered: Force closed');
      } catch (error) {
        this.logger.error('Modal recovery failed', { error: error.message });
      }
    }
  }
  
  recoverForm(context) {
    // Clear form errors
    if (context.element && context.element._formInstance) {
      try {
        context.element._formInstance.clearAllErrors();
        this.logger.info('Form recovered: Errors cleared');
      } catch (error) {
        this.logger.error('Form recovery failed', { error: error.message });
      }
    }
  }
  
  getErrorMessage(status, error) {
    const messages = {
      400: 'Invalid request. Please check your input and try again.',
      401: 'Authentication required. Please log in.',
      403: 'Access denied. You don\'t have permission for this action.',
      404: 'The requested resource was not found.',
      429: 'Too many requests. Please wait a moment and try again.',
      500: 'Server error. We\'re working to fix this issue.',
      502: 'Service temporarily unavailable. Please try again later.',
      503: 'Service temporarily unavailable. Please try again later.'
    };
    
    return messages[status] || 'An unexpected error occurred. Please try again.';
  }
  
  showUserError(message) {
    // Create or update error notification
    let errorNotification = document.querySelector('#error-notification');
    
    if (!errorNotification) {
      errorNotification = document.createElement('div');
      errorNotification.id = 'error-notification';
      errorNotification.className = 'error-notification';
      errorNotification.setAttribute('role', 'alert');
      errorNotification.setAttribute('aria-live', 'assertive');
      
      document.body.appendChild(errorNotification);
    }
    
    errorNotification.textContent = message;
    errorNotification.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      errorNotification.style.display = 'none';
    }, 5000);
  }
  
  // Public methods
  reportError(component, error, context = {}) {
    document.dispatchEvent(new CustomEvent('component:error', {
      detail: { component, error, context }
    }));
  }
  
  reportAPIError(endpoint, error, response, context = {}) {
    document.dispatchEvent(new CustomEvent('api:error', {
      detail: { endpoint, error, response, context }
    }));
  }
  
  getErrorStats() {
    return {
      errorCounts: Object.fromEntries(this.errorCounts),
      suppressedErrors: Array.from(this.suppressedErrors),
      sessionId: this.logger.getSessionId()
    };
  }
}

// Initialize error handling and logging
export function initializeErrorHandling() {
  const logger = new Logger({
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    enableConsole: true,
    enableRemote: process.env.NODE_ENV === 'production'
  });
  
  const errorHandler = new ErrorHandler(logger);
  
  // Add error notification styles
  if (!document.querySelector('#error-notification-styles')) {
    const styles = document.createElement('style');
    styles.id = 'error-notification-styles';
    styles.textContent = `
      .error-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc3545;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        max-width: 400px;
        display: none;
        font-size: 14px;
        line-height: 1.4;
      }
      
      @media (max-width: 480px) {
        .error-notification {
          left: 20px;
          right: 20px;
          max-width: none;
        }
      }
    `;
    document.head.appendChild(styles);
  }
  
  
  return { logger, errorHandler };
}