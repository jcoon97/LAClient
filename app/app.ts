import { app, BrowserWindow } from "electron";
import * as process from "process";
import { createSlackWindow } from "./main/slack";
import { setApplicationMenu } from "./menu";

export const BASE_REPOSITORY_URL: string = "https://github.com/jcoon97/LAClient";

app.on("activate", async (): Promise<void> => {
    if (BrowserWindow.getAllWindows().length === 0) {
        await createSlackWindow();
    }
});

app.on("ready", async (): Promise<void> => {
    await createSlackWindow();
});

app.on("window-all-closed", (): void => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

setApplicationMenu();