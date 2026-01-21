<script lang="ts">
    import type { SpotlightResult } from "../lib/api";
    import { Play, Info } from "lucide-svelte";

    interface Props {
        items: SpotlightResult[];
    }

    let { items }: Props = $props();
    let currentIndex = $state(0);
    let intervalId: number | undefined;

    $effect(() => {
        if (items.length > 1) {
            intervalId = setInterval(() => {
                currentIndex = (currentIndex + 1) % items.length;
            }, 6000) as unknown as number;
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    });

    function goTo(index: number) {
        currentIndex = index;
    }

    function truncate(text: string | undefined, max: number): string {
        if (!text) return "";
        return text.length > max ? text.slice(0, max) + "..." : text;
    }
</script>

{#if items.length > 0}
    {@const current = items[currentIndex]}
    <section class="hero">
        <div
            class="hero-bg"
            style="background-image: url({current.banner ||
                current.cover ||
                current.image})"
        ></div>

        <div class="hero-content">
            <div class="hero-info">
                {#if current.type}
                    <span class="badge badge-accent">{current.type}</span>
                {/if}

                <h1 class="hero-title">{current.title}</h1>

                {#if current.description}
                    <p class="hero-desc">
                        {truncate(current.description, 200)}
                    </p>
                {/if}

                <div class="hero-actions">
                    <a href={`/anime/${current.id}`} class="btn btn-primary">
                        <Play size={20} fill="currentColor" strokeWidth={0} />
                        Watch Now
                    </a>
                    <a href={`/anime/${current.id}`} class="btn btn-ghost">
                        <Info size={18} />
                        More Info
                    </a>
                </div>
            </div>

            {#if items.length > 1}
                <div class="hero-dots">
                    {#each items as _, i}
                        <button
                            type="button"
                            class="dot"
                            class:active={i === currentIndex}
                            onclick={() => goTo(i)}
                            aria-label={`Go to slide ${i + 1}`}
                        ></button>
                    {/each}
                </div>
            {/if}
        </div>
    </section>
{/if}

<style>
    .hero-info {
        max-width: 600px;
    }

    .hero-title {
        font-size: clamp(1.75rem, 5vw, 3rem);
        font-weight: 800;
        margin: var(--spacing-sm) 0;
        text-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
    }

    .hero-desc {
        color: var(--color-text-secondary);
        font-size: 0.95rem;
        line-height: 1.6;
        margin-bottom: var(--spacing-lg);
    }

    .hero-actions {
        display: flex;
        gap: var(--spacing-md);
        flex-wrap: wrap;
    }

    .hero-actions :global(svg) {
        width: 20px;
        height: 20px;
    }

    .hero-dots {
        position: absolute;
        bottom: var(--spacing-lg);
        right: var(--spacing-2xl);
        display: flex;
        gap: 8px;
    }

    .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: var(--color-text-muted);
        border: none;
        cursor: pointer;
        transition: all var(--transition-fast);
        padding: 0;
    }

    .dot:hover,
    .dot.active {
        background: var(--color-accent);
        transform: scale(1.2);
    }

    @media (max-width: 640px) {
        .hero-dots {
            bottom: var(--spacing-md);
            right: var(--spacing-lg);
        }
    }
</style>
