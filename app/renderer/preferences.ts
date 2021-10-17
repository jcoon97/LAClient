const onCheckboxChange = (_: Event) => {
    window.electron.send("getPreferences", { name: "checkbox" });
    window.electron.send("setPreferences", { name: "checkbox", value: true });
};

const checkboxes: NodeListOf<HTMLInputElement> = document.querySelectorAll("input[type=checkbox]");

checkboxes.forEach((checkbox: HTMLInputElement) => {
    checkbox.addEventListener("change", onCheckboxChange);
});