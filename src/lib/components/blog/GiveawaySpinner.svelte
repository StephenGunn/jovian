<script lang="ts">
  import Confetti from "svelte-confetti";
  import { slide, fly, fade } from "svelte/transition";

  type Contributor = {
    name: string;
    email: string;
  };

  // Dummy data for demonstration
  const dummyNames: Contributor[] = [
    { name: "Alice Johnson", email: "alice@example.com" },
    { name: "Bob Smith", email: "bob@example.com" },
    { name: "Carol Williams", email: "carol@example.com" },
    { name: "David Brown", email: "david@example.com" },
    { name: "Emma Davis", email: "emma@example.com" },
    { name: "Frank Miller", email: "frank@example.com" },
    { name: "Grace Wilson", email: "grace@example.com" },
    { name: "Henry Moore", email: "henry@example.com" },
    { name: "Ivy Taylor", email: "ivy@example.com" },
    { name: "Jack Anderson", email: "jack@example.com" },
    { name: "Kate Thomas", email: "kate@example.com" },
    { name: "Liam Jackson", email: "liam@example.com" },
    { name: "Mia White", email: "mia@example.com" },
    { name: "Noah Harris", email: "noah@example.com" },
    { name: "Olivia Martin", email: "olivia@example.com" }
  ];

  let names = dummyNames;
  let spin = $state(false);
  let namesHeight = $state(0);
  let containerHeight = $state(0);
  let winnerID = $state(-1);
  let winners: number[] = $state([]);
  let alreadyWon: number[] = $state([]);
  let start_from = $state(0);
  let move_to = $state(0);
  let stack_length = $state(1);
  let show_confetti = $state(false);
  let wheel: Contributor[][] = $state([names, names]);
  let show_json = $state(false);
  let temp_already_won = $state(-1);
  let debug_info = $state({
    velocity: 0,
    move_to: 0,
    stack_length: 1
  });

  const NAME_HEIGHT = 58;
  $effect(() => {
    pickerOffset = containerHeight / 2;
  });
  let pickerOffset = $state(0);

  const randomNum = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1) + min);

  const set_winner = () => {
    show_confetti = true;
    spin = false;
    winnerID = Math.floor((move_to + pickerOffset) / NAME_HEIGHT);
    console.log("WinnerID: " + winnerID);
    let originalID = winnerID - names.length * (stack_length - 1);
    if (originalID >= names.length) {
      originalID -= names.length;
    }
    console.log("original ID: " + originalID);
    if (winners.indexOf(originalID) == -1) {
      winners.push(originalID);
      winners = winners;
    } else {
      alreadyWon.push(originalID);
      alreadyWon = alreadyWon;
      // Show striped background temporarily
      temp_already_won = originalID;
      setTimeout(() => {
        temp_already_won = -1;
      }, 2000);
    }
  };

  const save_winners = () => {
    show_json = !show_json;
  };

  const get_winners_json = () => {
    const winner_data = winners.map((index) => names[index]);
    return JSON.stringify(winner_data, null, 2);
  };

  const generateVelocity = () => {
    let minSpin = names.length * NAME_HEIGHT * 2;
    let maxSpin = names.length * NAME_HEIGHT * 3;
    let velocity = randomNum(minSpin, maxSpin);
    debug_info.velocity = velocity;
    console.log("velocity: " + velocity);
    return velocity + pickerOffset;
  };

  const spinMe = () => {
    show_confetti = false;
    start_from = -move_to;
    move_to += generateVelocity();

    console.log(move_to);

    const old_stacks = stack_length;
    stack_length = Math.floor((move_to + pickerOffset) / namesHeight);
    const new_stacks = stack_length - old_stacks;
    if (new_stacks === 1) wheel.push(names);
    else if (new_stacks === 2) wheel.push(names, names);
    else if (new_stacks === 3) wheel.push(names, names, names);
    wheel = wheel;
    spin = true;

    // Update debug info
    debug_info.move_to = move_to;
    debug_info.stack_length = stack_length;
  };

  const reset = () => {
    spin = false;
    start_from = 0;
    move_to = 0;
    stack_length = 1;
    show_confetti = false;
    wheel = [names, names];
    winnerID = -1;
    winners = [];
    alreadyWon = [];
    show_json = false;
    temp_already_won = -1;
    debug_info = {
      velocity: 0,
      move_to: 0,
      stack_length: 1
    };
  };
</script>

