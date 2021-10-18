import { BrowserWindow, ipcMain, IpcMainEvent, IpcMainInvokeEvent } from "electron";
import * as path from "path";
import { WindowManager, WindowName } from "../WindowManager";

interface IpcPreferences {
    name?: string;
    value?: IpcPreferencesValue;
}

type GetIpcPreferences = Required<Pick<IpcPreferences, "name">>;
type SetIpcPreferences = Required<IpcPreferences>;
type IpcPreferencesValue = boolean | null | number | string;

const windowManager: WindowManager = WindowManager.getManager();

export const createPreferencesWindow = async (): Promise<void> => {
    const window: BrowserWindow | null = windowManager.createWindow(WindowName.PREFERENCES, {
        height: 400,
        width: 800,
        maximizable: false,
        resizable: false,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            preload: path.join(__dirname, "preload_app.bundle.js")
        }
    });

    if (window) await window.loadFile("./preferences.html");
};

ipcMain.handle("getPreferences", async (_: IpcMainInvokeEvent, args: GetIpcPreferences): Promise<void> => {
    console.log(`getPreferences(${ JSON.stringify(args) })`);
});

ipcMain.on("setPreferences", async (_: IpcMainEvent, args: SetIpcPreferences): Promise<void> => {
    console.log(`setPreferences(name: '${ args.name }', value: '${ args.value }')`);
});