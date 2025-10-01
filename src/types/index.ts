// Core application type definitions
export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
    endpoints: {
      login: string;
      contact: string;
      projects: string;
      upload: string;
    };
  };
  features: {
    enableAnalytics: boolean;
    enablePerformanceMonitoring: boolean;
    enableErrorReporting: boolean;
    enableAccessibility: boolean;
  };
  ui: {
    theme: 'light' | 'dark' | 'auto';
    language: 'en' | 'ar';
    rtlSupport: boolean;
  };
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  preferences: UserPreferences;
  lastLogin?: Date;
}

export interface UserPreferences {
  language: 'en' | 'ar';
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    email: boolean;
    push: boolean;
  };
}

export interface Project {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  currency: 'AED' | 'USD';
  type: 'villa' | 'apartment' | 'commercial' | 'land';
  status: 'available' | 'sold' | 'reserved';
  images: ProjectImage[];
  features: string[];
  area: {
    built: number;
    plot?: number;
    unit: 'sqft' | 'sqm';
  };
  contact: ContactInfo;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectImage {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  isPrimary: boolean;
  order: number;
}

export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
}

export interface ContactForm {
  name: string;
  email: string;
  phone: string;
  message: string;
  projectId?: string;
  preferredContact: 'email' | 'phone' | 'whatsapp';
}

export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Component Props Types
export interface ComponentProps {
  className?: string;
  id?: string;
  ariaLabel?: string;
  children?: HTMLElement | HTMLElement[] | string;
}

export interface CarouselProps extends ComponentProps {
  images: ProjectImage[];
  autoplay?: boolean;
  interval?: number;
  showThumbnails?: boolean;
  showIndicators?: boolean;
  rtl?: boolean;
}

export interface ModalProps extends ComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  backdrop?: boolean;
  keyboard?: boolean;
}

export interface CounterProps extends ComponentProps {
  target: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimal?: number;
  startOnVisible?: boolean;
}

export interface FormProps extends ComponentProps {
  onSubmit: (data: any) => void | Promise<void>;
  validation?: ValidationSchema;
  submitText?: string;
  loading?: boolean;
  disabled?: boolean;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: number;
}

export interface ApiError {
  message: string;
  code: number;
  details?: any;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Event Types
export interface CustomEvent<T = any> {
  type: string;
  detail: T;
  timestamp: Date;
}

export interface ComponentEvent extends CustomEvent {
  detail: {
    component: string;
    action: string;
    data?: any;
  };
}

export interface PerformanceEvent extends CustomEvent {
  detail: {
    metric: string;
    value: number;
    metadata?: any;
  };
}

export interface ErrorEvent extends CustomEvent {
  detail: {
    error: Error;
    context?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
  };
}

// Validation Types
export interface ValidationRule {
  type: 'required' | 'email' | 'phone' | 'min' | 'max' | 'pattern';
  value?: any;
  message: string;
}

export interface ValidationSchema {
  [field: string]: ValidationRule[];
}

export interface ValidationResult {
  valid: boolean;
  errors: {
    [field: string]: string[];
  };
}

// Performance Types
export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: Date;
  sessionId: string;
  url: string;
  metadata?: any;
}

export interface WebVitalsMetric {
  name: 'FCP' | 'LCP' | 'FID' | 'CLS' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

export interface PerformanceReport {
  sessionId: string;
  timestamp: Date;
  url: string;
  userAgent: string;
  viewport: {
    width: number;
    height: number;
  };
  connection?: {
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
  };
  metrics: PerformanceMetric[];
}

// Error Handling Types
export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: Date;
  data?: any;
  userId?: string;
  sessionId?: string;
  url?: string;
}

export interface ErrorDetails {
  message: string;
  stack?: string;
  code?: string | number;
  context?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
  timestamp: Date;
}

// Accessibility Types
export interface AccessibilityConfig {
  enableSkipLinks: boolean;
  enableFocusManagement: boolean;
  enableAriaEnhancements: boolean;
  enableKeyboardNavigation: boolean;
  announcePageChanges: boolean;
}

export interface AccessibilityAnnouncement {
  message: string;
  priority: 'polite' | 'assertive';
  timeout?: number;
}

// Language/i18n Types
export interface TranslationData {
  [key: string]: string | TranslationData;
}

export interface LanguageConfig {
  code: 'en' | 'ar';
  name: string;
  direction: 'ltr' | 'rtl';
  flag: string;
}

export interface TranslationFunction {
  (key: string, params?: Record<string, string | number>): string;
}

// Navigation Types
export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  children?: NavigationItem[];
  external?: boolean;
  requiresAuth?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

// Theme Types
export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    error: string;
    warning: string;
    success: string;
    info: string;
  };
  fonts: {
    primary: string;
    secondary: string;
    monospace: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  breakpoints: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

// Global Window Extensions
declare global {
  interface Window {
    CityExpertsApp?: any;
    PerformanceUtils?: any;
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export {}