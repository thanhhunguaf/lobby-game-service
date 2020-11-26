export default class ErrorCode {
    public errorCode: number;
    public errorMessage: string;

    constructor(errorCode: number, errorMessage: string) {
        this.errorCode = errorCode;
        this.errorMessage = errorMessage;
    }

    public isSuccess(): boolean {
        return this.errorCode == 0;
    }

    public isFailed(): boolean {
        return !this.isSuccess();
    }

    // Commons
    public static SUCCESS = new ErrorCode(0, "SUCCESS");
    public static FAILED = new ErrorCode(1, "FAILED");

    // Users: UC = User create
    public static UC_SAME_CLIENT = new ErrorCode(2, "UC_SAME_CLIENT");
    public static UC_SAME_PROFILEID = new ErrorCode(2, "UC_SAME_PROFILEID");
    public static UC_SAME_SESSIONID = new ErrorCode(2, "UC_SAME_SESSIONID");
    

}