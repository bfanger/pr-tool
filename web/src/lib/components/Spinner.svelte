<script lang="ts">
  import azurePng from "../../assets/img/azure-devops.png";
  import gitlabPng from "../../assets/img/gitlab.png";
  import bitbucketPng from "../../assets/img/bitbucket.png";
</script>

<div class="spinner">
  <img class="dot" src={azurePng} alt="." />
  <img class="dot" src={gitlabPng} alt="." />
  <img class="dot" src={bitbucketPng} alt="." />
</div>

<style lang="scss">
  .spinner {
    position: absolute;
    top: 50%;
    left: 50%;
  }
  .dot {
    position: absolute;
    width: 2rem;
    height: 2rem;
    object-fit: contain;
    animation: spin infinite 1.8s cubic-bezier(0.46, 0.01, 0.76, 0.63);

    &:nth-child(1) {
      animation-delay: -0.6s;
    }
    &:nth-child(2) {
      animation-delay: -1.2s;
    }
  }
  $offset: 2rem;
  @keyframes spin {
    0% {
      transform: translate(-$offset, -$offset);
    }
    25% {
      transform: translate($offset, -$offset);
    }
    50% {
      transform: translate($offset, $offset);
    }
    75% {
      transform: translate(-$offset, $offset);
    }
    100% {
      transform: translate(-$offset, -$offset);
    }
  }
</style>
