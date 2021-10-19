import { BrowserWindow, ipcMain } from "electron";
import { get as getSetting, set as setSetting } from "electron-settings";
import * as path from "path";
import { WindowManager, WindowName } from "../WindowManager";

const windowManager: WindowManager = WindowManager.getManager();

export const createPreferencesWindow = async (): Promise<void> => {
    const window: BrowserWindow | null = windowManager.createWindow(WindowName.PREFERENCES, {
        height: 400,
        width: 800,
        maximizable: false,
        resizable: false,
        autoHideMenuBar: true,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            preload: path.join(__dirname, "preload_app.bundle.js")
        }
    });

    if (window) await window.loadFile(path.join(__dirname, "preferences.html"));
};

// Return a specific preference value when requested from the renderer context
ipcMain.handle("getPreferences", async (_, args: GetIpcPreferences): Promise<IpcPreferencesValue> => {
    return <IpcPreferencesValue>await getSetting(args.name);
});

// Modify the specified name (key) to have the specified value in the user's settings file.
// Additionally, once the modification has been made, send a notification to the Slack renderer
// process to allow any updates to persist across windows (e.g. enable/disable refresh timer, etc.)
ipcMain.on("setPreferences", async (_, args: SetIpcPreferences): Promise<void> => {
    await setSetting(args.name, args.value);
    const mainWindow: BrowserWindow | undefined = windowManager.getWindow(WindowName.SLACK);
    if (mainWindow) mainWindow.webContents.send("onPreferencesUpdated", args);
});