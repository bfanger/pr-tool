<script lang="ts">
  import Header from "../../../components/Header/Header.svelte";
  import Button from "../../../components/Button/Button.svelte";
  import Settings from "../../../components/Settings/Settings.svelte";
</script>

<Header>
  <Button href="/v2/">Switch to version 2</Button>
  <Button href="/app">Back</Button>
</Header>
<Settings />
