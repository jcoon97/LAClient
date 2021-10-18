import { Menu, MenuItemConstructorOptions, shell } from "electron";
import { CLIENT_CONSTANTS } from "./app";
import { createPreferencesWindow } from "./main/preferences";

export const setApplicationMenu = (): void => {
    const menuItems: MenuItemConstructorOptions[] = [
        {
            label: "File",
            submenu: [
                { role: "close" },
                {
                    label: `Quit ${ CLIENT_CONSTANTS.NAME }`,
                    accelerator: "CmdOrCtrl+Q",
                    role: "quit"
                }
            ]
        },
        {
            label: "View",
            submenu: [
                { role: "reload" },
                { role: "forceReload" },
                { type: "separator" },
                { role: "toggleDevTools" },
                { role: "togglefullscreen" },
                { type: "separator" },
                { role: "resetZoom" },
                { role: "zoomIn" },
                { role: "zoomOut" }
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
                    click: async () => await shell.openExternal(CLIENT_CONSTANTS.BASE_URL)
                },
                {
                    label: "Report Issue...",
                    click: async () => await shell.openExternal(CLIENT_CONSTANTS.BASE_URL + "/issues/new")
                },
                {
                    label: "What's New...",
                    click: async () => await shell.openExternal(CLIENT_CONSTANTS.BASE_URL + "/releases")
                },
                { type: "separator" },
                {
                    label: `Current Version: ${ CLIENT_CONSTANTS.VERSION }`
                }
            ]
        }
    ];

    const menu: Menu = Menu.buildFromTemplate(menuItems);
    Menu.setApplicationMenu(menu);
};