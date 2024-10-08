export const validationMsg = {
    VALIDATION_ERROR: 'Validation errors',
    REQUIRED: 'This field is required.',
    INVALID_EMAIL: 'Please enter a valid email address.',
    EXISTED_EMAIL: 'Email already existed',
    PASSWORD_TOO_WEAK:
        'Password must be at least 6 characters long and include at least one uppercase letter, one lowercase letter, one number, and one symbol.',
    PASSWORD_MISMATCH: 'Passwords do not match.',
    INVALID_DATE: 'Please enter a valid date in ISO 8601 format (e.g., YYYY-MM-DDTHH:MM:SS).',
    INVALID_LENGTH: (min: number, max: number) => `This field must be between ${min} and ${max} characters long.`,
    INVALID_TOKEN: 'This authorization token is invalid',
    USER_NOTFOUND: 'User not found.',
    VERIFY_EMAIL_SUCCESS: 'Vee',
    INVALID_URL: 'The URL must be valid and start with http or https.',
    INVALID_USERNAME_FORMAT: 'The username can only contain letters, numbers, and underscores.',
    INVALID_STRING: (field: string) => `${field} must be a valid string.`
};
