declare type IpcChannelName =
    "getNotificationSound"
    | "getPreference"
    | "openAudioFile"
    | "onPreferenceUpdated"
    | "onPreferencesReset"
    | "resetPreferences"
    | "setPreference";

declare interface IpcPreference {
    key?: string;
    value?: unknown;
}

declare type IpcGetPreference = Required<Pick<IpcPreference, "key">>;

declare type IpcSetPreference = Required<IpcPreference>;

/**
 * `electron-store` interface that will define the schema used for user preferences,
 * which can be modified by the user in the preferences window.
 */
declare type PreferencesStore = {
    autoRefresh: {
        /**
         * If enabled, the AskBCS queue will automatically refresh when the user is
         * currently viewing the "AskBCS Learning Assistant" app page on Slack
         */
        enabled: boolean;

        /**
         * The amount of time (in seconds) that will elapse between each attempt to
         * refresh the AskBCS queue
         */
        interval: number;
    };

    audioNotify: {
        /**
         * If enabled, when the AskBCS queue refreshes and a new question is found
         * in the queue, an audio file (specified below) will play for the user
         */
        enabled: boolean;

        /**
         * The absolute file path to the audio file that will be played when a new
         * question is found in the AskBCS queue
         */
        filePath: string | undefined

        /**
         * The amount of time (in seconds) that should elapse before a new notification
         * is played, if there are still question(s) in the AskBCS queue
         */
        timeout: number;

        /**
         * The volume at which this audio notification will play at for the user. Currently,
         * the range is from 0.0 to 1.0.
         */
        volume: number;
    }
}

declare interface Window {
    electron: {
        /**
         * Listen for a message from the main process via a specific `channel`, and if one
         * is received, execute the `callback` function with the message arguments.
         *
         * @param channel - The channel name that will be listened on
         * @param callback - The callback function that will be called when a message is
         * received from the main process on the specified `channel`
         */
        receive: <T = void>(channel: IpcChannelName, callback: (args?: T) => void) => void;

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
        send: <T = void>(channel: IpcChannelName, args?: T) => void;

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
        invoke: <R, S = void>(channel: IpcChannelName, args?: S) => Promise<R>;
    };
}