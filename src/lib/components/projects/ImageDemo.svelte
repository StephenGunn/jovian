<script lang="ts">
  import "$lib/css/forms.css";
  let text = $state("Demo Text");
  let current_text = $state("Demo Text");
  let disabled = $state(false);

  const debounce = async (fn: Function, ms: number) => {
    disabled = true;
    await fn();
    setTimeout(() => {
      disabled = false;
    }, ms);
  };

  const regenerate = () => {
    if (text === current_text) {
      return;
    }

    debounce(() => {
      current_text = text;
    }, 5000);
  };
</script>

{#key current_text}
  <div class="image">
    <img src="/api/images/demo?text={current_text}" alt={text} />
    <div class="loading">
      <span class="loader"></span>
    </div>
  </div>
{/key}

<div class="controls">
  <input type="text" bind:value={text} maxlength="120" />
  <button onclick={regenerate} disabled={disabled || text === current_text}>
    {#if disabled}
      Debouncing...
    {:else}
      Regenerate Image
    {/if}
  </button>
</div>

<style>
  .controls {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 1rem;
    margin: 1rem;
  }
  .image {
    position: relative;
    background: var(--semi-transparent);
    aspect-ratio: 2 / 1;
    width: 100%;
    display: flex;
    justify-content: center;
    margin: 0 !important;
    padding: 0 !important;
  }
  img {
    position: absolute;
    z-index: 2;
    width: 100%;
    max-width: 100%;
    max-height: 100%;
  }
  .loading {
    position: absolute;
    z-index: 1;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .loader {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    display: block;
    margin: 15px auto;
    position: relative;
    color: #fff;
    box-sizing: border-box;
    animation: animloader 1s linear infinite alternate;
    color: var(--primary);
  }

  @keyframes animloader {
    0% {
      box-shadow:
        -38px -6px,
        -14px 6px,
        14px -6px;
    }
    33% {
      box-shadow:
        -38px 6px,
        -14px -6px,
        14px 6px;
    }
    66% {
      box-shadow:
        -38px -6px,
        -14px 6px,
        14px -6px;
    }
    100% {
      box-shadow:
        -38px 6px,
        -14px -6px,
        14px 6px;
    }
  }

  @media (min-width: 800px) {
    .controls {
      flex-direction: row;
    }
    input {
      max-width: 500px;
    }
  }
</style>
