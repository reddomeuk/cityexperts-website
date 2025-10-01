// State management hooks for easy component integration
import { getStateManager } from './state-manager.js';

export class StateHooks {
  constructor() {
    this.stateManager = getStateManager();
    this.subscriptions = new Set();
  }

  // Hook for subscribing to state changes
  useState(key, initialValue = null) {
    let currentValue = this.stateManager.getState(key) ?? initialValue;
    const listeners = new Set();

    // Subscribe to state changes
    const unsubscribe = this.stateManager.subscribe(key, (newValue) => {
      currentValue = newValue;
      listeners.forEach(listener => listener(newValue));
    });

    // Track subscription for cleanup
    this.subscriptions.add(unsubscribe);

    return [
      () => currentValue, // getter
      (newValue) => { // setter
        this.stateManager.setState(key, newValue);
      },
      (listener) => { // subscribe to changes
        listeners.add(listener);
        return () => listeners.delete(listener);
      }
    ];
  }

  // Hook for dispatching actions
  useDispatch() {
    return (action) => this.stateManager.dispatch(action);
  }

  // Hook for computed values
  useComputed(key, computation) {
    return this.stateManager.computed(key, computation);
  }

  // Hook for form state management
  useForm(formType) {
    const [getFormState, setFormState, subscribeToForm] = this.useState(`form.${formType}`, {
      data: {},
      errors: {},
      isSubmitting: false
    });

    const dispatch = this.useDispatch();

    return {
      data: getFormState()?.data || {},
      errors: getFormState()?.errors || {},
      isSubmitting: getFormState()?.isSubmitting || false,
      
      updateField: (field, value) => {
        dispatch({
          type: 'UPDATE_FORM',
          payload: { formType, field, value }
        });
      },
      
      submit: () => {
        dispatch({
          type: 'SUBMIT_FORM',
          payload: { formType }
        });
      },
      
      setErrors: (errors) => {
        dispatch({
          type: 'FORM_ERROR',
          payload: { formType, errors }
        });
      },
      
      reset: () => {
        dispatch({
          type: 'FORM_SUCCESS',
          payload: { formType }
        });
      },

      subscribe: subscribeToForm
    };
  }

  // Hook for user authentication state
  useAuth() {
    const [getUser, setUser, subscribeToUser] = this.useState('user');
    const dispatch = this.useDispatch();

    return {
      user: getUser(),
      isAuthenticated: getUser()?.isAuthenticated || false,
      
      login: (userData) => {
        dispatch({
          type: 'USER_LOGIN',
          payload: userData
        });
      },
      
      logout: () => {
        dispatch({
          type: 'USER_LOGOUT'
        });
      },
      
      updatePreferences: (preferences) => {
        const currentUser = getUser();
        setUser({
          ...currentUser,
          preferences: {
            ...currentUser.preferences,
            ...preferences
          }
        });
      },

      subscribe: subscribeToUser
    };
  }

  // Hook for UI state management
  useUI() {
    const [getUI, setUI, subscribeToUI] = this.useState('ui');
    const dispatch = this.useDispatch();

    return {
      ...getUI(),
      
      showModal: (modal) => {
        dispatch({
          type: 'SHOW_MODAL',
          payload: modal
        });
      },
      
      hideModal: () => {
        dispatch({
          type: 'HIDE_MODAL'
        });
      },
      
      setLoading: (loading) => {
        dispatch({
          type: 'SET_LOADING',
          payload: loading
        });
      },
      
      setError: (error) => {
        dispatch({
          type: 'SET_ERROR',
          payload: error
        });
      },
      
      clearError: () => {
        dispatch({
          type: 'CLEAR_ERROR'
        });
      },

      subscribe: subscribeToUI
    };
  }

