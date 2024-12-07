<script lang="ts" module>
  import {
    AppBskyFeedDefs,
    AppBskyFeedPost,
    type AppBskyFeedGetPostThread
  } from "@atproto/api";
  import type { ThreadViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
  import { comment_data } from "../../../routes/posts/[slug]/comment_store.svelte";

  export type CommentsProps = {
    did: string;
    threadId: string;
  };
  export type Reply = {
    post: {
      uri: string;
      likeCount?: number;
      repostCount?: number;
      replyCount?: number;
    };
  };

  export type Thread = {
    replies: Reply[];
    post: {
      likeCount?: number;
      repostCount?: number;
      replyCount?: number;
    };
  };
</script>

<script lang="ts">
  import CommentLink from "$lib/layout/CommentLink.svelte";

  let { did, threadId }: CommentsProps = $props();
  let postUrl = `https://bsky.app/profile/${did}/post/${threadId}`;

  const getPostThread = async (uri: string) => {
    const params = new URLSearchParams({ uri });

    const res = await fetch(
      "https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?" + params.toString(),
      {
        method: "GET",
        headers: {
          Accept: "application/json"
        },
        cache: "no-store"
      }
    );

    if (!res.ok) {
      console.error(await res.text());
      throw new Error("Failed to fetch post thread");
    }

    const data = (await res.json()) as AppBskyFeedGetPostThread.OutputSchema;

    if (!AppBskyFeedDefs.isThreadViewPost(data.thread)) {
      throw new Error("Could not find thread");
    }

    comment_data.updated = true;
    comment_data.likes = data.thread.post.likeCount ?? 0;
    comment_data.reposts = data.thread.post.repostCount ?? 0;
    comment_data.replies = data.thread.post.replyCount ?? 0;
    return data.thread;
  };

  const sortByLikes = (a: unknown, b: unknown) => {
    if (!AppBskyFeedDefs.isThreadViewPost(a) || !AppBskyFeedDefs.isThreadViewPost(b)) {
      return 0;
    }
    return (b.post.likeCount ?? 0) - (a.post.likeCount ?? 0);
  };

  let visibleCount = $state(10);
  const loader: Promise<ThreadViewPost> = getPostThread(
    `at://${did}/app.bsky.feed.post/${threadId}`
  );
</script>

{#await loader}
  Loading...
{:then thread}
  {@const sortedReplies = thread.replies?.sort(sortByLikes) ?? []}

  <CommentLink
    href={postUrl}
    likes={thread.post.likeCount ?? 0}
    reposts={thread.post.repostCount ?? 0}
    replies={thread.post.replyCount ?? 0}
  />

  {#if thread.replies && thread.replies.length > 0}
    <h2>Comments</h2>
  {/if}

  <div class="comment-list">
    {#each sortedReplies.slice(0, visibleCount) as reply}
      {#if AppBskyFeedDefs.isThreadViewPost(reply) && AppBskyFeedPost.isRecord(reply.post.record)}
        {@render renderComment(reply)}
      {/if}
    {/each}
    {#if visibleCount < sortedReplies.length}
      <button onclick={() => (visibleCount += 5)} class="show-more-button">
        Show more comments
      </button>
    {/if}
  </div>
{:catch error}
  <div class="error-box">
    Something went wrong {error}
  </div>
{/await}

{#snippet renderComment(comment: AppBskyFeedDefs.ThreadViewPost)}
  {@const author = comment.post.author}
  <div class="comment-wrapper">
    <div class="comment-container">
      <a
        class="comment-author-link"
        href={`https://bsky.app/profile/${author.did}`}
        target="_blank"
        rel="noreferrer noopener"
      >
        {#if author.avatar}
          <img src={comment.post.author.avatar} alt="avatar" class="author-avatar" />
        {:else}
          <div class="author-avatar"></div>
        {/if}
        <p class="line-clamp-1">
          {author.displayName ?? author.handle}
          <span class="gray-text">@{author.handle}</span>
        </p>
      </a>
      <a
        href={`https://bsky.app/profile/${author.did}/post/${comment.post.uri.split("/").pop()}`}
        target="_blank"
        rel="noreferrer noopener"
      >
        <p>{(comment.post.record as { text: string }).text}</p>
        <div class="comment-meta">
          <div class="meta-item">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="icon-small"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
              />
            </svg>

            <p class="text-xs">{comment.post.replyCount ?? 0}</p>
          </div>
          <div class="meta-item">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="icon-small"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3"
              />
            </svg>
            <p class="text-xs">{comment.post.repostCount ?? 0}</p>
          </div>
          <div class="meta-item">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="icon-small"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
              />
            </svg>
            <p class="text-xs">{comment.post.likeCount ?? 0}</p>
          </div>
        </div>
      </a>
    </div>
    {#if comment.replies && comment.replies.length > 0}
      {@const sortedReplies = comment.replies.sort(sortByLikes)}
      <div class="nested-replies">
        {#each sortedReplies as reply}
          {#if AppBskyFeedDefs.isThreadViewPost(reply) && AppBskyFeedPost.isRecord(reply.post.record)}
            {@render renderComment(reply)}
          {/if}
        {/each}
      </div>
    {/if}
  </div>
{/snippet}

<style>
  h2 {
    padding: 1.5rem 0 0rem;
    margin: 0;
    border-bottom: 2px dashed var(--bg-accent-1);
  }

  a {
    color: var(--font-color);
  }

  a:hover {
    text-decoration: none;
  }

  a:hover .comment-meta {
    color: var(--primary);
  }

  .comment-list {
    margin-top: 0.5rem;
  }
  .comment-list > * + * {
    margin-top: 2rem;
  }

  .show-more-button {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: var(--accent);
    text-decoration: underline;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
  }

  .error-box {
    border: 1px solid var(--accent);
    border-radius: 0.5rem;
    padding: 1rem;
  }

  .comment-wrapper {
    margin-top: 1rem;
    margin-bottom: 1rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
  }

  .comment-container {
    display: flex;
    flex-direction: column;
    max-width: 36rem;
    gap: 0.5rem;
  }

  .comment-author-link {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    font-weight: bold;
  }
  .comment-author-link:hover {
    color: var(--accent);
  }

  .author-avatar {
    height: 1.5rem;
    width: 1.5rem;
    flex-shrink: 0;
    border-radius: 9999px;
    background-color: var(--muted-color);
    border: 1px solid var(--muted-color);
  }

  .line-clamp-1 {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .gray-text {
    color: var(--muted-color);
    font-weight: normal;
  }

  .comment-meta {
    margin-top: 0.5rem;
    display: flex;
    width: 100%;
    max-width: 150px;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    opacity: 0.6;
  }

  .icon-small {
    width: 1rem;
    height: 1rem;
  }

  .meta-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.375rem;
  }

  .nested-replies {
    border-left: 2px solid var(--bg-accent-2);
    padding-left: 0.5rem;
  }
</style>
