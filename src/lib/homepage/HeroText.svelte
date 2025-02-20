<div class="text">
  <h1>Jovian Moon</h1>
  <div class="tagline">Digital playground of Stephen Gunn</div>
</div>

<style>
  .text {
    position: absolute;
    top: 20%;
    left: 12%;
    z-index: 7;
  }

  h1 {
    font-size: clamp(3.125rem, 11.547vw + 0.137rem, 9.375rem);
    line-height: 1.2;
    color: white;
  }

  .tagline {
    font-family: "Jost", sans-serif;
    font-weight: 300;
    font-size: clamp(1.25rem, 3.125vw + 0.137rem, 2rem);
    position: relative;
    top: -0.5rem;
    left: 10%;
    color: white;
  }
  @media (max-width: 1500px) {
    .text {
      top: 15%;
      left: 10%;
      width: 80%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .tagline {
      position: relative;
      top: initial;
      left: initial;
    }
  }
  @media (max-width: 768px) {
    .text {
      top: 10%;
      gap: 1rem;
    }
  }
</style>
