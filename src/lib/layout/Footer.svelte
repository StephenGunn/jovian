<script lang="ts">
</script>

<footer>
  <div class="copy">
    &copy; {new Date().getFullYear()} JovianMoon.io. All rights reserved.
  </div>
  <div class="foot_links">
    <a href="/privacy-policy">Privacy Policy</a> |
    <a href="/terms-and-conditions">Terms and Conditions</a>
  </div>
</footer>

<style>
  footer {
    color: white;
    text-align: center;
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    color: var(--muted-color);
    font-size: 0.9rem;
  }

  .copy {
    color: var(--secondary);
  }

  @media (max-width: 800px) {
    footer {
      flex-direction: column;
    }
  }
</style>
