import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

const validChannels: IpcChannelName[] = [
    "getNotificationSound",
    "getPreference",
    "openAudioFile",
    "onPreferenceUpdated",
    "onPreferencesReset",
    "resetPreferences",
    "setPreference",
    "testNotification"
];

export const ipcReceive = <T = void>(channel: IpcChannelName, callback: (args?: T) => void): void => {
    if (validChannels.includes(channel)) {
        const newCallback = (_: IpcRendererEvent, args: T) => callback(args);
        ipcRenderer.on(channel, newCallback);
    }
};

export const ipcSend = <T = void>(channel: IpcChannelName, args?: T): void => {
    if (!validChannels.includes(channel)) {
        throw new Error(`Failed to send IPC to main process, channel ${channel} is not valid`);
    }
    ipcRenderer.send(channel, args);
};

export const ipcInvoke = <R, S = void>(channel: IpcChannelName, args?: S): Promise<R> => {
    if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, args) as Promise<R>;
    }
    throw new Error(`Failed to invoke IPC to main process, channel ${channel} is not valid`);
};

contextBridge.exposeInMainWorld("electron", {
    receive: ipcReceive,
    send: ipcSend,
    invoke: ipcInvoke
});
