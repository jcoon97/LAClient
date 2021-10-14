import { app, BrowserWindow } from "electron";
import isDev from "electron-is-dev";
import * as path from "path";

const createWindow = async (): Promise<void> => {
    const window: BrowserWindow = new BrowserWindow({
        height: 800,
        width: 1200,
        webPreferences: {
            contextIsolation: true,
            devTools: process.env.NODE_ENV === "development",
            nodeIntegration: false,
            preload: path.join(__dirname, "./preloader/preloader.js")
        }
    });

    await window.loadURL("https://trilobot.slack.com");

    if (isDev) {
        window.webContents.openDevTools();
    }
};

app.on("activate", async (): Promise<void> => {
    if (BrowserWindow.getAllWindows().length === 0) {
        await createWindow();
    }
});

app.on("ready", createWindow);

app.on("window-all-closed", (): void => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});