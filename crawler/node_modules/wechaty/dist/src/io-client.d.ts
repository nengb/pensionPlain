import { Wechaty } from './wechaty';
export interface IoClientOptions {
    token: string;
    wechaty: Wechaty;
}
export declare class IoClient {
    options: IoClientOptions;
    private io;
    private state;
    constructor(options: IoClientOptions);
    start(): Promise<void>;
    private hookWechaty;
    private startIo;
    private onMessage;
    stop(): Promise<void>;
    restart(): Promise<void>;
    quit(): Promise<void>;
}
//# sourceMappingURL=io-client.d.ts.map