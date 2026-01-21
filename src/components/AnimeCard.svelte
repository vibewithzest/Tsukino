<script lang="ts">
  import { Play, Star, Tv } from "lucide-svelte";

  interface Props {
    id: string;
    title: string;
    image: string;
    type?: string;
    episodeCount?: number;
    rating?: number;
  }

  let { id, title, image, type, episodeCount, rating }: Props = $props();
</script>

<a href={`/anime/${id}`} class="anime-card glass-card">
  <div class="card-image">
    <img src={image} alt={title} loading="lazy" />

    {#if type}
      <span class="card-badge">{type}</span>
    {/if}

    {#if episodeCount}
      <span class="card-episodes">
        <Tv size={12} />
        {episodeCount}
      </span>
    {/if}

    <div class="card-overlay">
      <Play class="play-icon" size={48} fill="currentColor" strokeWidth={0} />
    </div>
  </div>

  <div class="card-content">
    <h3 class="card-title">{title}</h3>

    {#if rating}
      <div class="card-rating">
        <Star size={12} fill="currentColor" strokeWidth={0} />
        <span>{rating.toFixed(1)}</span>
      </div>
    {/if}
  </div>
</a>

<style>
  .anime-card {
    display: block;
    text-decoration: none;
    overflow: hidden;
  }

  .card-image {
    position: relative;
    aspect-ratio: 3 / 4;
    overflow: hidden;
    border-radius: var(--radius-md);
  }

  .card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform var(--transition-slow);
  }

  .anime-card:hover .card-image img {
    transform: scale(1.1);
  }

  .card-badge {
    position: absolute;
    top: 8px;
    left: 8px;
    padding: 2px 8px;
    background: var(--color-accent);
    color: var(--color-bg-primary);
    font-size: 0.625rem;
    font-weight: 600;
    text-transform: uppercase;
    border-radius: var(--radius-sm);
  }

  .card-episodes {
    position: absolute;
    bottom: 8px;
    right: 8px;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    color: var(--color-text-primary);
    font-size: 0.75rem;
    font-weight: 500;
    border-radius: var(--radius-sm);
  }

  .card-episodes :global(svg) {
    width: 12px;
    height: 12px;
  }

  .card-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    opacity: 0;
    transition: opacity var(--transition-fast);
  }

  .anime-card:hover .card-overlay {
    opacity: 1;
  }

  :global(.play-icon) {
    width: 48px;
    height: 48px;
    color: var(--color-accent);
    filter: drop-shadow(0 0 10px var(--color-accent-glow));
    transform: scale(0.8);
    transition: transform var(--transition-fast);
  }

  .anime-card:hover :global(.play-icon) {
    transform: scale(1);
  }

  .card-content {
    padding: var(--spacing-sm) var(--spacing-xs);
  }

  .card-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-primary);
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-bottom: 4px;
  }

  .card-rating {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #fbbf24;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .card-rating :global(svg) {
    width: 12px;
    height: 12px;
  }
</style>
