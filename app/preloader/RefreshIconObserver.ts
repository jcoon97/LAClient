import { hasAttributeAndEquals } from "../utils/element";
import { DOM_SELECTORS, REFRESH_ICON_ATTR } from "./preloader";

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
        if (this.isRunning) return;

        this.mutationObserver.observe(<Node>document.querySelector(DOM_SELECTORS.REFRESH_ICON_PARENT), {
            childList: true,
            subtree: false
        });
        this.isRunning = true;
    }

    private onObserverRun(mutations: MutationRecord[]): void {
        mutations.forEach((mutation: MutationRecord) => {
            mutation.removedNodes.forEach((node: Node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const element: HTMLDivElement = <HTMLDivElement>node;

                    if (hasAttributeAndEquals(element, REFRESH_ICON_ATTR.NAME, REFRESH_ICON_ATTR.VALUE)) {
                        this.disableObserver();
                        this.onFinished?.();
                    }
                }
            });
        });
    }
}