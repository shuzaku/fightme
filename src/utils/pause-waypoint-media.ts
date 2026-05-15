/** When GOING_OUT fires, isPlaying may still be false if the user used native YouTube controls. */

export interface PauseWaypointMediaArgs {
    videoType: string | null | undefined;
    videoRef?: HTMLVideoElement | null;
    youtubePlayer?: { pauseVideo?: () => void } | null;
}

export function pauseWaypointMedia(args: PauseWaypointMediaArgs): void {
    var vt = args.videoType;
    var normalized = typeof vt === 'string' ? vt.toLowerCase() : null;

    if (normalized === 'uploaded') {
        var el = args.videoRef;
        if (el && typeof el.pause === 'function') {
            el.pause();
        }
        return;
    }
    if (normalized === 'youtube') {
        var yt = args.youtubePlayer;
        if (yt && typeof yt.pauseVideo === 'function') {
            yt.pauseVideo();
        }
    }
}
