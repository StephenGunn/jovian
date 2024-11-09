<script lang="ts">
  import { onMount } from "svelte";

  const check = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <rect width="256" height="256" fill="none"/>
    <polyline 
      points="40 144 96 200 224 72" 
      fill="none" 
      stroke="currentColor" 
      stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="16"
    />
  </svg>
`;

  const clipboard = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <rect width="256" height="256" fill="none"/>
    <polyline 
      points="168 168 216 168 216 40 88 40 88 88" 
      fill="none" 
      stroke="currentColor" 
      stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="16"
    />
    <rect 
      x="40" 
      y="88" 
      width="128" 
      height="128" 
      fill="none" 
      stroke="currentColor" 
      stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="16"
    />
  </svg>
`;

  onMount(() => {
    const copyBtnElement = document.querySelectorAll(".copy");

    function copyToClipboard(event: Event) {
      const buttonElement = event.currentTarget as HTMLButtonElement;
      const codeTitleElement = buttonElement.parentElement;
      const text = codeTitleElement?.nextElementSibling?.textContent;
      text && navigator.clipboard.writeText(text);

      buttonElement.innerHTML = check;

      setTimeout(async () => {
        buttonElement.innerHTML = clipboard;
        buttonElement.blur();
      }, 2000);
    }

    copyBtnElement.forEach((btn) => {
      btn.innerHTML = clipboard;
      btn.addEventListener("click", copyToClipboard);
    });

    return () =>
      copyBtnElement.forEach((btn) => btn.removeEventListener("click", copyToClipboard));
  });
</script>
