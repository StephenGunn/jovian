<script lang="ts">
  let email_valid = $state(false);
</script>

<div class="comp">
  <form
    onsubmit={(e) => {
      e.preventDefault();
    }}
  >
    Input state is: {email_valid ? "valid" : "invalid"}
    <input
      type="email"
      required
      aria-required="true"
      placeholder="Add an email address"
      oninput={(e: Event) => {
        const target = e.target as HTMLInputElement;
        email_valid = target?.validity?.valid || false;
      }}
    />
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
  input:invalid {
    border: 3px solid red;
  }
</style>
