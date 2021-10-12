export const hasAttributeAndEquals = (element: HTMLElement, name: string, value: string): boolean => {
    return (element.hasAttribute(name)
        && element.getAttribute(name) === value);
};