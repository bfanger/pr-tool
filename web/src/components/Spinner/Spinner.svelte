<script lang="ts">
  import azurePng from "./azure-devops.png";
  import bitbucketPng from "./bitbucket.png";
  import gitlabPng from "./gitlab.png";
  import gilhubSvg from "./github.svg";
</script>

<div class="spinner">
  <img class="dot" src={azurePng} alt="." />
  <img class="dot" src={gitlabPng} alt="." />
  <img class="dot" src={bitbucketPng} alt="." />
  <img class="dot" src={gilhubSvg} alt="." />
</div>

<style>
  .spinner {
    position: absolute;
    top: 50%;
    left: 50%;
  }

  .dot {
    --offset: 2rem;

    position: absolute;

    width: 2rem;
    height: 2rem;

    object-fit: contain;

    animation: spin infinite 1.8s cubic-bezier(0.23, -0.17, 0.67, 1.27);

    &:nth-child(1) {
      animation-delay: -0.45s;
    }

    &:nth-child(2) {
      animation-delay: -0.9s;
    }

    &:nth-child(3) {
      animation-delay: -1.35s;
    }
  }

  @keyframes spin {
    0% {
      transform: translate(calc(var(--offset) * -1), calc(var(--offset) * -1));
    }

    25% {
      transform: translate(var(--offset), calc(var(--offset) * -1));
    }

    50% {
      transform: translate(var(--offset), var(--offset));
    }

    75% {
      transform: translate(calc(var(--offset) * -1), var(--offset));
    }

    100% {
      transform: translate(calc(var(--offset) * -1), calc(var(--offset) * -1));
    }
  }
</style>
