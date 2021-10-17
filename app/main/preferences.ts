import { BrowserWindow, ipcMain, IpcMainEvent } from "electron";
import * as path from "path";
import { WindowManager, WindowName } from "../WindowManager";

type IPCPreferencesValue = boolean | null | number | string;

interface IPCPreferences {
    name?: string;
    value?: IPCPreferencesValue;
}

type GetIPCPreferences = Required<Pick<IPCPreferences, "name">>;

type SetIPCPreferences = Required<IPCPreferences>;

const windowManager: WindowManager = WindowManager.getManager();

export const createPreferencesWindow = async (): Promise<void> => {
    const window: BrowserWindow | null = windowManager.createWindow(WindowName.PREFERENCES, {
        height: 400,
        width: 800,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            preload: path.join(__dirname, "preload_app.bundle.js")
        }
    });

    if (window) await window.loadFile("./preferences.html");
};

ipcMain.on("getPreferences", (_: IpcMainEvent, args: GetIPCPreferences) => {
    console.log(`getPreferences(${ JSON.stringify(args) })`);
    // event.returnValue = getPreference(arg.name);
});

ipcMain.on("setPreferences", async (_: IpcMainEvent, args: SetIPCPreferences) => {
    console.log(`setPreferences(${ JSON.stringify(args) })`);
    // setPreference(arg.name, arg.value);
});