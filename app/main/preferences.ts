// @ts-ignore
import * as dataurl from "dataurl";
import { BrowserWindow, dialog, ipcMain, OpenDialogReturnValue } from "electron";
import ElectronStore from "electron-store";
import { readFile } from "fs/promises";
import mime from "mime-types";
import path from "path";
import { WindowManager, WindowName } from "../WindowManager";

// @ts-ignore
const electronStore: ElectronStore = new ElectronStore<PreferencesStore>({
    clearInvalidConfig: true,
    defaults: {
        autoRefresh: {
            enabled: true, // Default to auto-refresh being enabled
            interval: 15 // Default to a 15-second interval between auto refreshes
        },
        audioNotify: {
            enabled: false, // Default to audio notifications being disabled
            filePath: undefined, // Default to no file path on PC (audio won't play until this is changed)
            timeout: 30, // Default to 30 seconds between notification plays
            volume: 0.5 // Default to middle volume (range is from 0.0 to 1.0)
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
            defaultFontSize: 12,
            nodeIntegration: false,
            preload: path.join(__dirname, "preload_app.bundle.js")
        }
    });

    if (window) await window.loadFile(path.join(__dirname, "preferences.html"));
};

// When the renderer process requests to play a notification sound, first, check to make sure it's
// enabled and that a file has been chosen. If both of those conditions are met, then convert the
// file's data to a DataURL to be used inside HTML's `<audio>` tag and send that back.
ipcMain.handle("getNotificationSound", async (): Promise<string | undefined> => {
    const enabled: boolean = <boolean>electronStore.get("audioNotify.enabled");
    const filePath: string | null = <string | null>electronStore.get("audioNotify.filePath");

    if (enabled && filePath) {
        try {
            const mimeType: string | false = mime.lookup(path.extname(filePath));
            if (!mimeType) return undefined;

            const data: Buffer = await readFile(filePath);
            return dataurl.convert({ data, mimetype: mimeType });
        } catch {
            await dialog.showMessageBox({
                type: "warning",
                title: "File Not Found",
                message: "Failed to find notification file",
                detail:
                    "Confirm that the previously selected notification file still exists on your PC. Audio " +
                    "notifications will no longer work until a new file path is chosen."
            });
        }
    }
    return undefined;
});

// Get a specific config value from `electron-store`. This is mainly used when the
// preferences window loads to load initial values for DOM elements
ipcMain.handle("getPreference", (_, args: IpcGetPreference): unknown => {
    return electronStore.get(args.key);
});

// When the user specifies that they want to select a new notification sounds, open up an
// OS dialog window and allow the user to select an audio file to play
ipcMain.handle("openAudioFile", async (): Promise<string | null> => {
    const dialogValues: OpenDialogReturnValue = await dialog.showOpenDialog({
        title: "Select Notification Sound",
        filters: [{ name: "Audio Files", extensions: ["mp3", "m4a", "ogg"] }],
        properties: ["openFile"]
    });

    if (!dialogValues.canceled && dialogValues.filePaths.length > 0) {
        return dialogValues.filePaths[0];
    }
    return null;
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

// If the user clicks to test their notification sound, send an IPC to Slack's preload instance
ipcMain.on("testNotification", (): void => {
    const mainWindow: BrowserWindow | undefined = windowManager.getWindow(WindowName.SLACK);
    if (mainWindow) mainWindow.webContents.send("testNotification");
});
