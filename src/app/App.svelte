<script lang="ts">
  import { update } from "../lib/server";

  const updateGreetingCard = () => {
    update<"greeting-card">("gc", { name: "John" });
  };
</script>

<main>
  <h1>Vite + Svelte</h1>

  <div class="card">
    <button on:click={updateGreetingCard}> Update greeting card </button>
  </div>
</main>

<style>
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }
  .read-the-docs {
    color: #888;
  }
</style>
