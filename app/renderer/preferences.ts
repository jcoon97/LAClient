const btnReset: HTMLElement | null = document.getElementById("btnReset");
const inputElements: NodeListOf<HTMLInputElement> = document.querySelectorAll("input[data-pref-name]");

// When setting a new value, grab the "value" from the element. For example, it will usually
// be the text value; however, on some elements, it may be `checked` or another value
const getInputValue = (element: HTMLInputElement): unknown => {
    switch (element.type) {
        case "checkbox":
            return element.checked;
        default:
            return element.value;
    }
};

// When this function is called, it will grab each element on the page and then find its
// respective user-defined setting from the main process. Once a response is received,
// it will then update the page DOM to reflect the preference that the user previously defined
const loadElementPreferences = async () => {
    for (const element of inputElements) {
        const prefName: string | null = element.getAttribute("data-pref-name");

        if (prefName) {
            const currentValue: unknown = await window.electron.invoke<unknown, IpcGetPreference>("getPreference", {
                key: prefName
            });

            setInputValue(element, currentValue);
        }
    }
};

// When an element is updated, and this function is subsequently called, update the setting
// by using IPC to call the main process with the name and value that should be updated
const onPreferenceChanged = (event: Event): void => {
    const element: HTMLInputElement = <HTMLInputElement>event.target;
    const prefName: string | null = element.getAttribute("data-pref-name");
    const prefValue: unknown = getInputValue(element);

    if (!prefName) return;
    if (typeof prefValue !== "boolean" && !prefValue) return;

    window.electron.send<IpcSetPreference>("setPreference", {
        key: prefName,
        value: prefValue
    });
};

// Update the specified DOM element with the specified value
const setInputValue = (element: HTMLInputElement, value: unknown): void => {
    switch (element.type) {
        case "checkbox":
            element.checked = <boolean>value;
            break;
        default:
            element.value = <string>value;
    }
};

// When the "Reset Preferences" button is clicked, call the main process to reset all
// user preferences. Once that finishes, reload all DOM elements on the page with their
// default values retrieved from `electron-store`.
if (btnReset) {
    btnReset.addEventListener("click", async (): Promise<void> => {
        window.electron.send("resetPreferences");
        await loadElementPreferences();
    });
}

// When the page loads, grab all of the saved user preferences and update their
// respective DOM elements to reflect their current saved value
window.addEventListener("load", async (): Promise<void> => {
    await loadElementPreferences();
    inputElements.forEach((element: HTMLInputElement) => element.addEventListener("change", onPreferenceChanged));
});