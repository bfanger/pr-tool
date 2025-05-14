<script lang="ts">
  type Props = {
    onclick: () => void;
  };
  let { onclick }: Props = $props();
</script>

<button {onclick} title="Archive" aria-label="Archive">
  <svg viewBox="0 0 22 22" fill="none">
    <rect
      width="15.5"
      height="3.5"
      x="3"
      y="3.5"
      stroke="currentColor"
      rx="1"
    />
    <path stroke="currentColor" d="M7.5 9.5H14" />
    <mask
      id="a"
      width="15"
      height="12"
      x="3"
      y="6"
      maskUnits="userSpaceOnUse"
      style="mask-type:alpha"
    >
      <path
        stroke="currentColor"
        d="M5.25 6.5h11a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z"
      />
    </mask>
    <g mask="url(#a)">
      <path fill="currentColor" d="M3 7h16v12H3z" />
    </g>
  </svg>
</button>

<style>
  button {
    display: inline-flex;
    place-content: center;

    margin-bottom: -0.3rem;
    margin-left: 0.4rem;
    padding: 0.2rem 0.4rem;
    border: none;
    border-radius: 0.3rem;

    color: light-dark(#666, #9f9f9f);

    background: none;

    &:hover {
      background-color: light-dark(#e5e4e5, #404040);
    }

    &:active {
      background-color: light-dark(#d8d7d8, #5d5c5c);
    }
  }

  svg {
    width: 1.6rem;
    height: 1.6rem;
  }
</style>
