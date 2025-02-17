<script lang="ts" module>
  import { PUBLIC_BLUESKY_DID } from "$env/static/public";
  import { type AppBskyFeedGetLikes } from "@atproto/api";
  export type Props = {
    threadId: string;
    count?: number;
  };
</script>

<script lang="ts">
  const did = PUBLIC_BLUESKY_DID;
  let { threadId, count }: Props = $props();

  const getLikes = async (uri: string) => {
    const url = new URL("https://public.api.bsky.app/xrpc/app.bsky.feed.getLikes");
    url.searchParams.set("uri", uri);
    url.searchParams.set("limit", "50");

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json"
      },
      cache: "no-store"
    });

    if (!res.ok) {
      console.error(await res.text());
      throw new Error("Failed to fetch post thread");
    }

    const data = (await res.json()) as AppBskyFeedGetLikes.OutputSchema;
    return data.likes;
  };

  const loader: Promise<AppBskyFeedGetLikes.Like[]> = getLikes(
    `at://${did}/app.bsky.feed.post/${threadId}`
  );
</script>

<div class="likes-container">
  {#await loader}
    {#if count && count > 0}
      {#each Array(count) as _}
        <div class="skele"></div>
      {/each}
    {:else}
      <div class="skele"></div>
    {/if}
  {:then likes}
    {#each likes.reverse() as like}
      {#if like.actor.avatar}
        <a
          href="https://bsky.app/profile/{like.actor.handle}"
          class="like-link"
          title="{like.actor.displayName} - {like.actor.description}"
        >
          <img
            src={like.actor.avatar}
            alt="{like.actor.displayName} - {like.actor.description}"
            width="32"
            height="32"
          />
        </a>
      {/if}
    {/each}
  {/await}
</div>

<style>
  .likes-container {
    padding-top: 0.5rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    width: 100%;
    align-items: center;
  }

  .like-link {
    display: block;
    width: 2rem;
    height: 2rem;
  }

  .like-link:hover {
    transform: scale(1.1);
    transition: transform 0.2s ease;
  }

  img {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    object-fit: cover;
  }

  .skele {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.02);
  }
</style>
