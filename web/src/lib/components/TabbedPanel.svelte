<script lang="ts" context="module">
  export type Tab = {
    key: string;
    label: string;
  };
</script>

<script lang="ts">
  export let active: string;
  export let tabs: Tab[];
</script>

<div class="tabbed-panel">
  <div class="body">
    <slot />
  </div>
  <div class="tabs">
    {#each tabs as tab (tab.key)}
      <button
        class="tab"
        class:is-active={tab.key === active}
        on:click={() => {
          active = tab.key;
        }}
      >
        {tab.label}
      </button>
    {/each}
  </div>
</div>

<style>
  .tabbed-panel {
    height: calc(100vh);
    display: flex;
    flex-direction: column;
    position: relative;
  }
  .tabs {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    position: absolute;
    width: 100%;
    top: 2rem;
  }
  .tab {
    border: var(--hairline) solid var(--border);
    position: relative;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
    font: 1.3rem var(--font);
    background: var(--button-background);
    color: var(--button-text);
    border-radius: 0.4rem;
    padding: 0.2rem 1rem;
  }
  .tab + .tab:not(:last-child) {
    border-left: 0;
    border-right: 0;
    border-radius: 0;
  }
  .tab:first-child {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
  .tab:last-child {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  .tab.is-active {
    color: var(--button-active-text);
    background: var(--button-active-background);
    border-color: var(--button-active-border);
    border-bottom-color: var(--button-active-bottom-border);
    outline: none;
  }
  .tab.is-active:not(:first-child) {
    border-left: 0;
  }
  .tab.is-active:not(:last-child) {
    border-right: 0;
  }
  .body {
    margin: 3rem 1rem 1rem 1rem;
    padding: 1rem;
    flex: 1;
    overflow: auto;
    border: 0.5px solid var(--border);
    background: var(--fieldset);
    border-radius: 0.8rem;
    overflow: auto;
  }
</style>
