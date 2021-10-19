import { ipcInvoke, ipcReceive } from "../preload";
import { RefreshTimer } from "./RefreshTimer";

export const REFRESH_ICON_ATTR = {
    NAME: "data-qa",
    VALUE: "block_kit_loading_icon"
};

export const DOM_SELECTORS = {
    REFRESH_BUTTON: "button[data-qa-action-id='refresh-queue']",
    REFRESH_ICON_PARENT: "div.p-section_block__icons"
};

// When the script loads, this function should immediately get called, which
// will bootstrap the refresh timer by grabbing any user preferences that are
// saved and loading them in. If none are saved, defaults will be used instead.
let refreshTimer: RefreshTimer | undefined;

const loadTimer = async (): Promise<void> => {
    const isEnabled: boolean = <boolean>await ipcInvoke<GetIpcPreferences, IpcPreferencesValue>(
        "getPreferences", { name: "enableRefresh" }
    ) ?? RefreshTimer.DEFAULT_OPTIONS.isEnabled;

    const refreshRate: number = <number>await ipcInvoke<GetIpcPreferences, IpcPreferencesValue>(
        "getPreferences", { name: "refreshInterval" }
    ) ?? RefreshTimer.DEFAULT_OPTIONS.refreshRate;

    refreshTimer = new RefreshTimer({ isEnabled, refreshRate });
};

loadTimer();

// Update the timer if the user preferences change
ipcReceive<IpcPreferences>("onPreferencesUpdated", (args: IpcPreferences): void => {
    // If our timer has not been initiated or an instance of it does not exist, exit now
    if (!refreshTimer) return;

    // Enable/disable the refresh timer
    if (args.name === "enableRefresh") {
        if (<boolean>args.value) {
            refreshTimer.changeOptions({ isEnabled: true });
        } else {
            refreshTimer.changeOptions({ isEnabled: false });
        }
    }

    // Update the second(s) to wait before refreshing
    if (args.name === "refreshInterval") {
        refreshTimer.changeOptions({ refreshRate: <number>args.value });
    }
});