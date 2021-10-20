import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

const validChannels: IpcChannelName[] = [
    "getPreference",
    "onPreferenceUpdated",
    "onPreferencesReset",
    "resetPreferences",
    "setPreference"
];

export const ipcReceive = <T>(channel: IpcChannelName, callback: (args?: T) => void): void => {
    if (validChannels.includes(channel)) {
        const newCallback = (_: IpcRendererEvent, args: any) => callback(args);
        ipcRenderer.on(channel, newCallback);
    }
};

export const ipcSend = <T>(channel: IpcChannelName, args?: T): void => {
    if (!validChannels.includes(channel)) {
        throw new Error(`Failed to send IPC to main process, channel ${ channel } is not valid`);
    }
    ipcRenderer.send(channel, args);
};

export const ipcInvoke = <R, S>(channel: IpcChannelName, args?: S): Promise<R> => {
    if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, args);
    }
    throw new Error(`Failed to invoke IPC to main process, channel ${ channel } is not valid`);
};

contextBridge.exposeInMainWorld("electron", {
    receive: ipcReceive,
    send: ipcSend,
    invoke: ipcInvoke
});