// Centralized State Management System for City Experts Website
export class StateManager {
  constructor() {
    this.state = new Map();
    this.listeners = new Map();
    this.middleware = [];
    this.history = [];
    this.maxHistorySize = 50;
    
    this.initializeDefaultState();
  }
  
  initializeDefaultState() {
    this.state.set('user', {
      isAuthenticated: false,
      profile: null,
      preferences: {
        language: 'en',
        theme: 'light',
        notifications: {
          email: true,
          push: false
        }
      }
    });
    
    this.state.set('ui', {
      activeModal: null,
      loading: false,
      error: null,
      currentPage: window.location.pathname,
      navigation: {
        isOpen: false,
        activeItem: null
      },
      carousel: {
        currentIndex: 0,
        isPlaying: false
      }
    });
    
    this.state.set('data', {
      projects: [],
      filteredProjects: [],
      currentProject: null,
      filters: {
        type: 'all',
        priceRange: 'all',
        location: 'all'
      }
    });
    
    this.state.set('form', {
      contact: {
        data: {},
        errors: {},
        isSubmitting: false
      },
      login: {
        data: {},
        errors: {},
        isSubmitting: false
      }
    });
    
    this.state.set('performance', {
      metrics: [],
      vitals: {},
      errors: []
    });
  }
  
  // Core state methods
  getState(key) {
    if (key) {
      return this.state.get(key);
    }
    return Object.fromEntries(this.state);
  }
  
  setState(key, value, options = {}) {
    const previousValue = this.state.get(key);
    
    // Apply middleware
    let processedValue = value;
    for (const middleware of this.middleware) {
      processedValue = middleware(key, processedValue, previousValue);
    }
    
    // Update state
    this.state.set(key, processedValue);
    
    // Add to history
    if (!options.skipHistory) {
      this.addToHistory(key, previousValue, processedValue);
    }
    
    // Notify listeners
    this.notifyListeners(key, processedValue, previousValue);
    
    // Persist to localStorage if needed
    if (options.persist) {
      this.persistState(key, processedValue);
    }
    
    console.debug(`State updated: ${key}`, { previous: previousValue, current: processedValue });
  }
  
  updateState(key, updates, options = {}) {
    const currentState = this.getState(key) || {};
    const newState = { ...currentState, ...updates };
    this.setState(key, newState, options);
  }
  
