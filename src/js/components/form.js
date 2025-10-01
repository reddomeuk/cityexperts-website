// Form Component - Enhanced form handling with validation and accessibility
export class Form {
  constructor(element, options = {}) {
    this.form = element;
    this.options = {
      validateOnInput: true,
      validateOnBlur: true,
      showSuccessMessages: true,
      submitViaAjax: false,
      resetOnSuccess: false,
      ...options
    };
    
    this.fields = new Map();
    this.validators = new Map();
    this.isSubmitting = false;
    
    this.init();
  }
  
  init() {
    if (!this.form) return;
    
    this.setupFields();
    this.bindEvents();
    this.setupValidation();
    
  }
  
  setupFields() {
    const inputs = this.form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      const fieldData = {
        element: input,
        errorElement: this.findErrorElement(input),
        isValid: true,
        rules: this.parseValidationRules(input)
      };
      
      this.fields.set(input.name || input.id, fieldData);
      
      if (input.hasAttribute('required')) {
        this.markAsRequired(input);
      }
    });
  }
  
  parseValidationRules(input) {
    const rules = [];
    
    if (input.hasAttribute('required')) {
      rules.push({ type: 'required', message: 'This field is required' });
    }
    
    if (input.type === 'email') {
      rules.push({ type: 'email', message: 'Please enter a valid email address' });
    }
    
    return rules;
  }
  
  bindEvents() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    this.fields.forEach((fieldData, fieldName) => {
      const input = fieldData.element;
      
      if (this.options.validateOnInput) {
        input.addEventListener('input', () => this.validateField(fieldName));
      }
      
      if (this.options.validateOnBlur) {
        input.addEventListener('blur', () => this.validateField(fieldName));
      }
    });
  }
  
  setupValidation() {
    this.validators.set('required', (value) => {
      return value.trim().length > 0;
    });
    
    this.validators.set('email', (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return !value || emailRegex.test(value);
    });
  }
  
  validateField(fieldName) {
    const fieldData = this.fields.get(fieldName);
    if (!fieldData) return true;
    
    const input = fieldData.element;
    const value = input.value;
    let isValid = true;
    let errorMessage = '';
    
    for (const rule of fieldData.rules) {
      const validator = this.validators.get(rule.type);
      if (validator && !validator(value, rule)) {
        isValid = false;
        errorMessage = rule.message;
        break;
      }
    }
    
    fieldData.isValid = isValid;
    
    if (isValid) {
      this.clearFieldError(fieldName);
    } else {
      this.showFieldError(fieldName, errorMessage);
    }
    
    return isValid;
  }
  
  showFieldError(fieldName, message) {
    const fieldData = this.fields.get(fieldName);
    if (!fieldData) return;
    
    const input = fieldData.element;
    const errorElement = fieldData.errorElement;
    
    input.classList.add('error', 'input-error');
    input.setAttribute('aria-invalid', 'true');
    
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }
  
  clearFieldError(fieldName) {
    const fieldData = this.fields.get(fieldName);
    if (!fieldData) return;
    
    const input = fieldData.element;
    const errorElement = fieldData.errorElement;
    
    input.classList.remove('error', 'input-error');
    input.setAttribute('aria-invalid', 'false');
    
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
  }
  
  async handleSubmit(e) {
    e.preventDefault();
    
    if (this.isSubmitting) return;
    
    const isValid = this.validateForm();
    if (!isValid) return;
    
    this.isSubmitting = true;
    
    try {
      if (this.options.submitViaAjax) {
        await this.submitViaAjax();
      } else {
        this.form.submit();
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      this.isSubmitting = false;
    }
  }
  
  validateForm() {
    let isFormValid = true;
    
    this.fields.forEach((fieldData, fieldName) => {
      const fieldValid = this.validateField(fieldName);
      if (!fieldValid) {
        isFormValid = false;
      }
    });
    
    return isFormValid;
  }
  
  findErrorElement(input) {
    const fieldId = input.id || input.name;
    
    let errorElement = this.form.querySelector(`[data-error-for="${fieldId}"]`);
    
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'field-error';
      errorElement.style.display = 'none';
      
      const wrapper = input.closest('.field-wrapper, .form-group') || input.parentNode;
      wrapper.appendChild(errorElement);
    }
    
    return errorElement;
  }
  
  markAsRequired(input) {
    const label = this.form.querySelector(`label[for="${input.id}"]`);
    if (label && !label.querySelector('.required-indicator')) {
      const indicator = document.createElement('span');
      indicator.className = 'required-indicator';
      indicator.textContent = ' *';
      label.appendChild(indicator);
    }
  }
  
  destroy() {
    this.fields.clear();
    this.validators.clear();
  }
}

export function initializeForms() {
  const forms = document.querySelectorAll('form[data-enhanced]');
  const instances = [];
  
  forms.forEach(form => {
    const options = {
      validateOnInput: form.dataset.validateOnInput !== 'false',
      validateOnBlur: form.dataset.validateOnBlur !== 'false',
      submitViaAjax: form.dataset.ajax === 'true'
    };
    
    const formInstance = new Form(form, options);
    instances.push(formInstance);
    form._formInstance = formInstance;
  });
  
  return instances;
}