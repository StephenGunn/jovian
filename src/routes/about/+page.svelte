<script lang="ts">
  import "$lib/css/blog.css";
  import Seo from "sk-seo";
  import { dev } from "$app/environment";

  const open_graph_image = encodeURI(
    `${dev ? "http://localhost:42069" : "https://jovianmoon.io"}/api/images/pages?title=About Me&link=about`
  );
</script>

<Seo
  title="About Me - JovianMoon.io"
  description="Hi, I'm Stephen Gunn and I help make the internet."
  imageURL={open_graph_image}
/>
<div class="column">
  <h1>About Me</h1>
  <p>
    Hi, I'm Stephen Gunn, a Kansas City-based developer with over 20 years of experience
    in web development. My journey started with HTML4 and Netscape 3, and it’s been an
    exciting evolution ever since.
  </p>

  <p>
    I'm a bit of a nerd with a love for sci-fi and the occasional fantasy novel. You might
    notice hints of this throughout the site, reflected in the references and imagery.
  </p>

  <h2>Development Philosophy</h2>

  <p>
    I’m passionate about transforming chaos into order, finding patterns in complexity,
    and giving information a clear and effective voice. My focus is on building scalable,
    lasting projects that prioritize user experience.
  </p>

  <blockquote>
    "Plans are useless, but planning is everything." ― James S.A. Corey, Leviathan Wakes
  </blockquote>

  <h2>Expertise</h2>

  <p>
    I work with a variety of languages and frameworks, including foundational web-tech
    like HTML, CSS, and TypeScript. My expertise extends to Svelte and SvelteKit for
    front-end development, as well as a handful of backend runtimes and RDBMS
    technologies. I have experience deploying on many hosting platforms, ensuring that
    projects are scalable and reliable while not breaking the bank.
  </p>

  <p>
    On the creative side, I am proficient with tools such as Photoshop, Illustrator, After
    Effects, and Premiere. Additionally, I have a strong background in live streaming
    using OBS, and I’m skilled in audio recording and production.
  </p>

  <h2>Development Environment</h2>

  <p>
    My workflow is terminal-based, with Linux as my primary environment. I have all three
    major operating systems — Linux, Windows, and macOS — within reach and accessible on
    my desk. While I've been using Linux as my daily driver for years and currently run
    Arch (btw), I leverage each platform as needed.
  </p>

  <p>
    I’m a big fan of Neovim, which is central to my coding setup. I also rely on tools
    like <code>fzf</code>
    for quick navigation, <code>yazi</code> for efficient file management, and
    <code>lazygit</code> for streamlined git operations. This setup keeps my workflow fast
    & focused without having to leave the terminal.
  </p>

  <p>
    That said, I believe in using the right tool for the job. I utilize Windows for
    streaming setups and Apple for specific video creation tasks and screen captures. Each
    platform has its strengths, and I leverage them accordingly to get the best results
    for each project.
  </p>

  <h2>In Conclusion</h2>

  <p>
    I’m always open to chatting about projects, technology, or just exchanging ideas. If
    the right opportunity comes along, I might also be open to consulting or contract
    work, depending on the fit. Feel free to <a href="/contact">reach out</a> if you think
    we might collaborate well together.
  </p>

  <h2>References & Credits</h2>
  The information on the homepage comes from a variety of sources, including:

  <ul>
    <li>
      <a href="https://solarsystem.nasa.gov/planets/jupiter/overview/"
        >Jupiter Overview - NASA</a
      >
    </li>
    <li>
      <a href="https://solarsystem.nasa.gov/moons/jupiter-moons/io/overview/"
        >Io Overview - NASA</a
      >
    </li>
    <li>
      <a href="https://solarsystem.nasa.gov/moons/jupiter-moons/europa/overview/"
        >Europa Overview - NASA</a
      >
    </li>
    <li>
      <a href="https://solarsystem.nasa.gov/moons/jupiter-moons/ganymede/overview/"
        >Ganymede Overview - NASA</a
      >
    </li>
  </ul>

  <p>
    The website is built with <a
      href="https://kit.svelte.dev"
      target="_blank"
      rel="noopener noreferrer">SvelteKit</a
    >
    and the site is
    <a
      href="https://github.com/StephenGunn/jovian"
      target="_blank"
      rel="noopener noreferrer">open sourced</a
    >
    on GitHub.
  </p>
  <p>
    Also, big shoutout to <a
      href="https://joyofcode.xyz"
      target="_blank"
      rel="noopener noreferrer">Joy of Code</a
    > for open sourcing his site, I used it as a reference to get Markdown processing working
    in SvelteKit.
  </p>
</div>

<style>
  h2 {
    font-size: 1.5rem;
  }
  /* Layout and Spacing */
  .column > *:not(:last-child):not(h1):not(h2):not(h3):not(h4):not(h5):not(h6) {
    margin-bottom: 1.5rem;
    /* General spacing for all elements */
    padding-bottom: 1.5rem;
    /* Padding to ensure spacing consistency */
  }

  .column > h1:not(:last-child),
  .column > h2:not(:last-child) {
    margin-bottom: 1rem;
  }

  blockquote {
    padding: 1rem;
    border-left: 4px solid #eb5967;
    background: radial-gradient(circle, rgba(24, 23, 29, 1) 0%, rgba(22, 20, 28, 1) 100%);
    font-style: italic;
  }

  @media (max-width: 1000px) {
    h1 {
      font-size: 3rem;
    }
  }
</style>
