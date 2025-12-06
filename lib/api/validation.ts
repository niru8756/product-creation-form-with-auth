import { plainToInstance, ClassConstructor } from 'class-transformer';
import { validate } from 'class-validator';
import { formatValidationErrors } from './format-validation-errors';

// Interface for validation options
export interface ValidationOptions {
  skipMissingProperties?: boolean;
  whitelist?: boolean;
  forbidNonWhitelisted?: boolean;
  groups?: string[];
}

// Interface for validation result
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
  errorMessage?: string;
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Generic DTO validation function
 * @param dtoClass - The DTO class to validate against
 * @param data - The data object to validate
 * @param options - Validation options
 * @returns Promise<ValidationResult<T>>
 */
export async function validateDto<T extends object>(
  dtoClass: ClassConstructor<T>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  options: ValidationOptions = {}
): Promise<ValidationResult<T>> {
  try {
    // Transform plain object to class instance
    const dtoInstance = plainToInstance(dtoClass, data);
    
    // Validate the instance
    const errors = await validate(dtoInstance as object, {
      skipMissingProperties: false,
      whitelist: true,
      forbidNonWhitelisted: false,
      ...options
    });

    // If there are validation errors
    if (errors.length > 0) {
      return {
        success: false,
        errors: formatValidationErrors(errors) as Record<string, string>
      };
    }
    return {
      success: true,
      data: dtoInstance
    };
  } catch (error) {
    // Handle unexpected errors
    return {
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Validation failed'
    };
  }
}
