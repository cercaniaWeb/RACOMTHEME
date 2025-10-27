// validationUtils.js - Utilidades para validación de formularios

// Validación de email
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validación de número de teléfono
export const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, '').replace(/\-/g, ''));
};

// Validación de precio
export const validatePrice = (price) => {
  const priceNum = parseFloat(price);
  return !isNaN(priceNum) && priceNum >= 0;
};

// Validación de cantidad
export const validateQuantity = (quantity) => {
  const quantityNum = parseInt(quantity, 10);
  return !isNaN(quantityNum) && quantityNum > 0;
};

// Validación de nombre (no vacío, longitud razonable)
export const validateName = (name) => {
  return name && name.trim().length > 0 && name.trim().length <= 100;
};

// Validación de campo requerido
export const validateRequired = (value) => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined && value !== '';
};

// Validación de contraseña
export const validatePassword = (password) => {
  // Al menos 6 caracteres, una mayúscula, una minúscula y un número
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/;
  return passwordRegex.test(password);
};

// Validación de SKU/Código de producto
export const validateProductCode = (code) => {
  return code && code.trim().length > 0 && code.trim().length <= 50;
};

// Validación de porcentaje
export const validatePercentage = (percentage) => {
  const percentNum = parseFloat(percentage);
  return !isNaN(percentNum) && percentNum >= 0 && percentNum <= 100;
};

// Validación personalizada para formularios
export const validateForm = (formData, validationRules) => {
  const errors = {};
  
  for (const [field, rules] of Object.entries(validationRules)) {
    const value = formData[field];
    
    for (const rule of rules) {
      switch (rule.type) {
        case 'required':
          if (!validateRequired(value)) {
            errors[field] = rule.message || 'Este campo es requerido';
            break;
          }
          break;
        case 'email':
          if (value && !validateEmail(value)) {
            errors[field] = rule.message || 'Email inválido';
            break;
          }
          break;
        case 'minLength':
          if (value && value.length < rule.value) {
            errors[field] = rule.message || `Mínimo ${rule.value} caracteres`;
            break;
          }
          break;
        case 'maxLength':
          if (value && value.length > rule.value) {
            errors[field] = rule.message || `Máximo ${rule.value} caracteres`;
            break;
          }
          break;
        case 'minValue':
          if (value && parseFloat(value) < rule.value) {
            errors[field] = rule.message || `Valor mínimo es ${rule.value}`;
            break;
          }
          break;
        case 'maxValue':
          if (value && parseFloat(value) > rule.value) {
            errors[field] = rule.message || `Valor máximo es ${rule.value}`;
            break;
          }
          break;
        case 'pattern':
          if (value && !rule.value.test(value)) {
            errors[field] = rule.message || 'Formato inválido';
            break;
          }
          break;
        default:
          break;
      }
      
      // Si ya hay un error para este campo, pasamos al siguiente campo
      if (errors[field]) {
        break;
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Validación para productos
export const validateProduct = (productData) => {
  const validationRules = {
    name: [
      { type: 'required', message: 'El nombre del producto es requerido' },
      { type: 'minLength', value: 2, message: 'El nombre debe tener al menos 2 caracteres' },
      { type: 'maxLength', value: 100, message: 'El nombre no debe exceder los 100 caracteres' }
    ],
    price: [
      { type: 'required', message: 'El precio es requerido' },
      { type: 'minValue', value: 0.01, message: 'El precio debe ser mayor a 0' }
    ],
    unitOfMeasure: [
      { type: 'required', message: 'La unidad de medida es requerida' }
    ]
  };
  
  return validateForm(productData, validationRules);
};

// Validación para clientes
export const validateClient = (clientData) => {
  const validationRules = {
    name: [
      { type: 'required', message: 'El nombre del cliente es requerido' },
      { type: 'minLength', value: 2, message: 'El nombre debe tener al menos 2 caracteres' }
    ],
    email: [
      { type: 'required', message: 'El email es requerido' },
      { type: 'email', message: 'Email inválido' }
    ]
  };
  
  return validateForm(clientData, validationRules);
};

// Validación para usuarios
export const validateUser = (userData) => {
  const validationRules = {
    name: [
      { type: 'required', message: 'El nombre es requerido' },
      { type: 'minLength', value: 2, message: 'El nombre debe tener al menos 2 caracteres' }
    ],
    email: [
      { type: 'required', message: 'El email es requerido' },
      { type: 'email', message: 'Email inválido' }
    ],
    password: [
      { type: 'required', message: 'La contraseña es requerida' },
      { type: 'minLength', value: 6, message: 'La contraseña debe tener al menos 6 caracteres' }
    ]
  };
  
  return validateForm(userData, validationRules);
};

// Validación para ventas
export const validateSale = (saleData) => {
  const validationRules = {
    cart: [
      { type: 'required', message: 'El carrito no puede estar vacío' }
    ],
    total: [
      { type: 'required', message: 'El total es requerido' },
      { type: 'minValue', value: 0.01, message: 'El total debe ser mayor a 0' }
    ]
  };
  
  return validateForm(saleData, validationRules);
};