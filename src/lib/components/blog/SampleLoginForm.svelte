<script lang="ts">
  import Confetti from "svelte-confetti";
  import Check from "phosphor-svelte/lib/Check";
  import X from "phosphor-svelte/lib/X";

  let email_valid = $state(false);
  let password_valid = $state(false);
  let confetti = $state(false);
  let disabled = $derived(!email_valid || !password_valid);
</script>

<div class="comp">
  <form
    onsubmit={(e) => {
      e.preventDefault();
      if (disabled) return;
      confetti = true;
      setTimeout(() => {
        confetti = false;
      }, 2000);
    }}
  >
    <label for="email" class:valid={email_valid}>Email</label>
    <div class="relative">
      <input
        type="email"
        name="email"
        id="email"
        placeholder="Add an email address"
        required
        aria-required="true"
        oninput={(e: Event) => {
          const target = e.target as HTMLInputElement;
          email_valid = target?.validity?.valid || false;
        }}
      />
      <div class="icon">
        {#if email_valid}
          <Check size="1.5rem" color="var(--secondary)" />
          <div class="confetti">
            <Confetti />
          </div>
        {:else}
          <X size="1.5rem" color="var(--accent)" />
        {/if}
      </div>
    </div>

    <label for="password" class:valid={password_valid}>Password</label>
    <div class="relative">
      <input
        type="password"
        name="password"
        id="password"
        minlength="8"
        placeholder="Add a password (min 8 characters)"
        required
        aria-required="true"
        oninput={(e: Event) => {
          const target = e.target as HTMLInputElement;
          password_valid = target?.validity?.valid || false;
        }}
      />
      <div class="icon">
        {#if password_valid}
          <Check size="1.5rem" color="var(--secondary)" />
          <div class="confetti">
            <Confetti />
          </div>
        {:else}
          <X size="1.5rem" color="var(--accent)" />
        {/if}
      </div>
    </div>
    <button disabled={confetti}>
      Login
      {#if confetti}
        <div class="confetti">
          <Confetti />
        </div>
      {/if}
    </button>
  </form>
</div>

<style>
  .relative {
    position: relative;
  }

  .icon {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
  }
  .comp {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    gap: 1.5rem;
    border-radius: 1rem;
    border: 1px solid var(--bg-accent-1);
  }
  form {
    display: flex;
    flex-flow: column;
    max-width: 400px;
  }
  label:not(:first-child) {
    margin-top: 1rem;
  }
  label {
    color: var(--accent);
  }
  label.valid {
    color: var(--secondary);
  }
  input {
    margin: 0;
    padding: 0.5rem 1rem;
  }

  button {
    margin-top: 1rem;
    position: relative;
  }

  button .confetti {
    position: absolute;
    top: 0;
    left: 0;
    width: 1px;
    height: 100%;
    left: 50%;
  }

  button:disabled {
    background-color: var(--bg-accent-3);
    color: var(--bg);
    cursor: not-allowed;
  }
</style>
