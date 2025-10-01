// Global type declarations for City Experts Website

interface Window {
  CityExpertsApp?: any;
  PerformanceUtils?: {
    measureFunction: (fn: Function, name: string) => Function;
    measureAsync: (fn: Function, name: string) => Function;
    markStart: (name: string) => void;
    markEnd: (name: string) => void;
  };
  gtag?: (...args: any[]) => void;
  dataLayer?: any[];
}

// Extend HTMLElement to include dataset properties
interface HTMLElement {
  dataset: DOMStringMap & {
    counter?: string;
    counterDuration?: string;
    counterPrefix?: string;
    counterSuffix?: string;
    counterDecimal?: string;
    counterStartOnVisible?: string;
    carousel?: string;
    carouselAutoplay?: string;
    carouselInterval?: string;
    modal?: string;
    modalSize?: string;
    form?: string;
    formValidation?: string;
  };
}

// Custom events
interface DocumentEventMap {
  'component:loaded': CustomEvent<{
    component: string;
    loadTime: number;
  }>;
  'api:response': CustomEvent<{
    endpoint: string;
    duration: number;
    status: number;
  }>;
  'performance:metric': CustomEvent<{
    name: string;
    value: number;
    timestamp: number;
    metadata?: any;
  }>;
  'performance:event': CustomEvent<{
    name: string;
    data: any;
    timestamp: number;
  }>;
  'performance:report': CustomEvent<{
    sessionId: string;
    timestamp: number;
    metrics: any[];
  }>;
  'counter:start': CustomEvent<{
    target: number;
    duration: number;
    element: HTMLElement;
  }>;
  'counter:complete': CustomEvent<{
    target: number;
    duration: number;
    element: HTMLElement;
  }>;
  'carousel:slide': CustomEvent<{
    index: number;
    direction: 'next' | 'prev';
  }>;
  'modal:open': CustomEvent<{
    modal: HTMLElement;
  }>;
  'modal:close': CustomEvent<{
    modal: HTMLElement;
  }>;
  'form:submit': CustomEvent<{
    form: HTMLFormElement;
    data: FormData;
  }>;
  'form:validation': CustomEvent<{
    form: HTMLFormElement;
    valid: boolean;
    errors: Record<string, string[]>;
  }>;
}

// Extend console for better typing
interface Console {
  debug(message?: any, ...optionalParams: any[]): void;
  info(message?: any, ...optionalParams: any[]): void;
  warn(message?: any, ...optionalParams: any[]): void;
  error(message?: any, ...optionalParams: any[]): void;
  table(tabularData: any, properties?: string[]): void;
}

// Performance API extensions
interface Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

// Navigator extensions
interface Navigator {
  connection?: {
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
  };
}

// Module declarations for external libraries
declare module 'web-vitals' {
  interface WebVitalMetric {
    name: string;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    delta: number;
    id: string;
  }

  export function getCLS(callback: (metric: WebVitalMetric) => void): void;
  export function getFID(callback: (metric: WebVitalMetric) => void): void;
  export function getFCP(callback: (metric: WebVitalMetric) => void): void;
  export function getLCP(callback: (metric: WebVitalMetric) => void): void;
  export function getTTFB(callback: (metric: WebVitalMetric) => void): void;
}

declare module 'zod' {
  export * from 'zod/lib/index';
}

// Process environment for Vite
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_ENVIRONMENT: 'development' | 'production' | 'staging';
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_ENABLE_PERFORMANCE_MONITORING: string;
  readonly VITE_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// CSS Module declarations
declare module '*.css' {
  const content: string;
  export default content;
}

declare module '*.scss' {
  const content: string;
  export default content;
}

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// Image declarations
declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

// JSON declarations
declare module '*.json' {
  const content: any;
  export default content;
}

// Export to make this a module
export {};