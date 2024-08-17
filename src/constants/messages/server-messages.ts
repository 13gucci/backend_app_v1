const serverMsg = {
    SERVER_START_SUCCESS: '[SERVER] is successfully running on port',
    DATABASE_CONNECTION_SUCCESS: '[DATABASE] is successfully connected to MongoDB and pinged the deployment.',
    SERVER_HEALTH_CHECK_SUCCESS: 'Server health check passed successfully.',
    CONNECTION_STRING_ERROR: 'Environment variable CONNECTION_STRING is not defined.',
    DATABASE_NAME_ERROR: 'Environment variable DATABASE_NAME is not defined.',
    DATABASE_CONNECTION_FAILURE: 'Failed to connect to the database at: ',
    COLLECTION_NAME_ERROR: 'Collection variable is not defined.',
    REACHED_LIMIT_REQUEST_LOGIN: 'Client request Limit reached'
} as const;

export default serverMsg;
