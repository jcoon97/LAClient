import { app, Menu, MenuItemConstructorOptions, shell } from "electron";
import { BASE_REPOSITORY_URL } from "./app";
import { createPreferencesWindow } from "./main/preferences";

const helpSubmenu: MenuItemConstructorOptions[] = [
    {
        label: "Repository",
        click: async () => await shell.openExternal(BASE_REPOSITORY_URL)
    },
    {
        label: "Report Issue...",
        click: async () => await shell.openExternal(BASE_REPOSITORY_URL + "/issues/new")
    },
    {
        label: "What's New...",
        click: async () => await shell.openExternal(BASE_REPOSITORY_URL + "/releases")
    },
    { type: "separator" },
    { label: `Current Version: ${app.getVersion()}` }
];

const darwinTemplate: MenuItemConstructorOptions[] = [
    {
        label: app.getName(),
        submenu: [
            { role: "about" },
            { type: "separator" },
            {
                label: "Preferences",
                accelerator: "CmdOrCtrl+,",
                click: async () => await createPreferencesWindow()
            },
            { type: "separator" },
            { role: "close" },
            {
                label: `Quit ${app.getName()}`,
                accelerator: "CmdOrCtrl+Q",
                role: "quit"
            }
        ]
    },
    { role: "editMenu" },
    { role: "viewMenu" },
    { role: "windowMenu" },
    {
        label: "Help",
        submenu: helpSubmenu
    }
];

const linuxWindowsTemplate: MenuItemConstructorOptions[] = [
    {
        label: "File",
        submenu: [
            { role: "close" },
            {
                label: `Quit ${app.getName()}`,
                accelerator: "CmdOrCtrl+Q",
                role: "quit"
            }
        ]
    },
    { role: "editMenu" },
    { role: "viewMenu" },
    {
        label: "Preferences",
        accelerator: "CmdOrCtrl+,",
        click: async () => await createPreferencesWindow()
    },
    {
        label: "Help",
        submenu: helpSubmenu
    }
];

export const setApplicationMenu = (): void => {
    const menuItems: MenuItemConstructorOptions[] =
        process.platform === "darwin" ? darwinTemplate : linuxWindowsTemplate;

    const menu: Menu = Menu.buildFromTemplate(menuItems);
    Menu.setApplicationMenu(menu);
};
