import { BrowserWindow, ipcMain } from "electron";
import ElectronStore from "electron-store";
import * as path from "path";
import { WindowManager, WindowName } from "../WindowManager";

// @ts-ignore
const electronStore: ElectronStore = new ElectronStore<PreferencesStore>({
    clearInvalidConfig: true,
    defaults: {
        autoRefresh: {
            enabled: true, // Default to auto-refresh being enabled
            interval: 15 // Default to a 15-second interval between auto refreshes
        }
    }
});

const windowManager: WindowManager = WindowManager.getManager();

export const createPreferencesWindow = async (): Promise<void> => {
    const window: BrowserWindow | null = windowManager.createWindow(WindowName.PREFERENCES, {
        height: 600,
        width: 1000,
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

// Get a specific config value from `electron-store`. This is mainly used when the
// preferences window loads to load initial values for DOM elements
ipcMain.handle("getPreference", (_, args: IpcGetPreference): unknown => {
    return electronStore.get(args.key);
});

// Reset the entire preferences store object. This will generally only occur if the
// user indicates that they would like to reset all preferences via an action (e.g. button click)
ipcMain.on("resetPreferences", (): void => {
    electronStore.clear();
    const mainWindow: BrowserWindow | undefined = windowManager.getWindow(WindowName.SLACK);
    if (mainWindow) mainWindow.webContents.send("onPreferencesReset");
});

// Modify the specified name (key) to have the specified value in the user's settings file.
// Additionally, once the modification has been made, send a notification to the Slack renderer
// process to allow any updates to persist across windows (e.g. enable/disable refresh timer, etc.)
ipcMain.on("setPreference", (_, args: IpcSetPreference): void => {
    electronStore.set(args.key, args.value);
    const mainWindow: BrowserWindow | undefined = windowManager.getWindow(WindowName.SLACK);
    if (mainWindow) mainWindow.webContents.send("onPreferenceUpdated", args);
});