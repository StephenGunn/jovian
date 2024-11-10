<script lang="ts">
  let { video }: { video: string } = $props();
</script>

<div class="video-container">
  {#if video}
    <video controls>
      <track kind="captions" />
      <source src={video} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  {:else}
    <p>No video URL provided</p>
  {/if}
</div>

<style>
  .video-container {
    position: relative;
    width: 100%;
    padding-top: 56.25%; /* 16:9 aspect ratio */
    overflow: hidden;
  }

  .video-container video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
  }
</style>
