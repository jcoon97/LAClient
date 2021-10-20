import { BrowserWindow, HandlerDetails, shell } from "electron";
import path from "path";
import { WindowManager, WindowName } from "../WindowManager";

const windowManager: WindowManager = WindowManager.getManager();

export const createSlackWindow = async (): Promise<void> => {
    const window: BrowserWindow | null = windowManager.createWindow(WindowName.SLACK, {
        height: 800,
        width: 1200,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            preload: path.join(__dirname, "preload_slack.bundle.js")
        }
    });

    if (window) {
        await window.loadURL("https://trilobot.slack.com");

        window.webContents.setWindowOpenHandler(({ url }: HandlerDetails) => {
            shell.openExternal(url);
            return { action: "deny" };
        });
    }
};