const authMsg = {
    SUCCESS: {
        REGISTER: 'User registered successfully.',
        LOGIN: 'Login successful.',
        LOGOUT: 'Logout successful.',
        PASSWORD_RESET: 'Password reset successful.',
        EMAIL_VERIFICATION: 'Email verified successfully.',
        TOKEN_REFRESH: 'Token refreshed successfully.'
    },
    FAILURE: {
        REGISTER: 'User registration failed.',
        LOGIN: 'Login failed. Incorrect email or password.',
        LOGOUT: 'Logout failed.',
        PASSWORD_RESET: 'Password reset failed.',
        EMAIL_VERIFICATION: 'Email verification failed.',
        TOKEN_REFRESH: 'Token refresh failed.',
        INVALID_CREDENTIALS: 'Invalid credentials provided.',
        USER_NOT_FOUND: 'User not found.',
        PASSWORD_MISMATCH: 'Passwords do not match.',
        ACCOUNT_LOCKED: 'Account is locked due to multiple failed login attempts.',
        UNAUTHORIZED: 'Unauthorized access.',
        FORBIDDEN: 'You do not have permission to perform this action.',
        UNVERIFY: 'User is not verified. Please verify your email address to access this resource.',
        GMAIL_UNVERIFY: 'Gmail is not verified'
    }
} as const;
export default authMsg;
