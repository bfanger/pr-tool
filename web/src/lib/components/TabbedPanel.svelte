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
    position: relative;
    display: flex;
    flex-direction: column;
    height: calc(100vh);
  }

  .tabs {
    position: absolute;
    top: 2rem;

    display: flex;
    align-items: flex-start;
    justify-content: center;

    width: 100%;
  }

  .tab {
    cursor: pointer;

    position: relative;

    display: inline-block;

    padding: 0.2rem 1rem;
    border: var(--hairline) solid var(--border);
    border-radius: 0.4rem;

    font: 1.3rem var(--font);
    color: var(--button-text);
    text-decoration: none;

    background: var(--button-background);
  }

  .tab:first-child {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  .tab:last-child {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  .tab + .tab:not(:last-child) {
    border-right: 0;
    border-left: 0;
    border-radius: 0;
  }

  .tab.is-active {
    border-color: var(--button-active-border);
    border-bottom-color: var(--button-active-bottom-border);

    color: var(--button-active-text);

    background: var(--button-active-background);
    outline: none;
  }

  .tab.is-active:not(:first-child) {
    border-left: 0;
  }

  .tab.is-active:not(:last-child) {
    border-right: 0;
  }

  .body {
    overflow: auto;
    flex: 1;

    margin: 3rem 1rem 1rem;
    padding: 1rem;
    border: 0.5px solid var(--border);
    border-radius: 0.8rem;

    background: var(--fieldset);
  }
</style>
