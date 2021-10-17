import { app, BrowserWindow, Menu, MenuItemConstructorOptions, shell } from "electron";
import { createPreferencesWindow } from "./main/preferences";

export const setApplicationMenu = (): void => {
    const menuItems: MenuItemConstructorOptions[] = [
        {
            label: "LAClient",
            submenu: [
                {
                    label: "Close",
                    accelerator: "CommandOrControl+C",
                    click: () => BrowserWindow.getFocusedWindow()?.close()
                },
                {
                    label: "Quit",
                    accelerator: "CommandOrControl+Q",
                    click: () => app.quit()
                }
            ]
        },
        {
            label: "Preferences",
            click: async () => await createPreferencesWindow()
        },
        {
            label: "About",
            submenu: [
                {
                    label: "Repository",
                    click: async () => await shell.openExternal("https://github.com/jcoon97/LAClient")
                },
                {
                    label: "Report Issue...",
                    click: async () => await shell.openExternal("https://github.com/jcoon97/LAClient/issues/new")
                },
                {
                    label: "What's New...",
                    click: async () => await shell.openExternal("https://github.com/jcoon97/LAClient/releases")
                },
                { type: "separator" },
                {
                    label: `Version: ${ app.getVersion() }`
                }
            ]
        }
    ];

    const menu: Menu = Menu.buildFromTemplate(menuItems);
    Menu.setApplicationMenu(menu);
};