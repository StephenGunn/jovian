<svelte:options css="injected" />

<script lang="ts">
  import Star from "./Star.svelte";

  let { title, link, section }: { title: string; link: string; section: string } =
    $props();

  // we want to serverside render the starfield
  // we will render more stars than we need to, on the server, so we don't have to wait for the
  // window dimensions to be available to generate the dom elements
  const large_star_count = 10;
  const tiny_star_count = 50;

  // random numbers
  const random = (min: number, max: number): number => {
    const randomValue = Math.random() * (max - min) + min;
    return Math.round(randomValue * 100) / 100; // Rounds to two decimal places
  };

  type StarData = {
    size: string;
    left: string;
    top: string;
    opacity?: number;
  };

  // generate an array of random positions for the stars that are between 3000 x 1500
  let stars: StarData[] = $state(
    Array.from({ length: large_star_count }).map(() => ({
      size: `${random(0.1, 1)}rem`,
      left: `${random(0, 1200)}px`,
      top: `${random(0, 600)}px`,
      opacity: 1 // big stars are always full brightness
    }))
  );

  // generate an array of random positions for the tiny stars that are between 3000 x 1500
  let tiny_stars: StarData[] = $state(
    Array.from({ length: tiny_star_count }).map(() => ({
      left: `${random(0, 1200)}px`,
      top: `${random(0, 600)}px`,
      size: `${random(0.1, 0.15)}rem`,
      opacity: random(0.5, 1)
    }))
  );

  const rendered_link = link ? "jovianmoon.io/" + link : "jovianmoon.io";
</script>

