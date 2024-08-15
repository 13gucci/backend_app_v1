const serverMsg = {
    SERVERsuccess: 'Server is running on port',
    DATABASEsuccess: 'Pinged your deployment. You successfully connected to MongoDB!',
    TESTsuccess: 'Server is ok',
    CONNECTION_STRING_err: 'Connection string is not defined in environment variables',
    DATABASE_NAME_err: 'Database name is not defined in environment variables',
    DATABASEerr: 'Connect to database failed at: '
} as const;

export default serverMsg;
