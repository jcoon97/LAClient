import { BrowserWindow, HandlerDetails, shell } from "electron";
import contextMenu from "electron-context-menu";
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
            preload: path.join(__dirname, "preload_slack.bundle.js"),
            spellcheck: true
        }
    });

    if (window) {
        await window.loadURL("https://learning-assistants.slack.com");
        contextMenu({ window });

        window.webContents.setWindowOpenHandler(({ url }: HandlerDetails) => {
            shell.openExternal(url);
            return { action: "deny" };
        });
    }
};
