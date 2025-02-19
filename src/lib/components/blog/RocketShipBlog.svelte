<script lang="ts">
  import { generate_starfield } from "$lib/layout/generate_starfield.svelte";
  import StarField from "$lib/layout/art/StarField.svelte";
  import Rocket from "$lib/homepage/Rocket.svelte";
  import Confetti from "svelte-confetti";
</script>

<div class="comp">
  <div class="starfield">
    <div class="rocket">
      <Rocket launched ignition orbit_mode={false} decent_mode={false} orbit_size={100} />
      <div class="sparks">
        <Confetti
          infinite
          cone
          noGravity
          size={6}
          colorArray={["#ff6c34", "#ffdb2b"]}
          fallDistance="20px"
          xSpread={0.1}
          x={[0.4, -0.4]}
          y={[0.4, 0.4]}
        />
      </div>
    </div>

    <StarField stars={generate_starfield()} />
  </div>
</div>

<style>
  .comp {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    gap: 1.5rem;
    position: relative;
  }

  .rocket {
    position: absolute;
    width: 50%;
    height: 50%;
    left: 25%;
    top: 25%;
    z-index: 100;
  }

  .sparks {
    position: absolute;
    width: 1px;
    height: 1px;
    top: 50%;
    left: 30%;
    transform: rotate(-90deg);
  }

  .starfield {
    width: 100%;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    position: relative;
    border-radius: 1rem;
    border: 1px solid var(--bg-accent-3);
  }

  @media (max-width: 800px) {
    .starfield {
      aspect-ratio: 1 / 1;
    }
  }
</style>
