<script lang="ts">
  let email_valid = $state(false);
  let password_valid = $state(false);
  let disabled = $derived(!email_valid || !password_valid);
</script>

<form>
  <label for="email">Email</label>
  <input
    type="email"
    name="email"
    id="email"
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
    required
    aria-required="true"
    oninput={(e: Event) => {
      const target = e.target as HTMLInputElement;
      password_valid = target?.validity?.valid || false;
    }}
  />
  <button {disabled}> Login </button>
</form>

<style>
  form {
    display: flex;
    flex-flow: column;
    max-width: 400px;
  }
  input {
    margin-bottom: 1rem;
  }
</style>
