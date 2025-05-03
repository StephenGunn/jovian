<script lang="ts">
  let fileContent = $state("");
  let convertedChapters = $state("");
  let isDragging = $state(false);
  let errorMessage = $state("");
  let fileInput: HTMLInputElement | null = $state(null);
  let offsetSeconds = $state(0);

  // Regular expressions to extract timestamps and titles from different formats
  // Format 1: "elapsed time: 00:00:02    text: Last Week's Contributions"
  const elgatoRegex = /elapsed time: (\d{2}):(\d{2}):(\d{2})\s+text: (.+)/g;
  // Format 2: "00:00  Last Week's Contributions" (already formatted)
  const formattedRegex = /^(\d{2}):(\d{2})(?::(\d{2}))?\s+(.+)$/gm;

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    isDragging = true;
  };

  const handleDragLeave = () => {
    isDragging = false;
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    isDragging = false;
    errorMessage = "";

    if (!event.dataTransfer) return;

    const files = event.dataTransfer.files;
    if (files.length === 0) return;

    processFile(files[0]);
  };

  const handleFileSelect = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    processFile(input.files[0]);
  };

  const processFile = (file: File) => {
    errorMessage = "";

    // Check if the file is a text file
    if (!file.type.includes("text")) {
      errorMessage = "Please select a text file.";
      alert(errorMessage);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && typeof e.target.result === "string") {
        fileContent = e.target.result;
        processContent();
      }
    };
    reader.readAsText(file);
  };

  // Function to apply offset to timestamp
  const applyOffset = (
    hours: number,
    minutes: number,
    seconds: number,
    offsetSec: number
  ): { hours: number; minutes: number; seconds: number } => {
    // Convert everything to seconds
    let totalSeconds = hours * 3600 + minutes * 60 + seconds;

    // Apply the offset (can be positive or negative)
    totalSeconds += offsetSec;

    // Ensure we don't go below zero
    totalSeconds = Math.max(0, totalSeconds);

    // Convert back to hours, minutes, seconds
    const newHours = Math.floor(totalSeconds / 3600);
    const newMinutes = Math.floor((totalSeconds % 3600) / 60);
    const newSeconds = totalSeconds % 60;

    return { hours: newHours, minutes: newMinutes, seconds: newSeconds };
  };

  const processContent = () => {
    convertedChapters = "";
    const chapters: Array<{
      hours: number;
      minutes: number;
      seconds: number;
      title: string;
    }> = [];

    // Try to match using the Elgato format first
    elgatoRegex.lastIndex = 0;
    let match;
    let matchesFound = false;

    while ((match = elgatoRegex.exec(fileContent)) !== null) {
      matchesFound = true;
      const [_, hoursStr, minutesStr, secondsStr, title] = match;
      const hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);
      const seconds = parseInt(secondsStr, 10);

      chapters.push({ hours, minutes, seconds, title });
    }

    // If no matches were found with the Elgato format, try the already formatted style
    if (!matchesFound) {
      formattedRegex.lastIndex = 0;
      while ((match = formattedRegex.exec(fileContent)) !== null) {
        matchesFound = true;
        const [_, hoursOrMinutes, minutesOrSeconds, seconds, title] = match;

        // If seconds is undefined, then the first group is minutes (MM:SS format)
        // Otherwise, it's hours (HH:MM:SS format)
        if (seconds === undefined) {
          // MM:SS format (no hours)
          const minutes = parseInt(hoursOrMinutes, 10);
          const seconds = parseInt(minutesOrSeconds, 10);
          chapters.push({ hours: 0, minutes, seconds, title });
        } else {
          // HH:MM:SS format
          const hours = parseInt(hoursOrMinutes, 10);
          const minutes = parseInt(minutesOrSeconds, 10);
          const secs = parseInt(seconds, 10);
          chapters.push({ hours, minutes, seconds: secs, title });
        }
      }
    }

    if (!matchesFound || chapters.length === 0) {
      errorMessage = "No valid timestamps found in the file. Please check the format.";
      alert(errorMessage);
      return;
    }

    // Sort chapters by time
    chapters.sort((a, b) => {
      const aSeconds = a.hours * 3600 + a.minutes * 60 + a.seconds;
      const bSeconds = b.hours * 3600 + b.minutes * 60 + b.seconds;
      return aSeconds - bSeconds;
    });

    // Apply the offset to all chapters
    const offsetChapters = chapters.map((chapter) => {
      const adjusted = applyOffset(
        chapter.hours,
        chapter.minutes,
        chapter.seconds,
        offsetSeconds
      );
      return { ...chapter, ...adjusted };
    });

    // Check if the first timestamp is within 10 seconds
    const firstChapterTime =
      offsetChapters[0].hours * 3600 +
      offsetChapters[0].minutes * 60 +
      offsetChapters[0].seconds;

    // Format the chapters as YouTube timestamps
    let result = "";

    // If first timestamp is more than 10 seconds in, add a generic "Intro" at 00:00
    if (firstChapterTime > 10) {
      result += `00:00  Intro\n`;
    }

    offsetChapters.forEach((chapter, index) => {
      let timestamp = "";

      // If we added an "Intro" chapter, or if this is the first chapter and it's within 10 seconds
      if (
        (firstChapterTime > 10 && index === 0) ||
        (firstChapterTime <= 10 && index === 0)
      ) {
        // First timestamp should be 00:00 if no intro was added
        if (firstChapterTime <= 10) {
          timestamp = "00:00";
        } else {
          // Otherwise use the actual timestamp for the first real chapter
          if (chapter.hours > 0) {
            timestamp = `${chapter.hours.toString().padStart(2, "0")}:${chapter.minutes.toString().padStart(2, "0")}:${chapter.seconds.toString().padStart(2, "0")}`;
          } else {
            timestamp = `${chapter.minutes.toString().padStart(2, "0")}:${chapter.seconds.toString().padStart(2, "0")}`;
          }
        }
      } else {
        // For all other chapters, format normally
        if (chapter.hours > 0) {
          timestamp = `${chapter.hours.toString().padStart(2, "0")}:${chapter.minutes.toString().padStart(2, "0")}:${chapter.seconds.toString().padStart(2, "0")}`;
        } else {
          timestamp = `${chapter.minutes.toString().padStart(2, "0")}:${chapter.seconds.toString().padStart(2, "0")}`;
        }
      }

      result += `${timestamp}  ${chapter.title}\n`;
    });

    convertedChapters = result.trim();
  };

  let copied = $state(false);
  const copyToClipboard = async () => {
    if (!convertedChapters) return;
    copied = true;
    try {
      await navigator.clipboard.writeText(convertedChapters);
      errorMessage = "Copied to clipboard!";
      // Clear success message after 2 seconds
      setTimeout(() => {
        copied = false;
      }, 2000);
    } catch (error) {
      alert("Failed to copy to clipboard. Please try again.");
    }
  };
