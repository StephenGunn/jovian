<script lang="ts">
  import StarField from "$lib/layout/art/StarField.svelte";
  import MeteorShower from "$lib/homepage/MeteorShower.svelte";
  import { page } from "$app/stores";
  import { generate_starfield } from "$lib/layout/generate_starfield.svelte";

  const messages: { [key: number]: string } = {
    400: "Navigation Error. The request couldn't be processed by mission control. Please review your approach and try again.",
    401: "Unauthorized Access. This sector requires proper clearance. Please authenticate to proceed.",
    403: "Restricted Zone. Access to this area is limited. You lack the necessary permissions.",
    404: "Signal Lost. The resource you're seeking isn't available in this sector of the network.",
    500: "System Malfunction. An issue on the server disrupted your request. Our engineers are on it.",
    503: "Service in Standby. The server is temporarily offline. Try again once normal operations resume."
  };

  function get_error_message(status: number): string {
    return (
      messages[status] ||
      `${status} - Unknown Phenomenon. An unexpected error has occurred. Please contact support if the issue persists.`
    );
  }

  function is_known_error_code(status: number): boolean {
    return status in messages;
  }
</script>

<div class="container">
  <div class="content">
    {#key $page}
      {#if is_known_error_code($page.status)}
        <h1>{$page.status}</h1>
        <p>{get_error_message($page.status)}</p>
      {:else}
        <h1>{$page.status}</h1>
        <p>{$page.error?.message ?? "An error occured."}</p>
      {/if}
    {/key}
  </div>
  <MeteorShower />
  <StarField stars={generate_starfield()} />
</div>

<style>
  .container {
    position: absolute;
    width: 100%;
    height: 100%;
  }

  .content {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1;
    text-align: center;
    width: 100%;
    height: 100%;
    flex-direction: column;
  }

  p {
    color: var(--accent);
  }
</style>
