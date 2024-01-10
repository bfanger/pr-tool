<slot />

<style lang="scss">
  @import "../styling/helpers.scss";

  :root {
    background: var(--background);
    color: var(--text);

    /* .lightmode { */
    --background: #f6f6f6;
    --text: #222222;
    --muted: #ababab;
    --border: #e4e4e4;
    --inset: #ffffff;
    --fieldset: #eeeeee;
    --button-background: #ffffff;
    --button-text: #000000;
    --button-disabled-text: #acacac;
    --button-disabled-background: #f5f5f5;
    --button-active-text: #ffffff;
    --button-active-background: linear-gradient(
      180deg,
      #77a5f4 0%,
      #286df6 100%
    );
    --button-active-border: #5b93f3;
    --button-active-bottom-border: #2165f6;
    --link: #286df6;
    --link-hover: #84a6e6;
    --focus-ring: #84a6e6;
    --error-text: #333333;
    --error-background: #ff9292;
    --progressbar-bar: #e2e2e2;
    --progressbar-progress: #1887fa;

    @media (prefers-color-scheme: dark) {
      /* .darkmode { */
      --background: #333333;
      --text: #e1e1e1;
      --muted: #7d7d7d;
      --border: #515151;
      --inset: #212121;
      --fieldset: #393939;
      --button-background: #6b6b6b;
      --button-text: #ffffff;
      --button-disabled-text: #7d7d7d;
      --button-disabled-background: #525252;
      --button-active-text: #ffffff;
      --button-active-background: linear-gradient(
        180deg,
        #2e6bde 0%,
        #295fc6 100%
      );
      --button-active-border: #5682cf;
      --button-active-bottom-border: #2a5fc7;
      --link: #5c92ff;
      --link-hover: #84a6e6;
      --focus-ring: #437199;
      --error-text: #ffffff;
      --error-background: #a02525;
      --progressbar-bar: #48484a;
      --progressbar-progress: #4792f8;
    }
  }
</style>