</script>

{#if !fileContent}
  <div
    class="dropzone column"
    class:dragging={isDragging}
    ondragover={handleDragOver}
    ondragleave={handleDragLeave}
    ondrop={handleDrop}
    onclick={() => fileInput?.click()}
    onkeydown={(e) => (e.key === "Enter" || e.key === " " ? fileInput?.click() : null)}
    role="button"
    tabindex="0"
    aria-label="Drop a text file here or click to browse"
  >
    <div class="button">
      Select File To Convert
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"
        ><rect width="256" height="256" fill="none" /><path
          d="M48,112V40a8,8,0,0,1,8-8h96l56,56v24"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="16"
        /><polyline
          points="152 32 152 88 208 88"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="16"
        /><line
          x1="108"
          y1="152"
          x2="148"
          y2="208"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="16"
        /><line
          x1="148"
          y1="152"
          x2="108"
          y2="208"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="16"
        /><line
          x1="84"
          y1="152"
          x2="44"
          y2="152"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="16"
        /><line
          x1="64"
          y1="152"
          x2="64"
          y2="208"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="16"
        /><line
          x1="212"
          y1="152"
          x2="172"
          y2="152"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="16"
        /><line
          x1="192"
          y1="152"
          x2="192"
          y2="208"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="16"
        /></svg
      >
    </div>
    <p>Drag &amp; Drop your timestamps log file or click to select from system</p>
    <p class="caveat">Only .txt files containing timestamps will be processed</p>

    <input
      type="file"
      accept=".txt,text/plain"
      style="display: none"
      onchange={handleFileSelect}
      bind:this={fileInput}
    />
  </div>
{/if}

{#if convertedChapters}
  <div class="result">
    <div class="offset-controls">
      <div class="offset-input">
        <button
          onclick={() => {
            offsetSeconds -= 5;
            processContent();
          }}>-5s</button
        >
        <button
          onclick={() => {
            offsetSeconds -= 1;
            processContent();
          }}
          aria-label="Decrease offset by 1 second">-1s</button
        >
        <input
          type="text"
          readonly
          value={`${offsetSeconds} seconds offset`}
          onchange={(e) => {
            offsetSeconds = parseInt((e.target as HTMLInputElement).value, 10) || 0;
            processContent();
          }}
          aria-label="Timestamp offset in seconds"
        />
        <button
          onclick={() => {
            offsetSeconds += 1;
            processContent();
          }}
          aria-label="Increase offset by 1 second">+1s</button
        >

        <button
          onclick={() => {
            offsetSeconds += 5;
            processContent();
          }}>+5s</button
        >
        <button
          class="reset"
          onclick={() => {
            offsetSeconds = 0;
            processContent();
          }}>Reset</button
        >
      </div>
    </div>
    <textarea rows="10" readonly>{convertedChapters}</textarea>
    <div class="button-group">
      <button onclick={copyToClipboard}>
        {#if copied}
          Copied!
        {:else}
          Copy to Clipboard
        {/if}
      </button>
      <button
        class="reset"
        onclick={() => {
          fileContent = "";
          convertedChapters = "";
          errorMessage = "";
          offsetSeconds = 0;
          if (fileInput) fileInput.value = "";
        }}>Change File</button
      >
    </div>
  </div>
{/if}

<style>
  .offset-controls,
  .button-group {
    display: flex;
    gap: 0.25rem;
    align-items: center;
    padding: 0.5rem 0;
  }

  button {
    display: inline-flex;
    align-items: center;
    text-decoration: none;
    border: none;
    color: var(--text);
    padding: 0.5rem 1rem;
    font-weight: 500;
    border-radius: 0.24rem;
    flex-grow: 0;
    align-items: center;
    gap: 1rem;
    font-weight: 600;
    margin: 0;
  }
  input {
    margin: 0;
    display: inline-flex;
    width: auto;
    align-items: center;
    text-decoration: none;
    border: none;
    color: var(--text);
    background-color: rgba(0, 0, 0, 0.1);
    padding: 0.5rem 1rem;
    font-weight: 500;
    border-radius: 0.25rem;
    flex-grow: 0;
    align-items: center;
    gap: 1rem;
    font-weight: 600;
    border: 2px solid var(--bg-accent-1);
  }

  input:focus {
    outline: none;
  }

  textarea {
    width: 100%;
    min-height: 500px;
    background: transparent;
    border: 2px solid var(--accent);
    padding: 1rem;
    color: var(--text);
    background-color: rgba(0, 0, 0, 0.1);
  }

  .dropzone {
    border: 2px dashed var(--primary);
    margin-top: 1.5rem;
    border-radius: 2rem;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    justify-content: center;
    align-items: center;
  }

  .dropzone.dragging {
    border-color: var(--secondary);
    background-color: rgba(0, 0, 0, 0.1);
  }

  .button {
    display: inline-flex;
    align-items: center;
    text-decoration: none;
    color: var(--text);
    background: var(--accent);
    padding: 0.5rem 1rem;
    font-weight: 500;
    border-radius: 0.24rem;
    flex-grow: 0;
    align-items: center;
    gap: 1rem;
    font-weight: 600;
    cursor: pointer;
  }

  .dropzone p {
    font-size: 0.8rem;
  }

  .button svg {
    width: 1.4rem;
    height: 1.4rem;
    fill: var(--text);
  }

  .caveat {
    font-size: var(--fs-sm);
    font-style: italic;
    color: var(--text-light);
  }

  /* Responsive styles for the dropzone */
  .dropzone {
    width: 100%;
    padding: 1.5rem 1rem;
  }

  /* Responsive styles for offset controls */
  .offset-controls {
    flex-direction: column;
    width: 100%;
  }

  .offset-input {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    width: 100%;
    justify-content: center;
  }

  /* Responsive button and input styles */
  button,
  input {
    font-size: 0.9rem;
    padding: 0.5rem 0.75rem;
  }

  /* Button group responsiveness */
  .button-group {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
  }

  /* Responsive textarea */
  textarea {
    min-height: 300px;
  }

  /* Media queries for different screen sizes */
  @media (max-width: 768px) {
    .dropzone {
      padding: 1.5rem 0.75rem;
    }

    .button {
      width: 100%;
      justify-content: center;
    }

    .dropzone p {
      text-align: center;
    }

    textarea {
      min-height: 250px;
    }
  }

  @media (max-width: 480px) {
    .offset-input {
      grid-template-columns: repeat(2, 1fr);
      display: grid;
    }

    .offset-input input {
      grid-column: span 2;
      text-align: center;
    }

    .offset-input button.reset {
      grid-column: span 2;
    }

    .button-group {
      flex-direction: column;
      width: 100%;
    }

    .button-group button {
      width: 100%;
    }

    .dropzone {
      border-radius: 1rem;
      padding: 1rem 0.5rem;
    }

    textarea {
      min-height: 200px;
      padding: 0.75rem;
    }
  }

  /* For very small screens */
  @media (max-width: 320px) {
    .button svg {
      display: none;
    }

    .dropzone p {
      font-size: 0.9rem;
    }

    .caveat {
      font-size: 0.8rem;
    }
  }
</style>
