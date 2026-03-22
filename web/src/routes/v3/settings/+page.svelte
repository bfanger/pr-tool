<script lang="ts">
  import Header from "../../../components/Header/Header.svelte";
  import Button from "../../../components/Button/Button.svelte";
  import Settings from "../../../components/Settings/Settings.svelte";
</script>

<Header>
  <Button href="/app">Back</Button>
</Header>
<Settings />
<footer>
  <Button href="/v2/">Downgrade to version 2</Button>
</footer>

<style>
  footer {
    margin-top: 8rem;
    text-align: center;
  }
</style>
