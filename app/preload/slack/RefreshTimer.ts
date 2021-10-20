import { DOM_SELECTORS } from "./preload";
import { RefreshIconObserver } from "./RefreshIconObserver";

export interface RefreshTimerOptions {
    isEnabled: boolean;
    onRefresh: (() => void) | null;
    refreshRate: number;
}

export class RefreshTimer {
    static DEFAULT_OPTIONS: RefreshTimerOptions = {
        isEnabled: true,
        onRefresh: null,
        refreshRate: 15
    };

    private options: RefreshTimerOptions;
    private timerId: NodeJS.Timer | undefined;
    private readonly iconObserver: RefreshIconObserver;

    constructor(options?: Partial<RefreshTimerOptions>) {
        this.options = { ...RefreshTimer.DEFAULT_OPTIONS, ...options };
        this.iconObserver = new RefreshIconObserver(() => this.options.onRefresh?.());
        if (this.options.isEnabled) this.startTimer();
    }

    changeOptions(options: Partial<RefreshTimerOptions>): void {
        if (this.isEnabled()) this.stopTimer();
        this.options = { ...this.options, ...options };
        if (this.isEnabled()) this.startTimer();
    }

    private isEnabled(): boolean {
        return this.options.isEnabled;
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

    stopTimer(): void {
        if (!this.timerId) return;
        clearInterval(this.timerId);
        this.timerId = undefined;
    }
}