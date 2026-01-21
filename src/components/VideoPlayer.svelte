<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import Hls from "hls.js";
    import { saveProgress, getProgress } from "../lib/storage";

    // Props
    export let sources: { url: string; quality: string; isM3U8: boolean }[] =
        [];
    export let servers: { name: string; url: string }[] = [];
    export let subtitles: { url: string; lang: string }[] = [];
    export let episodeId: string = "";
    export let referer: string = "";
    export let isDubAvailable: boolean = false;
    export let externalUrl: string = "";
    export let downloadUrl: string = "";

    // State
    let video: HTMLVideoElement;
    let hls: Hls | null = null;
    let hlsLevels: { index: number; height: number; label: string }[] = [];
    let selectedQualityIndex = -1; // -1 = auto
    let selectedServer = 0;
    let isDub = false;
    let isLoading = true;
    let hasError = false;
    let showControls = true;
    let currentTime = 0;
    let duration = 0;
    let isPlaying = false;
    let volume = 1;
    let isMuted = false;
    let isFullscreen = false;
    let controlsTimeout: ReturnType<typeof setTimeout>;

    // Get current source
    $: currentSource = sources[0]?.url || "";
    $: proxyUrl = currentSource
        ? `/api/proxy?url=${encodeURIComponent(currentSource)}&referer=${encodeURIComponent(referer)}`
        : "";

    // Quality label
    $: selectedQualityLabel =
        selectedQualityIndex === -1
            ? "Auto"
            : hlsLevels.find((l) => l.index === selectedQualityIndex)?.label ||
              "Auto";

    function formatTime(seconds: number) {
        if (!seconds || isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    }

    function resetControlsTimer() {
        showControls = true;
        clearTimeout(controlsTimeout);
        if (isPlaying) {
            controlsTimeout = setTimeout(() => {
                showControls = false;
            }, 3000);
        }
    }

    async function loadVideo() {
        if (!video || !proxyUrl) return;

        isLoading = true;
        hasError = false;
        hlsLevels = [];

        // Destroy existing HLS instance
        if (hls) {
            hls.destroy();
            hls = null;
        }

        if (proxyUrl.includes(".m3u8") || currentSource.includes(".m3u8")) {
            if (Hls.isSupported()) {
                hls = new Hls({
                    maxBufferLength: 30,
                    maxMaxBufferLength: 60,
                });

                hls.loadSource(proxyUrl);
                hls.attachMedia(video);

                hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
                    console.log(
                        "[HLS] Manifest loaded, levels:",
                        data.levels.length,
                    );
                    isLoading = false;

                    // Build quality levels
                    if (hls && hls.levels) {
                        hlsLevels = hls.levels
                            .map((level, index) => ({
                                index,
                                height: level.height,
                                label: level.height
                                    ? `${level.height}p`
                                    : `Level ${index}`,
                            }))
                            .sort((a, b) => b.height - a.height);
                        console.log("[HLS] Quality levels:", hlsLevels);
                    }

                    // Restore progress
                    if (episodeId) {
                        const progress = getProgress(episodeId);
                        if (
                            progress &&
                            !progress.completed &&
                            progress.currentTime > 10
                        ) {
                            video.currentTime = progress.currentTime;
                        }
                    }

                    video
                        .play()
                        .catch((e) =>
                            console.log("[Video] Autoplay blocked:", e),
                        );
                });

                hls.on(Hls.Events.ERROR, (_event, data) => {
                    console.error("[HLS] Error:", data);
                    if (data.fatal) {
                        hasError = true;
                        isLoading = false;
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = proxyUrl;
                isLoading = false;
            }
        } else {
            video.src = proxyUrl;
            isLoading = false;
        }
    }

    function changeQuality(levelIndex: number) {
        selectedQualityIndex = levelIndex;
        if (hls) {
            hls.currentLevel = levelIndex; // -1 = auto
            console.log(
                "[HLS] Changed quality to:",
                levelIndex === -1
                    ? "Auto"
                    : hlsLevels.find((l) => l.index === levelIndex)?.label,
            );
        }
    }

    function changeServer(index: number) {
        if (index === selectedServer || !servers[index]) return;
        selectedServer = index;
        console.log("[Player] Switching to server:", servers[index].name);
    }

    function toggleDub() {
        isDub = !isDub;
        console.log("[Player] Dub mode:", isDub);
    }

    function handleTimeUpdate() {
        currentTime = video.currentTime;
        duration = video.duration || 0;

        // Save progress every 5 seconds
        if (episodeId && Math.floor(currentTime) % 5 === 0) {
            saveProgress({
                episodeId,
                currentTime,
                duration,
                completed: duration > 0 && currentTime / duration > 0.9,
            });
        }
    }

    function handlePlay() {
        isPlaying = true;
        resetControlsTimer();
    }

    function handlePause() {
        isPlaying = false;
        showControls = true;
    }

    function handleLoadedData() {
        isLoading = false;
    }

    function handleWaiting() {
        isLoading = true;
    }

    function handleCanPlay() {
        isLoading = false;
    }

    function togglePlay() {
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    }

    function seek(e: MouseEvent) {
        const target = e.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        video.currentTime = percent * duration;
    }

    function setVolume(e: Event) {
        const input = e.target as HTMLInputElement;
        volume = parseFloat(input.value);
        video.volume = volume;
        isMuted = volume === 0;
    }

    function toggleMute() {
        isMuted = !isMuted;
        video.muted = isMuted;
    }

    function toggleFullscreen() {
        const container = video.parentElement?.parentElement;
        if (!container) return;

        if (!document.fullscreenElement) {
            container.requestFullscreen();
            isFullscreen = true;
        } else {
            document.exitFullscreen();
            isFullscreen = false;
        }
    }

    function handleDownload() {
        // Use the download URL or original source
        const url = downloadUrl || currentSource;
        if (url) {
            // Create a temporary link and click it
            const a = document.createElement("a");
            a.href = url;
            a.download = `episode_${episodeId || "video"}.mp4`;
            a.target = "_blank";
            a.rel = "noopener";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    }

    onMount(() => {
        loadVideo();

        document.addEventListener("fullscreenchange", () => {
            isFullscreen = !!document.fullscreenElement;
        });
    });

    onDestroy(() => {
        if (hls) {
            hls.destroy();
        }
        clearTimeout(controlsTimeout);
    });
</script>

<div
    class="video-player-container"
    class:show-controls={showControls || !isPlaying || isLoading}
    on:mousemove={resetControlsTimer}
    on:click={resetControlsTimer}
    role="region"
    aria-label="Video player"
>
    {#if hasError}
        <div class="player-error">
            <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
                <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm0-4h-2V7h2v6z"
                />
            </svg>
            <p>Unable to load video</p>
            {#if externalUrl}
                <a
                    href={externalUrl}
                    target="_blank"
                    rel="noopener"
                    class="btn btn-primary"
                >
                    Watch on External Site
                </a>
            {/if}
        </div>
    {:else}
        <!-- svelte-ignore a11y_media_has_caption -->
        <video
            bind:this={video}
            class="video-element"
            playsinline
            on:timeupdate={handleTimeUpdate}
            on:play={handlePlay}
            on:pause={handlePause}
            on:loadeddata={handleLoadedData}
            on:waiting={handleWaiting}
            on:canplay={handleCanPlay}
            on:click={togglePlay}
        >
            {#each subtitles as sub}
                <track
                    kind="subtitles"
                    src={sub.url}
                    srclang={sub.lang?.substring(0, 2) || "en"}
                    label={sub.lang || "Subtitles"}
                />
            {/each}
        </video>

        {#if isLoading}
            <div class="loading-overlay">
                <div class="spinner"></div>
            </div>
        {/if}

        <!-- Custom Controls -->
        <div class="controls-overlay">
            <!-- Top Bar -->
            <div class="top-bar">
                <div class="control-group">
                    <!-- Quality Selector -->
                    <div class="dropdown">
                        <button class="control-btn" title="Quality">
                            <svg
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                width="20"
                                height="20"
                            >
                                <path
                                    d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 12H9.5v-2h-2v2H6V9h1.5v2.5h2V9H11v6zm7-1c0 .55-.45 1-1 1h-.75v1.5h-1.5V15H14c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v4zm-3.5-.5h2v-3h-2v3z"
                                />
                            </svg>
                            <span>{selectedQualityLabel}</span>
                        </button>
                        <div class="dropdown-menu">
                            <button
                                class="dropdown-item"
                                class:active={selectedQualityIndex === -1}
                                on:click={() => changeQuality(-1)}
                            >
                                Auto
                            </button>
                            {#each hlsLevels as level}
                                <button
                                    class="dropdown-item"
                                    class:active={level.index ===
                                        selectedQualityIndex}
                                    on:click={() => changeQuality(level.index)}
                                >
                                    {level.label}
                                </button>
                            {/each}
                            {#if hlsLevels.length === 0}
                                <span class="dropdown-item disabled"
                                    >Loading...</span
                                >
                            {/if}
                        </div>
                    </div>

                    <!-- Server Selector -->
                    {#if servers.length > 1}
                        <div class="dropdown">
                            <button class="control-btn" title="Server">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    width="20"
                                    height="20"
                                >
                                    <path
                                        d="M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 19c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM20 3H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"
                                    />
                                </svg>
                                <span>Server {selectedServer + 1}</span>
                            </button>
                            <div class="dropdown-menu">
                                {#each servers as server, i}
                                    <button
                                        class="dropdown-item"
                                        class:active={i === selectedServer}
                                        on:click={() => changeServer(i)}
                                    >
                                        {server.name}
                                    </button>
                                {/each}
                            </div>
                        </div>
                    {/if}

                    <!-- Sub/Dub Toggle -->
                    {#if isDubAvailable}
                        <button
                            class="control-btn"
                            title="Toggle Sub/Dub"
                            on:click={toggleDub}
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                width="20"
                                height="20"
                            >
                                <path
                                    d="M21 4H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H3V6h18v12z"
                                />
                                <path d="M6 10h2v4H6zm3 0h5v1H9zm0 2h5v1H9z" />
                            </svg>
                            <span>{isDub ? "DUB" : "SUB"}</span>
                        </button>
                    {/if}

                    <!-- Download -->
                    <button
                        class="control-btn"
                        title="Download Episode"
                        on:click={handleDownload}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            width="20"
                            height="20"
                        >
                            <path
                                d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"
                            />
                        </svg>
                        <span>Download</span>
                    </button>
                </div>

                {#if externalUrl}
                    <a
                        href={externalUrl}
                        target="_blank"
                        rel="noopener"
                        class="control-btn external-link"
                        title="Open External"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            width="18"
                            height="18"
                        >
                            <path
                                d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"
                            />
                        </svg>
                    </a>
                {/if}
            </div>

            <!-- Bottom Bar -->
            <div class="bottom-bar">
                <!-- Play/Pause -->
                <button
                    class="control-btn play-btn"
                    on:click={togglePlay}
                    title={isPlaying ? "Pause" : "Play"}
                >
                    {#if isPlaying}
                        <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            width="28"
                            height="28"
                        >
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                    {:else}
                        <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            width="28"
                            height="28"
                        >
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    {/if}
                </button>

                <!-- Time -->
                <span class="time-display">
                    {formatTime(currentTime)} / {formatTime(duration)}
                </span>

                <!-- Progress Bar -->
                <div
                    class="progress-bar"
                    on:click={seek}
                    role="slider"
                    tabindex="0"
                    aria-label="Seek"
                >
                    <div class="progress-bg">
                        <div
                            class="progress-fill"
                            style="width: {duration
                                ? (currentTime / duration) * 100
                                : 0}%"
                        ></div>
                    </div>
                </div>

                <!-- Volume -->
                <button
                    class="control-btn"
                    on:click={toggleMute}
                    title={isMuted ? "Unmute" : "Mute"}
                >
                    {#if isMuted || volume === 0}
                        <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            width="22"
                            height="22"
                        >
                            <path
                                d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"
                            />
                        </svg>
                    {:else}
                        <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            width="22"
                            height="22"
                        >
                            <path
                                d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
                            />
                        </svg>
                    {/if}
                </button>
                <input
                    type="range"
                    class="volume-slider"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    on:input={setVolume}
                    aria-label="Volume"
                />

                <!-- Fullscreen -->
                <button
                    class="control-btn"
                    on:click={toggleFullscreen}
                    title="Fullscreen"
                >
                    {#if isFullscreen}
                        <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            width="22"
                            height="22"
                        >
                            <path
                                d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"
                            />
                        </svg>
                    {:else}
                        <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            width="22"
                            height="22"
                        >
                            <path
                                d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"
                            />
                        </svg>
                    {/if}
                </button>
            </div>
        </div>
    {/if}
</div>

<style>
    .video-player-container {
        position: relative;
        width: 100%;
        height: 100%;
        background: #000;
        overflow: hidden;
    }

    .video-element {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }

    .loading-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.5);
        pointer-events: none;
    }

    .spinner {
        width: 48px;
        height: 48px;
        border: 3px solid rgba(255, 255, 255, 0.3);
        border-top-color: var(--color-accent, #22c55e);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .controls-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        opacity: 0;
        transition: opacity 0.3s;
        background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.7) 0%,
            transparent 25%,
            transparent 75%,
            rgba(0, 0, 0, 0.7) 100%
        );
    }

    .video-player-container.show-controls .controls-overlay {
        opacity: 1;
    }

    .top-bar {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 12px 16px;
    }

    .control-group {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
    }

    .bottom-bar {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
    }

    .control-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 12px;
        background: rgba(0, 0, 0, 0.7);
        border: none;
        border-radius: 6px;
        color: white;
        font-size: 0.8rem;
        cursor: pointer;
        transition: background 0.2s;
        white-space: nowrap;
    }

    .control-btn:hover {
        background: rgba(255, 255, 255, 0.25);
    }

    .play-btn {
        padding: 8px;
    }

    .time-display {
        font-size: 0.875rem;
        color: white;
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
    }

    .progress-bar {
        flex: 1;
        height: 24px;
        display: flex;
        align-items: center;
        cursor: pointer;
    }

    .progress-bg {
        width: 100%;
        height: 4px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 2px;
        overflow: hidden;
    }

    .progress-bar:hover .progress-bg {
        height: 6px;
    }

    .progress-fill {
        height: 100%;
        background: var(--color-accent, #22c55e);
        transition: width 0.1s;
    }

    .volume-slider {
        width: 80px;
        height: 4px;
        -webkit-appearance: none;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 2px;
        cursor: pointer;
    }

    .volume-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 14px;
        height: 14px;
        background: white;
        border-radius: 50%;
    }

    /* Dropdown - CSS hover based */
    .dropdown {
        position: relative;
    }

    .dropdown-menu {
        position: absolute;
        top: 100%;
        left: 0;
        margin-top: 4px;
        background: rgba(0, 0, 0, 0.95);
        border-radius: 8px;
        padding: 6px;
        min-width: 120px;
        z-index: 10;
        opacity: 0;
        visibility: hidden;
        transition:
            opacity 0.2s,
            visibility 0.2s;
    }

    .dropdown:hover .dropdown-menu {
        opacity: 1;
        visibility: visible;
    }

    .dropdown-item {
        display: block;
        width: 100%;
        padding: 8px 12px;
        background: none;
        border: none;
        color: white;
        font-size: 0.8rem;
        text-align: left;
        cursor: pointer;
        border-radius: 4px;
    }

    .dropdown-item:hover {
        background: rgba(255, 255, 255, 0.15);
    }

    .dropdown-item.active {
        background: var(--color-accent, #22c55e);
        color: black;
    }

    .dropdown-item.disabled {
        color: #666;
        cursor: default;
    }

    .player-error {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        gap: 16px;
        color: #888;
    }

    .external-link {
        text-decoration: none;
    }

    @media (max-width: 600px) {
        .control-btn span {
            display: none;
        }

        .volume-slider {
            width: 60px;
        }
    }
</style>
