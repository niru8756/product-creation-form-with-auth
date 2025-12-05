/* eslint-disable @typescript-eslint/no-explicit-any */
interface ValidationError {
  target?: Record<string, any>;
  property: string;
  value?: any;
  children?: ValidationError[];
  constraints?: Record<string, string>;
}

interface ValidationResult {
  [key: string]: string | ValidationResult;
}

/**
 * Transform class-validator errors with support for nested properties
 * @param errors - Array of validation errors
 * @param prefix - Optional prefix for nested properties
 * @returns Formatted error object
 */
export function formatValidationErrors(
  errors: ValidationError[],
  prefix: string = ''
): ValidationResult {
  const result: ValidationResult = {};

  for (const error of errors) {
    const key = prefix ? `${prefix}.${error.property}` : error.property;

    // Handle constraints (direct property errors)
    if (error.constraints) {
      // Get all constraint messages (or just first)
      const messages = Object.values(error.constraints);
      if (messages.length > 0) {
        result[error.property] = messages[0]; // First error only
        // OR combine all errors:
        // result[error.property] = messages.join(', ');
      }
    }

    // Handle nested errors recursively
    if (error.children && error.children.length > 0) {
      const nestedResult = formatValidationErrors(error.children, key);
      if (Object.keys(nestedResult).length > 0) {
        // Merge nested results
        Object.assign(result, nestedResult);
      }
    }
  }

  return result;
}