import { BrowserWindow, BrowserWindowConstructorOptions } from "electron";
import isDev from "electron-is-dev";

export enum WindowName {
    PREFERENCES,
    SLACK
}

export class WindowManager {
    private static INSTANCE: WindowManager | null = null;
    private readonly windows: Map<WindowName, BrowserWindow>;

    constructor() {
        this.windows = new Map<WindowName, BrowserWindow>();
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

        newWindow.on("closed", (): void => {
            this.windows.delete(name);
        });

        newWindow.once("ready-to-show", (): void => {
            newWindow.show();
            if (isDev) newWindow.webContents.openDevTools();
        });

        this.windows.set(name, newWindow);
        return newWindow;
    }

    getWindow(name: WindowName): BrowserWindow | undefined {
        return this.windows.get(name);
    }

    static getManager(): WindowManager {
        if (!WindowManager.INSTANCE) {
            WindowManager.INSTANCE = new WindowManager();
        }
        return WindowManager.INSTANCE;
    }
}