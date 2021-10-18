import { contextBridge, ipcRenderer } from "electron";

const validChannels: string[] = [
    "getPreferences",
    "setPreferences"
];

contextBridge.exposeInMainWorld("electron", {
    send: (channel: string, args: any): void => {
        if (!validChannels.includes(channel)) {
            throw new Error(`Failed to send IPC to main process, channel ${ channel } is not valid`);
        }
        ipcRenderer.send(channel, args);
    },
    invoke: (channel: string, args: any): Promise<any> => {
        if (validChannels.includes(channel)) {
            return ipcRenderer.invoke(channel, args);
        }
        throw new Error(`Failed to invoke IPC to main process, channel ${ channel } is not valid`);
    }
});