const inputElements: NodeListOf<HTMLInputElement> = document.querySelectorAll("input[data-pref-name]");

// When setting a new value, grab the "value" from the element. For example, it will usually
// be the text value; however, on some elements, it may be `checked` or another value
const getInputValue = (element: HTMLInputElement): IpcPreferencesValue => {
    switch (element.type) {
        case "checkbox":
            return element.checked;
        default:
            return element.value;
    }
};

// When an element is updated, and this function is subsequently called, update the setting
// by using IPC to call the main process with the name and value that should be updated
const onPreferenceChanged = (event: Event): void => {
    const element: HTMLInputElement = <HTMLInputElement>event.target;
    const prefName: string | null = element.getAttribute("data-pref-name");
    const prefValue: IpcPreferencesValue = getInputValue(element);

    if (!prefName) return;
    window.electron.send<SetIpcPreferences>("setPreferences", {
        name: prefName,
        value: prefValue
    });
};

const setInputValue = (element: HTMLInputElement, value: IpcPreferencesValue): void => {
    switch (element.type) {
        case "checkbox":
            element.checked = <boolean>value;
            break;
        default:
            element.value = <string>value;
    }
};

inputElements.forEach(async (element: HTMLInputElement): Promise<void> => {
    const prefName: string | null = element.getAttribute("data-pref-name");

    if (prefName) {
        const currentValue: IpcPreferencesValue = await window.electron.invoke<GetIpcPreferences, IpcPreferencesValue>(
            "getPreferences", { name: prefName }
        );
        setInputValue(element, currentValue);
    }

    // Call listener when a preference setting is changed in the page DOM
    element.addEventListener("change", onPreferenceChanged);
});