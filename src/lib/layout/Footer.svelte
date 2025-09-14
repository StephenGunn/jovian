<script lang="ts">
</script>

<footer class="column">
  <div class="foot_copy">
    &copy; {new Date().getFullYear()} JovianMoon.io. All rights reserved.
  </div>
  <div class="foot_links">
    <a href="/privacy-policy">Privacy Policy</a> |
    <a href="/terms-and-conditions">Terms and Conditions</a> |
    <a
      target="_blank"
      referrerpolicy="no-referrer"
      href="https://github.com/StephenGunn/jovian">Source</a
    >
  </div>
</footer>

<style>
  footer {
    position: relative;
    z-index: 2;
    color: white;
    text-align: center;
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    color: var(--muted-color);
    font-size: 0.9rem;
    bottom: 0;
  }

  .foot_copy {
    color: var(--secondary);
  }

  @media (max-width: 800px) {
    footer {
      flex-direction: column;
    }
  }
</style>
