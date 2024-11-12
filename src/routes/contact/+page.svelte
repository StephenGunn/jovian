<script lang="ts">
  import Seo from "sk-seo";
  import { enhance } from "$app/forms";
  import { dev } from "$app/environment";
  import "$lib/css/blog.css";

  let submitting = $state(false);
  let completed = $state(false);
  let error = $state("");

  const open_graph_image = encodeURI(
    `${dev ? "http://localhost:42069" : "https://jovianmoon.io"}/api/images/pages?title=Contact&link=contact`
  );
</script>

<Seo
  title="Contact - JovianMoon.io"
  description="Contact JovianMoon.io for projects, opportunities, or just to say hi."
  imageURL={open_graph_image}
/>

<article class="column">
  <h1>Contact</h1>
  <div class="post">
    <p>
      I'm always interested in hearing about new projects and opportunities. If you have a
      project you'd like to discuss, or just want to say hi, feel free to get in touch.
    </p>
    <p>
      You can reach me via <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://bsky.app/profile/jovianmoon.io">BlueSky</a
      >, via
      <a href="https://discord.gg/6EJ3V2E3vj" target="_blank" rel="noopener noreferrer"
        >my Discord server</a
      >, or through the contact form below.
    </p>

    {#if completed}
      <p>Thank you for your message. I'll get back to you as soon as possible.</p>
    {:else}
      {#if error !== ""}
        <p class="error">{error}</p>
      {/if}
      <form
        method="post"
        use:enhance={() => {
          submitting = true;
          error = "";
          return async ({ result }) => {
            submitting = false;
            if (result.type === "failure" && result.data) {
              error = result.data.text as string;
            } else if (result.type === "success") {
              completed = true;
            }
          };
        }}
      >
        <div class="split">
          <div>
            <label for="name">Name</label>
            <input type="text" id="name" name="name" required />
          </div>
          <div>
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required />
          </div>
        </div>

        <label for="subject">Subject</label>
        <input type="text" id="subject" name="subject" required />

        <label for="message">Message</label>
        <textarea
          id="message"
          name="message"
          rows="5"
          minlength="10"
          maxlength="750"
          required
        ></textarea>

        <input type="text" name="company" style="display: none" />

        <button type="submit">
          {#if submitting}Submitting...{:else}Submit{/if}
        </button>
      </form>
    {/if}
  </div>
</article>

<style>
  .split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  @media (max-width: 500px) {
    .split {
      grid-template-columns: 1fr;
    }
  }
</style>