  // Hook for project data management
  useProjects() {
    const [getData, setData, subscribeToData] = this.useState('data');
    const dispatch = this.useDispatch();

    return {
      projects: getData()?.projects || [],
      filteredProjects: getData()?.filteredProjects || [],
      currentProject: getData()?.currentProject || null,
      filters: getData()?.filters || {},
      
      updateProjects: (projects) => {
        dispatch({
          type: 'UPDATE_PROJECTS',
          payload: projects
        });
      },
      
      filterProjects: (filters) => {
        dispatch({
          type: 'FILTER_PROJECTS',
          payload: filters
        });
      },
      
      setCurrentProject: (project) => {
        dispatch({
          type: 'SET_CURRENT_PROJECT',
          payload: project
        });
      },

      subscribe: subscribeToData
    };
  }

  // Hook for language/localization
  useLanguage() {
    const [getUser, setUser, subscribeToUser] = this.useState('user');
    const dispatch = this.useDispatch();

    return {
      language: getUser()?.preferences?.language || 'en',
      
      setLanguage: (language) => {
        dispatch({
          type: 'SET_LANGUAGE',
          payload: language
        });
      },

      subscribe: subscribeToUser
    };
  }

  // Hook for theme management
  useTheme() {
    const [getUser, setUser, subscribeToUser] = this.useState('user');
    const dispatch = this.useDispatch();

    return {
      theme: getUser()?.preferences?.theme || 'light',
      
      setTheme: (theme) => {
        dispatch({
          type: 'SET_THEME',
          payload: theme
        });
      },

      subscribe: subscribeToUser
    };
  }

  // Cleanup all subscriptions
  cleanup() {
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions.clear();
  }
}

// Factory function for creating hooks instance
export function createStateHooks() {
  return new StateHooks();
}

// Utility for creating stateful components
export function withState(ComponentClass) {
  return class StatefulComponent extends ComponentClass {
    constructor(...args) {
      super(...args);
      this.hooks = createStateHooks();
    }

    destroy() {
      if (this.hooks) {
        this.hooks.cleanup();
      }
      if (super.destroy) {
        super.destroy();
      }
    }
  };
}

// Reactive component binding utility
export function bindStateToElement(element, stateKey, callback) {
  const stateManager = getStateManager();
  
  const unsubscribe = stateManager.subscribe(stateKey, (newValue, previousValue) => {
    callback(element, newValue, previousValue);
  });

  // Auto-cleanup when element is removed
  if (element && 'addEventListener' in element) {
    const cleanup = () => {
      unsubscribe();
      element.removeEventListener('disconnect', cleanup);
    };
    
    element.addEventListener('disconnect', cleanup);
  }

  return unsubscribe;
}

// Auto-binding for common UI elements
export function autoBindState() {
  // Bind elements with data-state attributes
  document.querySelectorAll('[data-state]').forEach(element => {
    const stateKey = element.dataset.state;
    const property = element.dataset.stateProperty || 'textContent';
    const transform = element.dataset.stateTransform;

    bindStateToElement(element, stateKey, (el, value) => {
      let displayValue = value;
      
      // Apply transform if specified
      if (transform) {
        try {
          displayValue = new Function('value', `return ${transform}`)(value);
        } catch (error) {
          console.error('State transform error:', error);
        }
      }
      
      // Update element property
      if (property in el) {
        el[property] = displayValue;
      } else {
        el.setAttribute(property, displayValue);
      }
    });
  });

  // Bind form inputs with data-form attributes
  document.querySelectorAll('[data-form]').forEach(element => {
    const formType = element.dataset.form;
    const field = element.dataset.field || element.name || element.id;
    
    if (formType && field) {
      const hooks = createStateHooks();
      const form = hooks.useForm(formType);
      
      // Set initial value
      element.value = form.data[field] || '';
      
      // Listen for input changes
      element.addEventListener('input', (e) => {
        form.updateField(field, e.target.value);
      });
      
      // Listen for state changes
      form.subscribe((formState) => {
        if (formState.data[field] !== element.value) {
          element.value = formState.data[field] || '';
        }
        
        // Handle validation errors
        const errorElement = document.querySelector(`[data-error="${formType}.${field}"]`);
        if (errorElement) {
          errorElement.textContent = formState.errors[field] || '';
          errorElement.style.display = formState.errors[field] ? 'block' : 'none';
        }
      });
    }
  });

}

export default StateHooks;