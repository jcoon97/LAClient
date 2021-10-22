import { ipcInvoke } from "../preload";

export interface NotificationPreferences {
    enabled: boolean; // True if audio notifications were enabled by the user
    srcUrl: string | undefined; // Base64 Data URL for loading the Audio class
    timeout: number; // The amount of seconds to wait before a new notification is played
    volume: number; // The volume (0.0 to 1.0) that the user specified, if enabled
}

export class NotificationManager {
    private static INSTANCE: NotificationManager | undefined;

    private element: HTMLAudioElement | undefined;
    private canPlay: boolean = false;
    private isPlaying: boolean = false;
    private lastPlayed: number | undefined;

    private options: NotificationPreferences | undefined;

    private killAudio(): void {
        if (this.element) {
            this.element.pause();
            this.element = undefined;
            this.canPlay = false;
            this.isPlaying = false;
        }
    }

    private async loadAudio(): Promise<void> {
        if (!this.options || !this.options.srcUrl) return;
        this.element = new Audio(this.options.srcUrl);
        this.element.volume = this.options.volume;

        this.element.addEventListener("canplaythrough", (): boolean => this.canPlay = true);
        this.element.addEventListener("ended", (): boolean => this.isPlaying = false);
        this.element.addEventListener("play", (): boolean => this.isPlaying = true);
    }

    async loadOptions(): Promise<void> {
        // If we are loading options and already have an Audio class defined,
        // kill it first, and then continue on with grabbing the updated preferences
        this.killAudio();

        // Grab all of our user-defined preferences via IPC
        const enabled: boolean = await ipcInvoke<boolean, IpcGetPreference>("getPreference", {
            key: "audioNotify.enabled"
        });

        const srcUrl: string | undefined = await ipcInvoke<string | undefined>("getNotificationSound");

        const timeout: number = await ipcInvoke<number, IpcGetPreference>("getPreference", {
            key: "audioNotify.timeout"
        });

        const volume: number = await ipcInvoke<number, IpcGetPreference>("getPreference", {
            key: "audioNotify.volume"
        });

        // Update our preferences and load a new Audio class instance
        this.options = { ...this.options, enabled, srcUrl, timeout, volume };
        await this.loadAudio();
    }

    play(): void {
        if (this.options?.enabled && this.canPlay && !this.isPlaying) {
            // Check and confirm that a previous notification sound didn't just play. If it
            // did and we have not reached the user-defined timeout period, then don't play
            // the notification until that condition is met. Otherwise, play the notification.
            const currentTime: number = Math.floor(Date.now() / 1000);
            if (this.lastPlayed && ((currentTime - this.lastPlayed) < this.options.timeout)) return;
            this.element?.play();
            this.lastPlayed = currentTime;
        }
    }

    test(): void {
        if (this.canPlay && !this.isPlaying) {
            this.element?.play();
        }
    }

    static getManager(): NotificationManager {
        if (!NotificationManager.INSTANCE) {
            NotificationManager.INSTANCE = new NotificationManager();
        }
        return NotificationManager.INSTANCE;
    }
}