<div class="comp">
  <div class="columns">
    <div class="spinner-container" bind:clientHeight={containerHeight}>
      <!-- Pointer/Nib -->
      <div class="pointer">
        <svg
          class:spinning={spin}
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          width="55px"
          height="40px"
          viewBox="0 0 52.75 38.083"
        >
          <path
            fill="var(--accent)"
            d="M8.593,30.807c-2.117-2.117-2.549-23.399,0-25.949s36.856,9.889,36.856,12.807S10.71,32.924,8.593,30.807z"
          />
        </svg>
      </div>

      <!-- Names Column -->
      <div class="col">
        <div
          class="names"
          class:activateSpin={spin}
          class:staticPosition={!spin}
          style:--startFrom="{start_from}px"
          style:--moveTo="{-move_to}px"
          onanimationend={set_winner}
        >
          <div class="list" bind:clientHeight={namesHeight}>
            {#each names as name, nameIndex}
              <div
                class="name"
                class:winner={winners.indexOf(nameIndex) !== -1 &&
                  temp_already_won !== nameIndex}
                class:alreadyWon={alreadyWon.indexOf(nameIndex) !== -1 ||
                  temp_already_won === nameIndex}
              >
                {name.name}
              </div>
            {/each}
          </div>
          {#each wheel as nameList}
            <div class="list">
              {#each nameList as name, nameIndex}
                <div
                  class="name"
                  class:winner={winners.indexOf(nameIndex) !== -1 &&
                    temp_already_won !== nameIndex}
                  class:alreadyWon={alreadyWon.indexOf(nameIndex) !== -1 ||
                    temp_already_won === nameIndex}
                >
                  {name.name}
                </div>
              {/each}
            </div>
          {/each}
        </div>
      </div>

      <!-- Confetti -->
      {#if show_confetti}
        <div class="confetti" in:fade={{ duration: 200 }}>
          <Confetti />
        </div>
      {/if}
    </div>

    <div class="debug-info">
      <div class="debug-item">
        <span class="debug-label">Velocity:</span>
        <span class="debug-value">{debug_info.velocity}px</span>
      </div>
      <div class="debug-item">
        <span class="debug-label">Move To:</span>
        <span class="debug-value">{debug_info.move_to}px</span>
      </div>
      <div class="debug-item">
        <span class="debug-label">Stack Length:</span>
        <span class="debug-value">{debug_info.stack_length}</span>
      </div>
    </div>
  </div>

  <!-- Controls -->
  <div class="controls">
    <button onclick={spinMe} disabled={spin}>
      {spin ? "Spinning..." : "Spin the Wheel"}
    </button>
    <button onclick={reset}>Reset</button>
    {#if winners.length > 0}
      <button onclick={save_winners} in:fly={{ x: -20, duration: 300 }}>
        {show_json ? "Hide JSON" : "Save Winners"}
      </button>
    {/if}
  </div>

  {#if winners.length > 0}
    <div class="winner-display" transition:slide={{ duration: 300 }}>
      <strong>Winners:</strong>
      {#each winners as winnerIndex, i}
        <div class="winner-name" in:fly={{ y: 20, duration: 300, delay: i * 100 }}>
          {names[winnerIndex].name}
        </div>
      {/each}
    </div>
  {/if}

  {#if show_json}
    <div class="json-console" transition:slide={{ duration: 300 }}>
      <pre><code>{get_winners_json()}</code></pre>
    </div>
  {/if}

  <!-- Debug Info -->
</div>

<style>
  .comp {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 0;
  }

  .columns {
    display: flex;
    gap: 1rem;
    flex-shrink: 0;
    width: 100%;
    align-items: flex-start;
  }

  .spinner-container {
    position: relative;
    flex: 1;
    min-width: 0;
    height: 400px;
    overflow: visible;
  }

  .col {
    border: 1px solid var(--bg-accent-3);
    border-radius: 0.25rem;
    width: 100%;
    height: 400px;
    overflow: hidden;
    background: var(--bg);
  }

  .pointer {
    position: absolute;
    top: 50%;
    left: -2rem;
    transform: translateY(-50%);
    z-index: 5;
  }

  .pointer svg.spinning {
    animation-name: Clicker;
    animation-duration: 5s;
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

  .names {
    will-change: transform;
  }

  .activateSpin {
    animation: spin 5s cubic-bezier(0.215, 0.61, 0.355, 1);
  }

  .staticPosition {
    transform: translateY(var(--moveTo));
  }

  @keyframes spin {
    0% {
      transform: translateY(var(--startFrom));
    }
    100% {
      transform: translateY(var(--moveTo));
    }
  }

  .list {
    width: 100%;
  }

  .name {
    border-bottom: 2px solid var(--bg-accent-2);
    padding-left: 2rem;
    width: 100%;
    font-weight: 600;
    font-size: 1.2rem;
    color: var(--text);
    box-sizing: border-box;
    height: 58px;
    max-height: 58px;
    display: flex;
    align-items: center;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    background: var(--bg);
  }

  .name.winner {
    background: linear-gradient(30deg, var(--primary) 0%, var(--secondary) 100%);
    color: var(--bg);
    border-bottom: 2px solid var(--accent);
    font-weight: 700;
  }

  .name.alreadyWon {
    color: var(--text-light);
    background-image: linear-gradient(
      45deg,
      var(--bg-accent-1) 25%,
      var(--bg-accent-2) 25%,
      var(--bg-accent-2) 50%,
      var(--bg-accent-1) 50%,
      var(--bg-accent-1) 75%,
      var(--bg-accent-2) 75%,
      var(--bg-accent-2) 100%
    );
    background-size: 11.31px 11.31px;
  }

  .confetti {
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 58px;
    pointer-events: none;
    z-index: 20;
  }

  @keyframes confetti-fall {
    0% {
      opacity: 1;
      transform: translateY(0) rotate(0deg);
    }
    100% {
      opacity: 0;
      transform: translateY(200px) rotate(720deg);
    }
  }

  .controls {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-wrap: wrap;
    justify-content: center;
  }

  .controls button {
    padding: 0.5rem 1rem;
    border: 1px solid var(--primary);
    background: var(--primary);
    color: var(--bg);
    border-radius: 0.25rem;
    font-weight: 500;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .controls button:hover:not(:disabled) {
    background: var(--secondary);
    border-color: var(--secondary);
    transform: translateY(-1px);
  }

  .controls button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .winner-display {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
    border-radius: 0.25rem;
    border: 1px solid var(--bg-accent-2);
    width: 100%;
    max-width: 500px;
  }

  .winner-display strong {
    color: var(--primary);
    margin-bottom: 0.25rem;
  }

  .winner-name {
    padding: 0.5rem;
    border-radius: 0.25rem;
    border-left: 2px solid var(--primary);
    border-top: 1px solid var(--bg-accent-1);
    border-right: 1px solid var(--bg-accent-1);
    border-bottom: 1px solid var(--bg-accent-1);
    transition: all 0.2s ease;
  }

  .winner-name:hover {
    border-left-width: 3px;
    padding-left: calc(0.5rem - 1px);
    background: var(--bg-accent-1);
  }

  .json-console {
    width: 100%;
    max-width: 500px;
    border-radius: 0.25rem;
    border: 1px solid var(--bg-accent-2);
    overflow: hidden;
  }

  .json-console pre {
    margin: 0;
    padding: 1rem;
    overflow-x: auto;
  }

  .json-console code {
    font-family: "Courier New", Courier, monospace;
    font-size: 0.85rem;
    color: var(--text);
    line-height: 1.5;
  }

  .debug-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
    max-width: 200px;
    padding: 0.75rem;
    border-radius: 0.25rem;
    border: 1px solid var(--bg-accent-2);
  }

  .debug-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--bg-accent-1);
    font-size: 0.85rem;
  }

  .debug-item:last-child {
    border-bottom: none;
  }

  .debug-label {
    color: var(--text-light);
    font-weight: 500;
  }

  .debug-value {
    color: var(--secondary);
    font-family: "Courier New", Courier, monospace;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .debug-item:has(.debug-value:focus-visible) .debug-value,
  .debug-value:hover {
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    .columns {
      flex-direction: column;
      align-items: center;
    }

    .spinner-container {
      width: 100%;
      max-width: 500px;
    }

    .col {
      max-width: 500px;
    }

    .debug-info {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      max-width: 500px;
      gap: 0.5rem;
    }

    .debug-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
      padding: 0.5rem;
      border-bottom: none;
      border: 1px solid var(--bg-accent-1);
      border-radius: 0.25rem;
    }
  }

  @media (max-width: 600px) {
    .spinner-container {
      height: 300px;
    }

    .col {
      height: 300px;
    }

    .pointer {
      left: -1.5rem;
    }

    .pointer svg {
      width: 40px;
      height: 30px;
    }

    .name {
      font-size: 1rem;
      padding-left: 1rem;
      height: 50px;
      max-height: 50px;
    }

    .controls {
      flex-direction: column;
      width: 100%;
    }

    .controls button {
      width: 100%;
    }

    .winner-display {
      width: 100%;
    }

    .json-console {
      width: 100%;
    }

    .debug-info {
      width: 100%;
    }
  }
</style>
