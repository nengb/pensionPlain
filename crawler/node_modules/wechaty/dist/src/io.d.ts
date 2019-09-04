import { Wechaty } from './wechaty';
export interface IoOptions {
    wechaty: Wechaty;
    token: string;
    apihost?: string;
    protocol?: string;
}
export declare const IO_EVENT_DICT: {
    botie: string;
    error: string;
    heartbeat: string;
    login: string;
    logout: string;
    message: string;
    raw: string;
    reset: string;
    scan: string;
    shutdown: string;
    sys: string;
    update: string;
};
export declare class Io {
    private options;
    private readonly id;
    private readonly protocol;
    private eventBuffer;
    private ws;
    private readonly state;
    private reconnectTimer?;
    private reconnectTimeout?;
    private lifeTimer?;
    private onMessage;
    private scanPayload?;
    constructor(options: IoOptions);
    toString(): string;
    private connected;
    start(): Promise<void>;
    private initEventHook;
    private initWebSocket;
    private wsOnOpen;
    private wsOnMessage;
    private wsOnError;
    private wsOnClose;
    private reconnect;
    private send;
    stop(): Promise<void>;
    /**
     *
     * Prepare to be overwriten by server setting
     *
     */
    private ioMessage;
}
//# sourceMappingURL=io.d.ts.map