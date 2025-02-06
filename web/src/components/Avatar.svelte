<script lang="ts">
  type Props = {
    size: "medium" | "large";
    src: string;
    title?: string;
  };
  let { size, src, title }: Props = $props();
</script>

<img {src} {title} alt={title} data-size={size} />

<style>
  img {
    overflow: hidden;
    display: inline-block;
    border-radius: 50%;
  }

  [data-size="medium"] {
    width: 2.4rem;
    height: 2.4rem;
  }

  [data-size="large"] {
    width: 40px;
    height: 40px;
  }
</style>