  // Subscription methods
  subscribe(key, listener) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    
    this.listeners.get(key).add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.get(key)?.delete(listener);
    };
  }
  
  unsubscribe(key, listener) {
    this.listeners.get(key)?.delete(listener);
  }
  
  notifyListeners(key, newValue, previousValue) {
    const keyListeners = this.listeners.get(key);
    if (keyListeners) {
      keyListeners.forEach(listener => {
        try {
          listener(newValue, previousValue, key);
        } catch (error) {
          console.error('Error in state listener:', error);
        }
      });
    }
    
    // Notify global listeners
    const globalListeners = this.listeners.get('*');
    if (globalListeners) {
      globalListeners.forEach(listener => {
        try {
          listener(key, newValue, previousValue);
        } catch (error) {
          console.error('Error in global state listener:', error);
        }
      });
    }
  }
  
  // Middleware
  addMiddleware(middleware) {
    this.middleware.push(middleware);
  }
  
  removeMiddleware(middleware) {
    const index = this.middleware.indexOf(middleware);
    if (index > -1) {
      this.middleware.splice(index, 1);
    }
  }
  
  // History management
  addToHistory(key, previousValue, newValue) {
    this.history.push({
      key,
      previousValue,
      newValue,
      timestamp: Date.now()
    });
    
    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }
  
  getHistory() {
    return [...this.history];
  }
  
  clearHistory() {
    this.history = [];
  }
  
  // Persistence
  persistState(key, value) {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(`cityexperts_${key}`, serialized);
    } catch (error) {
      console.error('Failed to persist state:', error);
    }
  }
  
  loadPersistedState(key) {
    try {
      const serialized = localStorage.getItem(`cityexperts_${key}`);
      return serialized ? JSON.parse(serialized) : null;
    } catch (error) {
      console.error('Failed to load persisted state:', error);
      return null;
    }
  }
  
  // Computed state
  computed(key, computation) {
    const computedValue = computation(this.getState());
    
    // Subscribe to state changes and recompute
    this.subscribe('*', () => {
      const newComputedValue = computation(this.getState());
      if (JSON.stringify(newComputedValue) !== JSON.stringify(computedValue)) {
        this.setState(`computed_${key}`, newComputedValue);
      }
    });
    
    this.setState(`computed_${key}`, computedValue);
    return computedValue;
  }
  
  // Action dispatch
  dispatch(action) {
    console.debug('Dispatching action:', action);
    
    switch (action.type) {
      case 'USER_LOGIN':
        this.handleUserLogin(action.payload);
        break;
        
      case 'USER_LOGOUT':
        this.handleUserLogout();
        break;
        
      case 'SET_LANGUAGE':
        this.handleSetLanguage(action.payload);
        break;
        
      case 'SET_THEME':
        this.handleSetTheme(action.payload);
        break;
        
      case 'SHOW_MODAL':
        this.handleShowModal(action.payload);
        break;
        
      case 'HIDE_MODAL':
        this.handleHideModal();
        break;
        
      case 'SET_LOADING':
        this.handleSetLoading(action.payload);
        break;
        
      case 'SET_ERROR':
        this.handleSetError(action.payload);
        break;
        
      case 'CLEAR_ERROR':
        this.handleClearError();
        break;
        
      case 'UPDATE_PROJECTS':
        this.handleUpdateProjects(action.payload);
        break;
        
      case 'FILTER_PROJECTS':
        this.handleFilterProjects(action.payload);
        break;
        
      case 'SET_CURRENT_PROJECT':
        this.handleSetCurrentProject(action.payload);
        break;
        
      case 'UPDATE_FORM':
        this.handleUpdateForm(action.payload);
        break;
        
      case 'SUBMIT_FORM':
        this.handleSubmitForm(action.payload);
        break;
        
      case 'FORM_SUCCESS':
        this.handleFormSuccess(action.payload);
        break;
        
      case 'FORM_ERROR':
        this.handleFormError(action.payload);
        break;
        
      default:
    }
  }
  
  // Action handlers
  handleUserLogin(user) {
    this.updateState('user', {
      isAuthenticated: true,
      profile: user
    }, { persist: true });
  }
  
  handleUserLogout() {
    this.updateState('user', {
      isAuthenticated: false,
      profile: null
    }, { persist: true });
    
    // Clear sensitive data
    localStorage.removeItem('cityexperts_user');
  }
  
  handleSetLanguage(language) {
    this.updateState('user', {
      preferences: {
        ...this.getState('user').preferences,
        language
      }
    }, { persist: true });
    
    // Trigger language change event
    document.dispatchEvent(new CustomEvent('state:language-changed', {
      detail: { language }
    }));
  }
  
  handleSetTheme(theme) {
    this.updateState('user', {
      preferences: {
        ...this.getState('user').preferences,
        theme
      }
    }, { persist: true });
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
  }
  
  handleShowModal(modal) {
    this.updateState('ui', {
      activeModal: modal
    });
  }
  
  handleHideModal() {
    this.updateState('ui', {
      activeModal: null
    });
  }
  
  handleSetLoading(loading) {
    this.updateState('ui', { loading });
  }
  
  handleSetError(error) {
    this.updateState('ui', { error });
  }
  
  handleClearError() {
    this.updateState('ui', { error: null });
  }
  
  handleUpdateProjects(projects) {
    this.setState('data', {
      ...this.getState('data'),
      projects,
      filteredProjects: this.filterProjects(projects, this.getState('data').filters)
    });
  }
  
  handleFilterProjects(filters) {
    const projects = this.getState('data').projects;
    this.updateState('data', {
      filters,
      filteredProjects: this.filterProjects(projects, filters)
    });
  }
  
  handleSetCurrentProject(project) {
    this.updateState('data', {
      currentProject: project
    });
  }
  
  handleUpdateForm({ formType, field, value }) {
    const currentForm = this.getState('form')[formType] || {};
    this.updateState('form', {
      [formType]: {
        ...currentForm,
        data: {
          ...currentForm.data,
          [field]: value
        }
      }
    });
  }
  
  handleSubmitForm({ formType }) {
    const currentForm = this.getState('form')[formType] || {};
    this.updateState('form', {
      [formType]: {
        ...currentForm,
        isSubmitting: true,
        errors: {}
      }
    });
  }
  
  handleFormSuccess({ formType }) {
    const currentForm = this.getState('form')[formType] || {};
    this.updateState('form', {
      [formType]: {
        ...currentForm,
        isSubmitting: false,
        data: {},
        errors: {}
      }
    });
  }
  
  handleFormError({ formType, errors }) {
    const currentForm = this.getState('form')[formType] || {};
    this.updateState('form', {
      [formType]: {
        ...currentForm,
        isSubmitting: false,
        errors
      }
    });
  }
  
  // Utility methods
  filterProjects(projects, filters) {
    return projects.filter(project => {
      if (filters.type !== 'all' && project.type !== filters.type) {
        return false;
      }
      
      if (filters.location !== 'all' && !project.location.toLowerCase().includes(filters.location)) {
        return false;
      }
      
      if (filters.priceRange !== 'all') {
        const price = project.price;
        switch (filters.priceRange) {
          case 'low':
            return price < 1000000;
          case 'medium':
            return price >= 1000000 && price < 5000000;
          case 'high':
            return price >= 5000000;
          default:
            return true;
        }
      }
      
      return true;
    });
  }
  
  // Debug methods
  debug() {
    console.group('State Manager Debug');
    console.groupEnd();
  }
  
  reset() {
    this.state.clear();
    this.listeners.clear();
    this.middleware = [];
    this.history = [];
    this.initializeDefaultState();
  }
}

