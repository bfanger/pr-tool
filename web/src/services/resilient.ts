import sleep from "./sleep";

type Options = {
  signal: AbortSignal;
  retries: number;
  timeout: number;
  delay?: number;
  jitter?: number;
};

/**
 * Add retry behavior based on timeout to promise creating function
 */
export default async function resilient<T>(
  options: Options,
  fn: () => Promise<T>,
): Promise<T> {
  const { signal, retries, timeout, delay, jitter } = options;
  if (delay) {
    await sleep(applyJitter(delay, jitter), { signal });
  }

  const timeoutController = new AbortController();
  const timer = setTimeout(
    () => timeoutController.abort("timed out"),
    applyJitter(timeout, jitter),
  );
  function abortTrigger() {
    timeoutController.abort();
  }
  signal.addEventListener("abort", abortTrigger);

  try {
    return fn();
  } catch (err) {
    if (
      !navigator.onLine ||
      retries <= 1 ||
      signal.aborted ||
      !timeoutController.signal.aborted
    ) {
      throw err;
    }
    console.warn(err);

    return resilient(
      {
        ...options,
        retries: retries - 1,
        timeout: timeout * 1.5,
      },
      fn,
    );
  } finally {
    clearTimeout(timer);
    options.signal.removeEventListener("abort", abortTrigger);
  }
}

function applyJitter(value: number, jitter = 0.1) {
  const noise = value * jitter * Math.random();
  return value + noise;
}
