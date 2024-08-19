class BlackListService {
    private static instance: BlackListService;

    private constructor() {}

    public static getInstance(): BlackListService {
        if (!BlackListService.instance) {
            BlackListService.instance = new BlackListService();
        }
        return BlackListService.instance;
    }
}

const blackListService = BlackListService.getInstance();

// Export
export default blackListService;
