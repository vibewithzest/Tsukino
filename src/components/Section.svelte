<script lang="ts">
    interface Props {
        title: string;
        viewAllLink?: string;
    }

    let { title, viewAllLink }: Props = $props();
</script>

<section class="section">
    <div class="section-header">
        <h2 class="section-title">{title}</h2>

        {#if viewAllLink}
            <a href={viewAllLink} class="view-all">
                View All
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
            </a>
        {/if}
    </div>

    <div class="section-content">
        <slot />
    </div>
</section>

<style>
    .section {
        margin-bottom: var(--spacing-2xl);
    }

    .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--spacing-lg);
    }

    .section-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--color-text-primary);
    }

    .view-all {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--color-accent);
        text-decoration: none;
        font-size: 0.875rem;
        font-weight: 500;
        transition: gap var(--transition-fast);
    }

    .view-all:hover {
        gap: 10px;
    }

    .view-all svg {
        width: 16px;
        height: 16px;
    }

    .section-content {
        width: 100%;
    }
</style>
