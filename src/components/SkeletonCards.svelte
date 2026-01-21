<script lang="ts">
    interface Props {
        count?: number;
    }

    let { count = 6 }: Props = $props();
</script>

<div class="skeleton-grid">
    {#each Array(count) as _}
        <div class="skeleton-card">
            <div class="skeleton-image"></div>
            <div class="skeleton-title"></div>
            <div class="skeleton-subtitle"></div>
        </div>
    {/each}
</div>

<style>
    .skeleton-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: var(--spacing-lg);
    }

    @media (max-width: 640px) {
        .skeleton-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: var(--spacing-md);
        }
    }
</style>
