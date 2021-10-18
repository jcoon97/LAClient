const onCheckboxChange = async (_: Event): Promise<void> => {
    await window.electron.invoke("getPreferences", { name: "checkbox" });
    await window.electron.send("setPreferences", { name: "checkbox", value: true });
};

const checkboxes: NodeListOf<HTMLInputElement> = document.querySelectorAll("input[type=checkbox]");

checkboxes.forEach((checkbox: HTMLInputElement) => {
    checkbox.addEventListener("change", onCheckboxChange);
});