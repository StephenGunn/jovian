<script lang="ts">
  const textToCopy = "This is the sample text and the random number is: ";
  const defaultButtonText = "Click to copy text & random number";

  // function to generate a random number between 1 and 1000
  function generateNumber() {
    return Math.floor(Math.random() * 1000) + 1;
  }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(textToCopy + generateNumber());
      text = "";
      buttonText = "Copied!";
      setTimeout(() => {
        buttonText = defaultButtonText;
      }, 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  }

  let text = $state("");
  let buttonText = $state(defaultButtonText);
</script>

<div class="interface">
  <button onclick={copyText}>{buttonText}</button>
  <textarea name="paste" id="paste" placeholder="Paste text here." bind:value={text}
  ></textarea>
</div>

<style>
  .interface {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    justify-content: center;
    align-items: center;
    margin: 0;
  }

  .interface > * {
    margin: 0;
  }
</style>
