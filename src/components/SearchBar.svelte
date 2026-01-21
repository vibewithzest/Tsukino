<script lang="ts">
  import { getSearchSuggestions, type AnimeResult } from "../lib/api";
  import { Search } from "lucide-svelte";

  let searchQuery = $state("");
  let suggestions = $state<AnimeResult[]>([]);
  let showSuggestions = $state(false);
  let loading = $state(false);
  let debounceTimer: number | undefined;

  async function handleInput() {
    const query = searchQuery.trim();

    if (query.length < 2) {
      suggestions = [];
      showSuggestions = false;
      return;
    }

    // Debounce
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      loading = true;
      try {
        suggestions = await getSearchSuggestions(query);
        showSuggestions = suggestions.length > 0;
      } catch (e) {
        suggestions = [];
      }
      loading = false;
    }, 300) as unknown as number;
  }

  function handleSubmit(e: Event) {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  }

  function selectSuggestion(anime: AnimeResult) {
    window.location.href = `/anime/${anime.id}`;
  }

  function handleBlur() {
    // Delay to allow click on suggestion
    setTimeout(() => {
      showSuggestions = false;
    }, 200);
  }
</script>

<form onsubmit={handleSubmit} class="search-container">
  <div class="search-wrapper">
    <Search class="search-icon" size={18} strokeWidth={2} />

    <input
      type="text"
      bind:value={searchQuery}
      oninput={handleInput}
      onfocus={() => suggestions.length > 0 && (showSuggestions = true)}
      onblur={handleBlur}
      placeholder="Search anime..."
      class="search-input"
    />

    {#if loading}
      <div class="search-spinner"></div>
    {/if}
  </div>

  {#if showSuggestions}
    <div class="suggestions">
      {#each suggestions.slice(0, 6) as anime}
        <button
          type="button"
          class="suggestion-item"
          onclick={() => selectSuggestion(anime)}
        >
          <img src={anime.image} alt="" class="suggestion-img" />
          <div class="suggestion-info">
            <span class="suggestion-title">{anime.title}</span>
            {#if anime.type}
              <span class="suggestion-type">{anime.type}</span>
            {/if}
          </div>
        </button>
      {/each}
    </div>
  {/if}
</form>

<style>
  .search-container {
    position: relative;
    width: 100%;
    max-width: 400px;
  }

  .search-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-icon {
    position: absolute;
    left: 12px;
    width: 18px;
    height: 18px;
    color: var(--color-text-muted);
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    padding: 10px 40px 10px 40px;
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text-primary);
    font-size: 0.875rem;
    transition: all var(--transition-fast);
  }

  .search-input::placeholder {
    color: var(--color-text-muted);
  }

  .search-input:focus {
    outline: none;
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px var(--color-accent-glow);
  }

  .search-spinner {
    position: absolute;
    right: 12px;
    width: 16px;
    height: 16px;
    border: 2px solid var(--color-border);
    border-top-color: var(--color-accent);
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .suggestions {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 8px;
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    overflow: hidden;
    z-index: 100;
    box-shadow: var(--shadow-elevated);
  }

  .suggestion-item {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 10px 12px;
    background: transparent;
    border: none;
    cursor: pointer;
    text-align: left;
    transition: background var(--transition-fast);
  }

  .suggestion-item:hover {
    background: var(--color-bg-glass);
  }

  .suggestion-img {
    width: 40px;
    height: 56px;
    object-fit: cover;
    border-radius: var(--radius-sm);
  }

  .suggestion-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow: hidden;
  }

  .suggestion-title {
    color: var(--color-text-primary);
    font-size: 0.875rem;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .suggestion-type {
    color: var(--color-text-muted);
    font-size: 0.75rem;
  }
</style>
