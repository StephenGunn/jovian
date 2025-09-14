<script lang="ts">
  let spinning = $state(false);

  const toggleSpin = () => {
    spinning = true;
    setTimeout(() => {
      spinning = false;
    }, 60000); // 60 seconds - 3x slower
  };
</script>

<div class="demo">
  <div class="nib-container">
    <svg
      class:spinning
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      width="55px"
      height="40px"
      viewBox="0 0 52.75 38.083"
    >
      <path
        fill="#ED1C24"
        d="M8.593,30.807c-2.117-2.117-2.549-23.399,0-25.949s36.856,9.889,36.856,12.807S10.71,32.924,8.593,30.807z"
      />
    </svg>
  </div>
  <button onclick={toggleSpin}>Start Animation (60s - 3x slower)</button>
</div>

<style>
  .demo {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    padding: 2rem;
    border: 1px solid var(--bg-accent-3);
    border-radius: 1rem;
    background: var(--bg-accent-1);
  }

  .nib-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100px;
  }

  svg {
    width: 110px;
    height: 80px;
  }

  .spinning {
    animation-name: Clicker;
    animation-duration: 60s;
    animation-timing-function: ease-out;
    animation-fill-mode: both;
  }

  @keyframes Clicker {
    0%,
    92%,
    100% {
      transform: rotate(0deg);
    }

    1%,
    3%,
    5%,
    7%,
    9%,
    11%,
    13%,
    15%,
    17%,
    19%,
    21%,
    23%,
    25%,
    27%,
    29%,
    31%,
    33%,
    35%,
    37%,
    39%,
    41%,
    43%,
    45%,
    47%,
    49%,
    51%,
    53%,
    55%,
    57%,
    59%,
    61%,
    65%,
    69%,
    71%,
    75%,
    79%,
    86% {
      transform: rotate(-15deg);
    }

    2%,
    4%,
    6%,
    8%,
    10%,
    12%,
    14%,
    16%,
    18%,
    20%,
    22%,
    24%,
    26%,
    28%,
    30%,
    32%,
    34%,
    36%,
    38%,
    40%,
    42%,
    44%,
    46%,
    48%,
    50%,
    52%,
    54%,
    56%,
    58%,
    62%,
    64%,
    66%,
    72%,
    76%,
    80%,
    90% {
      transform: rotate(-10deg);
    }
    96% {
      transform: rotate(-4deg);
    }
    98% {
      transform: rotate(-2deg);
    }
  }

  button {
    padding: 0.75rem 1.5rem;
    border: 2px solid var(--primary);
    background: var(--primary);
    color: var(--bg);
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  button:hover {
    background: var(--secondary);
    border-color: var(--secondary);
  }
</style>
