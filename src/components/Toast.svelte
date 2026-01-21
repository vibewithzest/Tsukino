<script lang="ts">
    import { X, CheckCircle, AlertCircle, Info } from "lucide-svelte";

    interface Toast {
        id: number;
        message: string;
        type: "success" | "error" | "info";
    }

    let toasts: Toast[] = $state([]);
    let nextId = 0;

    export function showToast(
        message: string,
        type: Toast["type"] = "success",
    ) {
        const id = nextId++;
        toasts = [...toasts, { id, message, type }];

        // Auto-remove after 3 seconds
        setTimeout(() => {
            removeToast(id);
        }, 3000);
    }

    function removeToast(id: number) {
        toasts = toasts.filter((t) => t.id !== id);
    }

    // Expose globally for other components
    if (typeof window !== "undefined") {
        (window as any).showToast = showToast;
    }
</script>

<div class="toast-container">
    {#each toasts as toast (toast.id)}
        <div class="toast toast-{toast.type}" role="alert">
            <span class="toast-icon">
                {#if toast.type === "success"}
                    <CheckCircle size={18} />
                {:else if toast.type === "error"}
                    <AlertCircle size={18} />
                {:else}
                    <Info size={18} />
                {/if}
            </span>
            <span class="toast-message">{toast.message}</span>
            <button class="toast-close" onclick={() => removeToast(toast.id)}>
                <X size={16} />
            </button>
        </div>
    {/each}
</div>

<style>
    .toast-container {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 12px;
        pointer-events: none;
    }

    .toast {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background: rgba(20, 20, 30, 0.95);
        backdrop-filter: blur(12px);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-elevated);
        pointer-events: all;
        animation: slideIn 0.3s ease-out;
        min-width: 280px;
        max-width: 400px;
    }

    .toast-success {
        border-color: var(--color-accent);
    }

    .toast-success .toast-icon {
        color: var(--color-accent);
    }

    .toast-error {
        border-color: #f43f5e;
    }

    .toast-error .toast-icon {
        color: #f43f5e;
    }

    .toast-info {
        border-color: #3b82f6;
    }

    .toast-info .toast-icon {
        color: #3b82f6;
    }

    .toast-icon {
        flex-shrink: 0;
    }

    .toast-message {
        flex: 1;
        font-size: 0.875rem;
        color: var(--color-text-primary);
    }

    .toast-close {
        flex-shrink: 0;
        background: none;
        border: none;
        color: var(--color-text-muted);
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.15s ease;
    }

    .toast-close:hover {
        color: var(--color-text-primary);
    }

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @media (max-width: 640px) {
        .toast-container {
            left: 16px;
            right: 16px;
            bottom: 16px;
        }

        .toast {
            min-width: 0;
            max-width: none;
        }
    }
</style>
