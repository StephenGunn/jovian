<script lang="ts">
  import Confetti from "svelte-confetti";

  let email_valid = $state(false);
  let password_valid = $state(false);
  let disabled = $derived(!email_valid || !password_valid);
</script>

<div class="comp">
  <form
    onsubmit={(e) => {
      e.preventDefault();
    }}
  >
    <label for="email">Email</label>
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

    <label for="password">Password</label>
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
    <button {disabled}>
      Login
      {#if !disabled}
        <div class="confetti">
          <Confetti />
        </div>
      {/if}
    </button>
  </form>
</div>

<style>
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
  input {
    margin-bottom: 1rem;
  }

  button {
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
