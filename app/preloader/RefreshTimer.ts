import { DOM_SELECTORS } from "./preloader";
import { RefreshIconObserver } from "./RefreshIconObserver";

export interface RefreshTimerOptions {
    onRefresh: (() => void) | null;
    refreshRate: number;
}

export class RefreshTimer {
    static DEFAULT_OPTIONS: RefreshTimerOptions = {
        onRefresh: null,
        refreshRate: 10
    };

    private readonly iconObserver: RefreshIconObserver;
    private readonly options: RefreshTimerOptions;
    private timerId: NodeJS.Timer | undefined;

    constructor(options?: Partial<RefreshTimerOptions>) {
        this.options = { ...RefreshTimer.DEFAULT_OPTIONS, ...options };
        this.iconObserver = new RefreshIconObserver(() => this.options.onRefresh?.());
    }

    protected run(): void {
        const refreshButton: HTMLButtonElement | null = document.querySelector(DOM_SELECTORS.REFRESH_BUTTON);

        if (refreshButton) {
            this.iconObserver.enableObserver();
            refreshButton.click();
        }
    }

    startTimer(): void {
        if (this.timerId) return;
        this.timerId = setInterval(this.run.bind(this), (this.options.refreshRate * 1000));
    }
}