<script lang="ts">
  import placeholderSvg from "./placeholder.svg";

  type Props = {
    size: "small" | "medium" | "large";
    src?: string;
    title?: string;
  };
  let { size, src, title }: Props = $props();
</script>

<img src={src ?? placeholderSvg} {title} alt={title} data-size={size} />

<style>
  img {
    overflow: hidden;
    display: inline-block;
    border-radius: 50%;
  }

  [data-size="small"] {
    width: 19px;
    height: 19px;
  }

  [data-size="medium"] {
    width: 27px;
    height: 27px;
    border-radius: 6px;
    box-shadow: 1px 1px 2px rgb(0 0 0 / 10%);
  }

  [data-size="large"] {
    width: 38px;
    height: 38px;
  }
</style>
