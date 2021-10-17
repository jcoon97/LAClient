import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

const validChannels: string[] = [
    "getPreferences",
    "setPreferences"
];

contextBridge.exposeInMainWorld("electron", {
    send: (channel: string, args: any): void => {
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, args);
        }
    },
    receive: (channel: string, func: (args: any) => void): void => {
        if (validChannels.includes(channel)) {
            const newCallback = (_: IpcRendererEvent, args: any) => func(args);
            ipcRenderer.on(channel, newCallback);
        }
    }
});