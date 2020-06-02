declare type Callback = (from: string, data: any) => void;
export declare class Verbinden {
    private id;
    private client;
    private members;
    private observables;
    constructor(url: string);
    private receiveMessage;
    on(channel: string, cb: Callback): void;
    onMemberChanged(cb: () => void): void;
    channel(channel: string): {
        target: (id: string) => {
            send: (data: any) => void;
        };
        broadcast: (data: any) => void;
    };
    send(channel: string, target: string, data: any): void;
    private _send;
}
export {};
//# sourceMappingURL=index.d.ts.map