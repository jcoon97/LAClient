import { DOM_SELECTORS, REFRESH_ICON_ATTR } from "./preload";

export class RefreshIconObserver {
    private isRunning: boolean;
    private readonly mutationObserver: MutationObserver;
    private readonly onFinished: () => void;

    constructor(onFinished: () => void) {
        this.isRunning = false;
        this.mutationObserver = new MutationObserver(this.onObserverRun.bind(this));
        this.onFinished = onFinished;
    }

    disableObserver(): void {
        if (!this.isRunning) return;

        this.mutationObserver.disconnect();
        this.isRunning = false;
    }

    enableObserver(): void {
        // Since `MutationObserver.observe()` will remove all current observers if any are
        // running, we don't need to check if this observer is already running beforehand
        this.mutationObserver.observe(<Node>document.querySelector(DOM_SELECTORS.REFRESH_ICON_PARENT), {
            childList: true,
            subtree: false
        });
        this.isRunning = true;
    }

    private hasAttributeAndEquals = (element: HTMLElement, name: string, value: string): boolean =>
        element.hasAttribute(name) && element.getAttribute(name) === value;

    private onObserverRun(mutations: MutationRecord[]): void {
        mutations.forEach((mutation: MutationRecord) => {
            mutation.removedNodes.forEach((node: Node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const element: HTMLDivElement = <HTMLDivElement>node;

                    if (this.hasAttributeAndEquals(element, REFRESH_ICON_ATTR.NAME, REFRESH_ICON_ATTR.VALUE)) {
                        this.disableObserver();
                        this.onFinished?.();
                    }
                }
            });
        });
    }
}
