import { app, BrowserWindow } from "electron";
import * as process from "process";
import { version } from "../package.json";
import { createSlackWindow } from "./main/slack";
import { setApplicationMenu } from "./menu";

export const CLIENT_CONSTANTS = {
    NAME: "LAClient",
    BASE_URL: "https://github.com/jcoon97/LAClient",
    VERSION: version
};

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