// Action creators
export const actions = {
  login: (user) => ({ type: 'USER_LOGIN', payload: user }),
  logout: () => ({ type: 'USER_LOGOUT' }),
  setLanguage: (language) => ({ type: 'SET_LANGUAGE', payload: language }),
  setTheme: (theme) => ({ type: 'SET_THEME', payload: theme }),
  showModal: (modal) => ({ type: 'SHOW_MODAL', payload: modal }),
  hideModal: () => ({ type: 'HIDE_MODAL' }),
  setLoading: (loading) => ({ type: 'SET_LOADING', payload: loading }),
  setError: (error) => ({ type: 'SET_ERROR', payload: error }),
  clearError: () => ({ type: 'CLEAR_ERROR' }),
  updateProjects: (projects) => ({ type: 'UPDATE_PROJECTS', payload: projects }),
  filterProjects: (filters) => ({ type: 'FILTER_PROJECTS', payload: filters }),
  setCurrentProject: (project) => ({ type: 'SET_CURRENT_PROJECT', payload: project }),
  updateForm: (formType, field, value) => ({ 
    type: 'UPDATE_FORM', 
    payload: { formType, field, value } 
  }),
  submitForm: (formType) => ({ type: 'SUBMIT_FORM', payload: { formType } }),
  formSuccess: (formType) => ({ type: 'FORM_SUCCESS', payload: { formType } }),
  formError: (formType, errors) => ({ type: 'FORM_ERROR', payload: { formType, errors } })
};

// Middleware examples
export const loggingMiddleware = (key, value, previousValue) => {
  return value;
};

export const validationMiddleware = (key, value, previousValue) => {
  // Add validation logic here
  if (key === 'user' && value.preferences && value.preferences.language) {
    const validLanguages = ['en', 'ar'];
    if (!validLanguages.includes(value.preferences.language)) {
      return {
        ...value,
        preferences: {
          ...value.preferences,
          language: 'en'
        }
      };
    }
  }
  
  return value;
};

// Create singleton instance
let stateManagerInstance = null;

export function getStateManager() {
  if (!stateManagerInstance) {
    stateManagerInstance = new StateManager();
  }
  return stateManagerInstance;
}

export function initializeStateManager(options = {}) {
  const manager = getStateManager();
  
  // Add default middleware
  if (options.enableLogging !== false) {
    manager.addMiddleware(loggingMiddleware);
  }
  
  if (options.enableValidation !== false) {
    manager.addMiddleware(validationMiddleware);
  }
  
  // Load persisted state
  const userState = manager.loadPersistedState('user');
  if (userState) {
    manager.setState('user', userState, { skipHistory: true });
  }
  
  // Set up global listeners
  manager.subscribe('*', (key, newValue, previousValue) => {
    document.dispatchEvent(new CustomEvent('state:changed', {
      detail: { key, newValue, previousValue }
    }));
  });
  
  // Expose to window for debugging
  if (process.env.NODE_ENV !== 'production') {
    window.StateManager = manager;
  }
  
  return manager;
}

export default StateManager;