<script lang="ts">
  interface Props {
    src: string;
    caption: string;
    alt?: string;
  }

  let { src, caption, alt = caption }: Props = $props();
</script>

<figure>
  <img src="/{src}" {alt} />
  <figcaption>{caption}</figcaption>
</figure>

<style>
  figure {
    margin: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  img {
    width: 100%;
    border-radius: 0.5rem;
    box-shadow: rba(0, 0, 0, 0.1) 0px 2px 2px;
  }

  figcaption {
    text-align: center;
    color: var(--text-muted);
    font-size: 0.9rem;
    font-style: italic;
  }
</style>
