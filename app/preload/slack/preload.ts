import { ipcInvoke, ipcReceive } from "../preload";
import { NotificationManager } from "./NotificationManager";
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

const loadTimer = async (reload?: boolean): Promise<void> => {
    const isEnabled: boolean = await ipcInvoke<boolean, IpcGetPreference>("getPreference", {
        key: "autoRefresh.enabled"
    });

    const refreshRate: number = await ipcInvoke<number, IpcGetPreference>("getPreference", {
        key: "autoRefresh.interval"
    });

    if (reload) {
        refreshTimer?.changeOptions({ isEnabled, refreshRate });
    } else {
        refreshTimer = new RefreshTimer({ isEnabled, refreshRate, onRefresh });
    }
};

// This function will get called when our AskBCS queue refreshes. It will then check if
// there are any questions in the queue, and if there are, then it will play an audio
// notification if the user has enabled that functionality.
const notificationManager: NotificationManager = NotificationManager.getManager();

const onRefresh = async (): Promise<void> => {
    const regex: RegExp = /(AVAILABLE QUESTIONS|IN CLASS ACTIVITY QUESTIONS)/i;
    const found: number = document.body.innerHTML.search(regex);
    if (found !== -1) await notificationManager.play();
};

// Update the `RefreshTimer` object to reflect any changes the user may have made
// when updating their app preferences
const registerPreferenceUpdated = (): void => {
    ipcReceive<IpcPreference>("onPreferenceUpdated", async (args: IpcPreference | undefined): Promise<void> => {
        // If our timer has not been initiated or an instance of it does not exist, exit now
        if (!refreshTimer) return;

        // Enable/disable the refresh timer
        if (args?.key === "autoRefresh.enabled") {
            refreshTimer.changeOptions({ isEnabled: <boolean>args.value });
        }

        // Update the second(s) to wait before refreshing
        if (args?.key === "autoRefresh.interval") {
            refreshTimer.changeOptions({ refreshRate: <number>args.value });
        }

        // Update NotificationManager if audio preferences are modified
        if (args?.key === "audioNotify.enabled"
            || args?.key === "audioNotify.filePath"
            || args?.key === "audioNotify.volume") {
            await notificationManager.loadOptions();
        }
    });
};

// If the user resets all of their preferences, re-call `loadTimer` to update
// all internally stored user preferences to their new state(s)
const registerPreferencesReset = (): void => {
    ipcReceive("onPreferencesReset", async (): Promise<void> => await loadTimer(true));
};

window.addEventListener("load", async (): Promise<void> => {
    await loadTimer();
    await notificationManager.loadOptions();
    registerPreferenceUpdated();
    registerPreferencesReset();
});