import { BrowserWindow, BrowserWindowConstructorOptions } from "electron";
import isDev from "electron-is-dev";

export enum WindowName {
    ASKBCS_SLACK = "ASKBCS_SLACK",
    PREFERENCES = "PREFERENCES"
}

export enum WorkerWindowName {
    ASKBCS_SLACK_WORKER = "ASKBCS_SLACK_WORKER"
}

export type AnyWindow = WindowName | WorkerWindowName;

export class WindowManager {
    private static INSTANCE: WindowManager | undefined;

    private readonly windows: Map<WindowName, BrowserWindow>;
    private readonly workerWindows: Map<WorkerWindowName, BrowserWindow>;

    constructor() {
        this.windows = new Map<WindowName, BrowserWindow>();
        this.workerWindows = new Map<WorkerWindowName, BrowserWindow>();
    }

    createWindow(name: WindowName, options?: BrowserWindowConstructorOptions): BrowserWindow | null {
        if (this.windows.has(name)) {
            const currentWindow: BrowserWindow | undefined = this.windows.get(name);

            if (currentWindow) {
                currentWindow.focus();
                return null;
            }
        }

        const newWindow: BrowserWindow = new BrowserWindow({
            ...options,
            show: false,
            webPreferences: {
                ...options?.webPreferences,
                devTools: isDev
            }
        });

        newWindow.on("closed", () => this.windows.delete(name));

        newWindow.once("ready-to-show", (): void => {
            newWindow.show();
            if (isDev) newWindow.webContents.openDevTools();
        });

        this.windows.set(name, newWindow);
        return newWindow;
    }

    createWorkerWindow(name: WorkerWindowName, options?: BrowserWindowConstructorOptions): BrowserWindow | null {
        if (this.workerWindows.has(name)) return null;

        const newWorkerWindow: BrowserWindow = new BrowserWindow({
            ...options,
            show: false,
            webPreferences: {
                ...options?.webPreferences,
                devTools: isDev
            }
        });

        newWorkerWindow.on("closed", () => this.workerWindows.delete(name));

        newWorkerWindow.on("ready-to-show", () => {
            if (isDev) {
                newWorkerWindow.show();
                newWorkerWindow.webContents.openDevTools();
            }
        });

        this.workerWindows.set(name, newWorkerWindow);
        return newWorkerWindow;
    }

    getAnyWindows(names: AnyWindow[]): BrowserWindow[] {
        const windows: BrowserWindow[] = [];

        for (const name of names) {
            switch (name) {
                case WindowName.ASKBCS_SLACK:
                case WindowName.PREFERENCES: {
                    if (this.windows.has(name)) {
                        windows.push(this.windows.get(name) as BrowserWindow);
                    }
                    break;
                }
                case WorkerWindowName.ASKBCS_SLACK_WORKER: {
                    if (this.workerWindows.has(name)) {
                        windows.push(this.workerWindows.get(name) as BrowserWindow);
                    }
                    break;
                }
                default: {
                    console.error(`Failed to find window by name ${name}`);
                }
            }
        }
        return windows;
    }

    getWindow(name: WindowName): BrowserWindow | undefined {
        return this.windows.get(name);
    }

    getWorkerWindow(name: WorkerWindowName): BrowserWindow | undefined {
        return this.workerWindows.get(name);
    }

    static getManager(): WindowManager {
        if (!WindowManager.INSTANCE) {
            WindowManager.INSTANCE = new WindowManager();
        }
        return WindowManager.INSTANCE;
    }
}
