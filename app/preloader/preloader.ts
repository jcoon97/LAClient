import { RefreshTimer } from "./RefreshTimer";

export const REFRESH_ICON_ATTR = {
    NAME: "data-qa",
    VALUE: "block_kit_loading_icon"
};

export const DOM_SELECTORS = {
    REFRESH_BUTTON: "button[data-qa-action-id='refresh-queue']",
    REFRESH_ICON_PARENT: "div.p-section_block__icons"
};

const refreshTimer: RefreshTimer = new RefreshTimer({
    refreshRate: 15
});

window.addEventListener("load", () => {
    refreshTimer.startTimer();
});