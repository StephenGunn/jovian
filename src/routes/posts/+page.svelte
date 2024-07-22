<script lang="ts">
  let { data } = $props();
  let { posts } = data;
  console.log(data);
</script>

<h1>Posts</h1>
<ul>
  {#each posts as post}
    <li><a href="/posts/{post.slug}">{post.title}</a></li>
  {/each}
</ul>
