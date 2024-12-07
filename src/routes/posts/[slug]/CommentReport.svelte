<script lang="ts">
  import { comment_data } from "./comment_store.svelte";
  import { onDestroy } from "svelte";
  onDestroy(() => {
    comment_data.updated = false;
  });
</script>

<div class="bsky_report">
  <a href="#comments" class="post-link">
    <span class="like-stats box">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        class="icon-large"
        class:active={comment_data.likes > 0}
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
        />
      </svg>
      <span>
        {#if comment_data.updated}
          {comment_data.likes ?? 0}
          likes
        {:else}
          ...
        {/if}
      </span>
    </span>
    <span class="repost-stats box">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        class="icon-large"
        fill="none"
        stroke="currentColor"
        class:active={comment_data.reposts > 0}
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3"
        />
      </svg>
      <span class="margin-left-small">
        {#if comment_data.updated}
          {comment_data.reposts ?? 0}
          reposts
        {:else}
          ...
        {/if}
      </span>
    </span>
    <span class="reply-stats box">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        class="icon-large"
        class:active={comment_data.replies > 0}
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
        />
      </svg>
      <span class="margin-left-small">
        {#if comment_data.updated}
          {comment_data.replies ?? 0}
          replies
        {:else}
          ...
        {/if}
      </span>
    </span>
  </a>
</div>

<style>
  .bsky_report a {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem;
    border-radius: 0.5rem;
    background-color: var(--color-bg);
    color: var(--muted-color);
    border: 1px solid var(--color-border);
    margin-top: 1rem;
    text-decoration: none;
    font-size: 0.8rem;
  }

  .bsky_report .box {
    display: flex;
    flex-flow: column;
    align-items: center;
    gap: 0.5rem;
  }

  .bsky_report a svg {
    width: 1.2rem;
    height: 1.2rem;
    color: var(--subtle-highlight);
    fill: currentColor;
  }

  .bsky_report .repost-stats svg {
    fill: none;
  }

  .bsky_report svg.active {
    color: var(--accent);
  }
</style>
