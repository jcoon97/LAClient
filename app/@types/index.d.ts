declare interface Window {
    electron: {
        send: (channel: string, args: any) => any;
        receive: (channel: string, func: (args: any) => void) => void;
    };
}