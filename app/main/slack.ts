import { BrowserWindow, HandlerDetails, shell } from "electron";
import contextMenu from "electron-context-menu";
import path from "path";
import { WindowManager, WindowName, WorkerWindowName } from "../WindowManager";

const SLACK_WORKSPACE_ID = "TLXH0JYKB";
const SLACK_ASKBCS_ID = "D015FQGL57G";

const WORKSPACE_URL = `https://app.slack.com/client/${SLACK_WORKSPACE_ID}`;
const ASKBCS_URL = `https://app.slack.com/client/${SLACK_WORKSPACE_ID}/${SLACK_ASKBCS_ID}/app`;

const windowManager: WindowManager = WindowManager.getManager();

export const createSlackWindow = async (): Promise<void> => {
    const window: BrowserWindow | null = windowManager.createWindow(WindowName.ASKBCS_SLACK, {
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
        await window.loadURL(WORKSPACE_URL);
        contextMenu({ window });

        window.webContents.setWindowOpenHandler(({ url }: HandlerDetails) => {
            shell.openExternal(url);
            return { action: "deny" };
        });
    }
};

export const createSlackWorkerWindow = async (): Promise<void> => {
    const workerWindow: BrowserWindow | null = windowManager.createWorkerWindow(WorkerWindowName.ASKBCS_SLACK_WORKER, {
        webPreferences: {
            backgroundThrottling: false,
            contextIsolation: true,
            nodeIntegration: false,
            preload: path.join(__dirname, "preload_slack.bundle.js")
        }
    });

    if (workerWindow) await workerWindow.loadURL(ASKBCS_URL);
};