<div id="container">
  <div class="title">
    {title}
  </div>
  <div class="url">{rendered_link}</div>
  <div class="star-field">
    {#each stars as star}
      <Star size={star.size} left={star.left} top={star.top} />
    {/each}
    {#each tiny_stars as star}
      <Star size={star.size} left={star.left} top={star.top} />
    {/each}
  </div>
  <div class="jupiter">
    <svg
      version="1.1"
      viewBox="0 0 400 400"
      xml:space="preserve"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="202.23" cy="200.46" r="193.65" fill="#c9944f" />
      <g transform="rotate(-22.066 202.23 200.46)">
        <path
          d="m80.76 350.8a193.65 193.65 0 0 0 121.47 43.299 193.65 193.65 0 0 0 121.47-43.299z"
          fill="#e0c08d"
        />
        <path
          transform="scale(1 -1)"
          d="m160.32-314.7c-45.434 0.13789-80.257-2.3639-109.09-6.3555a193.65 193.65 0 0 1 34.477-33.453c74.437-1.9393 153.54-0.98777 234.69 1.2305a193.65 193.65 0 0 1 29.383 27.613c-78.905 7.5742-140.4 10.816-189.46 10.965z"
          fill="#ebba6d"
        />
        <path
          d="m39.305 305.12a193.65 193.65 0 0 0 16.291 21.77c86.452-3.6014 191.95 1.5872 290.02 3.3476a193.65 193.65 0 0 0 19.543-25.117z"
          fill="#ffe090"
        />
        <path
          d="m390.62 243.14-372.66 15.975a193.65 193.65 0 0 0 22.285 47.26c99.794 4.1788 184.77 14.889 322.08 2.5352a193.65 193.65 0 0 0 28.297-65.77z"
          fill="#c9944f"
        />
        <path
          d="m10.379 225.6a193.65 193.65 0 0 0 8.2344 35.281c172.09 9.0927 247.14-0.21732 367.58-0.91992a193.65 193.65 0 0 0 7.8906-34.361z"
          fill="#e0c08d"
        />
        <path
          d="m140.9 179.82c-43.06-0.01-86.875 4.6028-132.13 18.012a193.65 193.65 0 0 0-0.1875 2.627 193.65 193.65 0 0 0 3.7266 35.633c47.283-5.4352 116.34-1.6971 169.37-4.3926 76.809-3.9048 141.78 5.0794 210.13 5.9707a193.65 193.65 0 0 0 4.0703-37.211 193.65 193.65 0 0 0-2e-3 -0.11914c-85.743-2.2465-168.87-20.5-254.97-20.52z"
          fill="#ebba6d"
        />
        <path
          transform="scale(1 -1)"
          d="m14.021-156.95a193.65 193.65 0 0 1-5.3887-42.791c144.85 12.755 252.9-8.7007 387.23-0.91993a193.65 193.65 0 0 1 0.0137 0.20313 193.65 193.65 0 0 1-5.0078 43.508z"
          fill="#c9944f"
        />
        <path
          d="m383.95 133.65c-62.034 1.4386-280.2 8.8616-363.72 2.0527a193.65 193.65 0 0 0-7.5801 27.562c79.948-12.406 88.996 2.0529 135.43 2.0527 46.797 1.7e-4 159.35-5.1425 242.87-8.0371a193.65 193.65 0 0 0-6.9941-23.631z"
          fill="#ffe090"
        />
        <path
          d="m28.104 116.31a193.65 193.65 0 0 0-10.812 27.271c66.072-5.1248 177.6-4.5859 243.92 1.9766 56.137 5.5543 99.187-3.912 123.7-9.2461a193.65 193.65 0 0 0-8.3125-20.002z"
          fill="#e0c08d"
        />
        <path
          d="m38.643 97.01a193.65 193.65 0 0 0-13.547 25.645c129.16 12.141 234.28-6.669 351.38-6.6055a193.65 193.65 0 0 0-10.611-19.039z"
          fill="#c9944f"
        />
        <path
          d="m202.23 6.8086a193.65 193.65 0 0 0-165.66 93.99c119.84 10.345 178.86-8.4366 330.21-2.332a193.65 193.65 0 0 0-164.55-91.658z"
          fill="#e0c08d"
        />
      </g>
      <path
        d="m354.63 81.076a222.08 222.08 0 0 1 2.1797 30.768 222.08 222.08 0 0 1-222.08 222.08 222.08 222.08 0 0 1-87.582-18.326 193.65 193.65 0 0 0 155.09 78.504 193.65 193.65 0 0 0 193.65-193.65 193.65 193.65 0 0 0-41.248-119.38z"
        fill="#010100"
        opacity=".29127"
      />
      <path
        d="m66.273 208.58s23.535-4.1393 44.89-23.763c21.356-19.624 62.005-49.733 65.987-49.671 3.9816 0.0615 31.786-20.868 53.12-27.722 21.334-6.8537 55.034-30.214 44.477-44.342-10.557-14.129-20.937-30.352-63.661-34.981-42.724-4.6288-89.656 15.506-89.656 15.506s-47.599 22.416-66.395 61.735c-22.512 47.093-17.561 75.13-15.001 80.499 6.3984 13.417 11.792 21.912 26.238 22.74z"
        fill="#ffffff"
        opacity=".29127"
      />
      <path
        d="m126.17 56.965c26.652-4.4918 54.121-4.6797 80.759 0 8.0024 3.2939 17.135 10.104 15.849 19.835-1.5778 8.9753-9.9722 14.312-16.574 19.639-19.118 13.648-40.015 24.85-61.865 33.455-10.681 4.0288-22.113 5.3576-33.131 8.1911-9.9561 1.7747-20.592 4.8185-30.544 1.547-6.4892-2.4134-6.0728-10.227-5.9946-15.897 1.0278-14.579 5.6011-29.301 14.475-41.042 9.1337-10.059 21.288-16.693 32.892-23.48 1.3708-0.76258 2.7468-1.5161 4.1341-2.2485z"
        fill="#ffffff"
        opacity=".26319"
      />
    </svg>
  </div>
  <div class="io moon">
    <svg
      version="1.1"
      viewBox="0 0 400 400"
      xml:space="preserve"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m354.63 81.076a222.08 222.08 0 0 1 2.1797 30.768 222.08 222.08 0 0 1-222.08 222.08 222.08 222.08 0 0 1-87.582-18.326 193.65 193.65 0 0 0 155.09 78.504 193.65 193.65 0 0 0 193.65-193.65 193.65 193.65 0 0 0-41.248-119.38z"
        fill="#b89825"
        style="mix-blend-mode:multiply; opacity:.29127; paint-order:fill markers stroke; stroke-width:0"
      />
      <path
        d="m66.273 208.58s23.535-4.1393 44.89-23.763c21.356-19.624 62.005-49.733 65.987-49.671 3.9816 0.0615 31.786-20.868 53.12-27.722 21.334-6.8537 55.034-30.214 44.477-44.342-10.557-14.129-20.937-30.352-63.661-34.981-42.724-4.6288-89.656 15.506-89.656 15.506s-47.599 22.416-66.395 61.735c-22.512 47.093-17.561 75.13-15.001 80.499 6.3984 13.417 11.792 21.912 26.238 22.74z"
        fill="#f5da84"
        style="mix-blend-mode:lighten; opacity:.12; paint-order:fill markers stroke"
      />
    </svg>
  </div>
  <div class="subtitle">
    <div class="site">JovianMoon.io</div>
    <div class="type">{section}</div>
  </div>
</div>

<style>
  .moon {
    display: flex;
    position: absolute;
    border-radius: 50%;
  }

  .io {
    bottom: 50px;
    right: 60px;
    width: 70px;
    height: 70px;
    background-color: #ffe090;
  }

  .jupiter {
    display: flex;
    position: absolute;
    bottom: 130px;
    right: 50px;
    width: 400px;
    height: 400px;
  }

  .jupiter svg,
  .moon svg {
    width: 100%;
    height: 100%;
  }
  .title {
    display: flex;
    position: absolute;
    top: 150px;
    left: 70px;
    font-size: 62px;
    color: white;
    width: 660px;
  }
  .url {
    display: flex;
    position: absolute;
    top: 470px;
    left: 70px;
    font-size: 25px;
    color: #eb5967;
    letter-spacing: 1px;
  }
  .subtitle {
    display: flex;
    position: absolute;
    top: 80px;
    left: 70px;
    font-size: 35px;
    color: #f4845f;
    letter-spacing: 1px;
    gap: 4rem;
  }

  .site {
    color: #c2eabd;
  }

  #container {
    width: 1200px;
    height: 600px;
    display: flex;
    align-items: center;
    font-family: "Jost";
    justify-content: center;
    position: relative;
    background: rgb(26, 33, 56);
    background: linear-gradient(299deg, rgba(26, 33, 56, 1) 0%, rgba(37, 23, 73, 1) 100%);
  }

  .star-field {
    width: 100%;
    height: 100%;
    position: absolute;
    display: flex;
    overflow: hidden;
  }
</style>
