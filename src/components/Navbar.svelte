<script lang="ts">
  import SearchBar from "./SearchBar.svelte";
  import {
    Menu,
    ChevronDown,
    Film,
    Tv,
    Disc,
    Globe,
    Star,
    CircleCheck,
    Tags,
    CalendarDays,
    Bookmark,
  } from "lucide-svelte";
</script>

<nav class="navbar">
  <div class="container nav-content">
    <a href="/" class="logo">
      <span class="logo-icon">月</span>
      <span class="logo-text">Tsukino</span>
    </a>

    <!-- Browse Dropdown -->
    <div class="nav-dropdown" role="navigation">
      <button class="nav-link dropdown-trigger">
        <Menu size={18} strokeWidth={2} />
        <span>Browse</span>
        <ChevronDown class="chevron" size={16} />
      </button>

      <div class="dropdown-menu">
        <div class="dropdown-section">
          <span class="dropdown-label">Type</span>
          <a href="/browse/movies" class="dropdown-item"
            ><Film size={14} /> Movies</a
          >
          <a href="/browse/tv" class="dropdown-item"
            ><Tv size={14} /> TV Series</a
          >
          <a href="/browse/ova" class="dropdown-item"><Disc size={14} /> OVA</a>
          <a href="/browse/ona" class="dropdown-item"><Globe size={14} /> ONA</a
          >
          <a href="/browse/specials" class="dropdown-item"
            ><Star size={14} /> Specials</a
          >
        </div>
        <div class="dropdown-divider"></div>
        <div class="dropdown-section">
          <span class="dropdown-label">Discover</span>
          <a href="/browse/completed" class="dropdown-item"
            ><CircleCheck size={14} /> Completed</a
          >
          <a href="/genres" class="dropdown-item"><Tags size={14} /> Genres</a>
          <a href="/schedule" class="dropdown-item"
            ><CalendarDays size={14} /> Schedule</a
          >
        </div>
      </div>
    </div>

    <div class="nav-center">
      <SearchBar />
    </div>

    <div class="nav-actions">
      <a href="/schedule" class="nav-link nav-icon-only" title="Schedule">
        <CalendarDays size={18} strokeWidth={2} />
      </a>
      <a href="/genres" class="nav-link nav-icon-only" title="Genres">
        <Tags size={18} strokeWidth={2} />
      </a>
      <a href="/watchlist" class="nav-link">
        <Bookmark size={18} strokeWidth={2} />
        <span>Watchlist</span>
      </a>
    </div>
  </div>
</nav>

<style>
  .nav-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-lg);
  }

  .logo {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    text-decoration: none;
    flex-shrink: 0;
  }

  .logo-icon {
    font-size: 1.75rem;
    color: var(--color-accent);
    font-weight: 700;
  }

  .logo-text {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text-primary);
    letter-spacing: -0.02em;
  }

  .nav-dropdown {
    position: relative;
  }

  .dropdown-trigger {
    display: flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: none;
    cursor: pointer;
  }

  .chevron {
    transition: transform 0.2s;
  }

  /* CSS-only dropdown - much more stable than JS hover */
  .dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    padding-top: 8px; /* Bridge gap between trigger and menu */
    opacity: 0;
    visibility: hidden;
    transition:
      opacity 0.2s,
      visibility 0.2s;
    z-index: 100;
  }

  .dropdown-menu::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 8px; /* Invisible bridge */
  }

  .nav-dropdown:hover .dropdown-menu,
  .nav-dropdown:focus-within .dropdown-menu {
    opacity: 1;
    visibility: visible;
  }

  .nav-dropdown:hover .chevron {
    transform: rotate(180deg);
  }

  .dropdown-menu > .dropdown-section,
  .dropdown-menu > .dropdown-divider {
    background: var(--color-bg-secondary);
  }

  .dropdown-menu > .dropdown-section:first-child {
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    padding-top: var(--spacing-sm);
  }

  .dropdown-menu > .dropdown-section:last-child {
    border-radius: 0 0 var(--radius-lg) var(--radius-lg);
    padding-bottom: var(--spacing-sm);
  }

  .dropdown-section {
    padding: var(--spacing-xs) var(--spacing-sm);
    min-width: 180px;
    border: 1px solid var(--color-border);
    border-bottom: none;
  }

  .dropdown-section:last-child {
    border-bottom: 1px solid var(--color-border);
  }

  .dropdown-label {
    display: block;
    padding: 4px 12px;
    font-size: 0.675rem;
    font-weight: 600;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .dropdown-item {
    display: block;
    padding: 8px 12px;
    color: var(--color-text-secondary);
    text-decoration: none;
    font-size: 0.875rem;
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
  }

  .dropdown-item:hover {
    background: var(--color-bg-glass);
    color: var(--color-text-primary);
  }

  .dropdown-divider {
    height: 1px;
    background: var(--color-border);
    border-left: 1px solid var(--color-border);
    border-right: 1px solid var(--color-border);
  }

  .nav-center {
    flex: 1;
    max-width: 500px;
    display: flex;
    justify-content: center;
  }

  .nav-actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    flex-shrink: 0;
  }

  .nav-link {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm) var(--spacing-md);
    color: var(--color-text-secondary);
    text-decoration: none;
    border-radius: var(--radius-md);
    transition: all var(--transition-fast);
    font-size: 0.875rem;
    font-weight: 500;
  }

  .nav-link:hover {
    color: var(--color-text-primary);
    background: var(--color-bg-glass);
  }

  .nav-link svg {
    width: 18px;
    height: 18px;
  }

  .nav-icon-only {
    padding: var(--spacing-sm);
  }

  .nav-icon-only span {
    display: none;
  }

  @media (max-width: 768px) {
    .nav-center {
      display: none;
    }

    .nav-link span {
      display: none;
    }

    .nav-dropdown {
      display: none;
    }

    .nav-icon-only {
      display: flex;
    }
  }

  @media (min-width: 769px) {
    .nav-icon-only {
      display: none;
    }
  }
</style>
