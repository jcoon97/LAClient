declare type IpcChannelNames = "getPreferences" | "setPreferences";

declare interface Window {
    electron: {
        /**
         * Send a message to the main process via `channel`, along with arguments.
         *
         * Although this message will be sent asynchronously to the main process, it will not
         * expect a response to be sent back. If you wish to receive a response, then please use
         * {@link Window.electron.invoke} instead, which will return a `Promise` with a value that
         * can be casted to the appropriate type.
         *
         * @param channel - The channel name that the main process will use to process this message
         * @param args - The argument(s) that will be sent to the main process with this message
         */
        send: (channel: IpcChannelNames, args: any) => void;

        /**
         * Send a message to the main process via `channel`, along with arguments.
         *
         * This message, much like {@link Window.electron.send} will be sent asynchronously to the main
         * process; however, this message will expect that a response is returned. As such, you can use
         * `async`/`await` to wait for a response from the main process and process the request accordingly.
         *
         * @param channel - The channel name that the main process will use to process this message
         * @param args - The argument(s) that will be sent to the main process with this message
         *
         * @returns The response that is sent back from the main process, if any is returned
         */
        invoke: (channel: IpcChannelNames, args: any) => Promise<any>;
    };
}