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

export type MaybePromise<T> = T | Promise<T>;

export interface CreateWindowOptions<T extends AnyWindow> {
    name: T;
    onClosed?: () => MaybePromise<void>;
    windowOptions?: BrowserWindowConstructorOptions;
}

export class WindowManager {
    private static INSTANCE: WindowManager | undefined;

    private readonly windows: Map<WindowName, BrowserWindow>;
    private readonly workerWindows: Map<WorkerWindowName, BrowserWindow>;

    constructor() {
        this.windows = new Map<WindowName, BrowserWindow>();
        this.workerWindows = new Map<WorkerWindowName, BrowserWindow>();
    }

    createWindow(options: CreateWindowOptions<WindowName>): BrowserWindow | null {
        if (this.windows.has(options.name)) {
            const currentWindow: BrowserWindow | undefined = this.windows.get(options.name);

            if (currentWindow) {
                currentWindow.focus();
                return null;
            }
        }

        const newWindow: BrowserWindow = new BrowserWindow({
            ...options.windowOptions,
            show: false,
            webPreferences: {
                ...options.windowOptions?.webPreferences,
                devTools: isDev
            }
        });

        newWindow.on("closed", () => {
            this.windows.delete(options.name);
            if (options.onClosed) options.onClosed();
        });

        newWindow.once("ready-to-show", (): void => {
            newWindow.show();
            if (isDev) newWindow.webContents.openDevTools();
        });

        this.windows.set(options.name, newWindow);
        return newWindow;
    }

    createWorkerWindow(options: CreateWindowOptions<WorkerWindowName>): BrowserWindow | null {
        if (this.workerWindows.has(options.name)) return null;

        const newWorkerWindow: BrowserWindow = new BrowserWindow({
            ...options.windowOptions,
            show: false,
            webPreferences: {
                ...options.windowOptions?.webPreferences,
                devTools: isDev
            }
        });

        newWorkerWindow.on("closed", () => {
            this.workerWindows.delete(options.name);
            if (options.onClosed) options.onClosed();
        });

        if (isDev) newWorkerWindow.once("ready-to-show", () => newWorkerWindow.show());
        this.workerWindows.set(options.name, newWorkerWindow);
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
