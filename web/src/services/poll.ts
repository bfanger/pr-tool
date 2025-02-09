type Options = {
  gap: number; // in seconds
  signal: AbortSignal;
};
export default function poll(
  fn: () => Promise<void>,
  { gap, signal }: Options,
) {
  if (signal.aborted) {
    return;
  }
  let timer: ReturnType<typeof setTimeout>;
  let penalty = 0;
  function run() {
    fn()
      .then(() => {
        penalty = 0;
      })
      .catch((err) => {
        console.warn(err);
        penalty += 120;
      })
      .finally(() => {
        if (!signal.aborted) {
          timer = setTimeout(run, (gap + penalty) * 1000);
        }
      });
  }

  timer = setTimeout(run, gap * 1000);

  function handleAbort() {
    clearTimeout(timer);
    signal.removeEventListener("abort", handleAbort);
  }
  signal.addEventListener("abort", handleAbort);
}
