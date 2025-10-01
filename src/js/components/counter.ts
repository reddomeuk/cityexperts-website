export interface CounterOptions {
  target: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimal?: number;
  startOnVisible?: boolean;
  easing?: 'linear' | 'easeInOut' | 'easeOut';
  onComplete?: () => void;
  onUpdate?: (value: number) => void;
}

export class Counter {
  private element: HTMLElement;
  private options: Required<CounterOptions>;
  private currentValue: number = 0;
  private startTime: number = 0;
  private animationId: number | null = null;
  private observer: IntersectionObserver | null = null;
  private isStarted: boolean = false;
  private isCompleted: boolean = false;

  constructor(element: HTMLElement, options: CounterOptions) {
    this.element = element;
    this.options = {
      duration: 2000,
      prefix: '',
      suffix: '',
      decimal: 0,
      startOnVisible: true,
      easing: 'easeInOut',
      onComplete: () => {},
      onUpdate: () => {},
      ...options
    };

    this.init();
  }

  private init(): void {
    // Validate target
    if (typeof this.options.target !== 'number' || isNaN(this.options.target)) {
      throw new Error('Counter target must be a valid number');
    }

    // Set initial value
    this.updateDisplay(0);

    // Set up intersection observer if needed
    if (this.options.startOnVisible) {
      this.setupIntersectionObserver();
    } else {
      this.start();
    }

    // Add ARIA attributes
    this.setupAccessibility();
  }

  private setupAccessibility(): void {
    this.element.setAttribute('role', 'status');
    this.element.setAttribute('aria-live', 'polite');
    this.element.setAttribute('aria-label', `Counter: ${this.options.target}`);
  }

  private setupIntersectionObserver(): void {
    if (!('IntersectionObserver' in window)) {
      this.start();
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.isStarted) {
            this.start();
          }
        });
      },
      { threshold: 0.5 }
    );

    this.observer.observe(this.element);
  }

  private easeInOut(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  private easeOut(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }

  private getEasingValue(progress: number): number {
    switch (this.options.easing) {
      case 'linear':
        return progress;
      case 'easeOut':
        return this.easeOut(progress);
      case 'easeInOut':
      default:
        return this.easeInOut(progress);
    }
  }

  private animate(currentTime: number): void {
    if (!this.startTime) {
      this.startTime = currentTime;
    }

    const elapsed = currentTime - this.startTime;
    const progress = Math.min(elapsed / this.options.duration, 1);
    const easedProgress = this.getEasingValue(progress);
    
    this.currentValue = easedProgress * this.options.target;
    this.updateDisplay(this.currentValue);
    
    // Call update callback
    this.options.onUpdate(this.currentValue);

    if (progress < 1) {
      this.animationId = requestAnimationFrame((time) => this.animate(time));
    } else {
      this.complete();
    }
  }

  private updateDisplay(value: number): void {
    const formattedValue = this.formatValue(value);
    this.element.textContent = `${this.options.prefix}${formattedValue}${this.options.suffix}`;
  }

  private formatValue(value: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: this.options.decimal,
      maximumFractionDigits: this.options.decimal,
    }).format(value);
  }

  private complete(): void {
    this.isCompleted = true;
    this.currentValue = this.options.target;
    this.updateDisplay(this.currentValue);
    
    // Update ARIA label
    this.element.setAttribute('aria-label', `Counter completed: ${this.options.target}`);
    
    // Call completion callback
    this.options.onComplete();

    // Dispatch completion event
    this.element.dispatchEvent(new CustomEvent('counter:complete', {
      detail: {
        target: this.options.target,
        duration: this.options.duration,
        element: this.element
      }
    }));
  }

  public start(): void {
    if (this.isStarted || this.isCompleted) return;

    this.isStarted = true;
    this.startTime = 0;

    // Dispatch start event
    this.element.dispatchEvent(new CustomEvent('counter:start', {
      detail: {
        target: this.options.target,
        duration: this.options.duration,
        element: this.element
      }
    }));

    this.animationId = requestAnimationFrame((time) => this.animate(time));
  }

  public pause(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public resume(): void {
    if (!this.isCompleted && this.isStarted && !this.animationId) {
      this.animationId = requestAnimationFrame((time) => this.animate(time));
    }
  }

  public reset(): void {
    this.pause();
    this.isStarted = false;
    this.isCompleted = false;
    this.currentValue = 0;
    this.startTime = 0;
    this.updateDisplay(0);
    
    // Reset ARIA label
    this.element.setAttribute('aria-label', `Counter: ${this.options.target}`);
  }

  public destroy(): void {
    this.pause();
    
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    // Remove ARIA attributes
    this.element.removeAttribute('role');
    this.element.removeAttribute('aria-live');
    this.element.removeAttribute('aria-label');
  }

  // Getters
  public get value(): number {
    return this.currentValue;
  }

  public get target(): number {
    return this.options.target;
  }

  public get isAnimating(): boolean {
    return this.animationId !== null;
  }

  public get progress(): number {
    return this.currentValue / this.options.target;
  }
}

// Factory function for creating counter instances
export function createCounter(
  element: HTMLElement | string,
  options: CounterOptions
): Counter {
  const el = typeof element === 'string' 
    ? document.querySelector(element) as HTMLElement
    : element;

  if (!el) {
    throw new Error('Counter element not found');
  }

  return new Counter(el, options);
}

// Initialize all counters on page
export function initializeCounters(selector: string = '[data-counter]'): Counter[] {
  const elements = document.querySelectorAll(selector) as NodeListOf<HTMLElement>;
  const counters: Counter[] = [];

  elements.forEach((element) => {
    const target = parseFloat(element.dataset['counter'] || '0');
    const duration = parseInt(element.dataset['counterDuration'] || '2000');
    const prefix = element.dataset['counterPrefix'] || '';
    const suffix = element.dataset['counterSuffix'] || '';
    const decimal = parseInt(element.dataset['counterDecimal'] || '0');
    const startOnVisible = element.dataset['counterStartOnVisible'] !== 'false';

    if (!isNaN(target)) {
      const counter = createCounter(element, {
        target,
        duration,
        prefix,
        suffix,
        decimal,
        startOnVisible
      });

      counters.push(counter);
    }
  });

  return counters;
}

export default Counter;