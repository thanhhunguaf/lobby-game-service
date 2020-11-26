import SGStatusMessage, {SGStatusCode} from './SGStatusCode';

export default class SGResponse {
    private _cmd = '';
    private _data: any = {};
    private _errorCode = 0;
    private _errorMessage = '';

    public set cmd(v: string) {
        this._cmd = v;
    }

    public get cmd(): string {
        return this._cmd;
    }

    public get data() {
        return this._data;
    }

    public set data(v: any) {
        this._data = v;
    }

    public get errorCode(): number {
        return this._errorCode;
    }

    public set errorCode(v: number) {
        this._errorCode = v;
    }

    public get errorMessage(): string {
        return this._errorMessage;
    }

    public set errorMessage(v: string) {
        this._errorMessage = v;
    }

    constructor(cmd?: string) {
        if (cmd) this.cmd = cmd;
    }

    public static create(cmd: string): SGResponse {
        const builder = new SGResponse(cmd);
        return builder;
    }

    public static success(cmd: string, data: any): SGResponse {
        const response = new SGResponse(cmd);
        response.errorCode = SGStatusCode.SUCCESS;
        response.errorMessage = SGStatusMessage.get(SGStatusCode.SUCCESS);
        response.data = data;
        return response;
    }

    public static fail(cmd: string, status: SGStatusCode, message?: string): SGResponse {
        const response = new SGResponse(cmd);
        response.errorCode = status;
        response.errorMessage = message ? message : SGStatusMessage.get(status);
        response.data = {};
        return response;
    }

    public build(): any {
        return {
            cmd: this.cmd,
            errorCode: this.errorCode,
            errorMessage: this.errorMessage,
            data: this.data,
        };
    }
}
