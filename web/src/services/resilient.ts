import sleep from "./sleep";

type Options = {
  task: string;
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
  fn: (timeoutSignal: AbortSignal) => Promise<T>,
): Promise<T> {
  const { signal, retries, timeout, delay = 0, jitter = 0.1 } = options;
  if (delay) {
    await sleep(applyJitter(delay, jitter), { signal });
  }
  const timeoutController = new AbortController();
  const timer = setTimeout(
    () => {
      timeoutController.abort(
        new DOMException(`Timed out after ~${timeout}ms`, "AbortError"),
      );
    },
    applyJitter(timeout, jitter),
  );
  function abortTrigger() {
    timeoutController.abort(signal.reason);
  }
  signal.addEventListener("abort", abortTrigger);

  try {
    return await fn(timeoutController.signal);
  } catch (err) {
    if (
      !navigator.onLine ||
      retries <= 1 ||
      signal.aborted ||
      !timeoutController.signal.aborted
    ) {
      throw new Error(`Task "${options.task}" failed`, { cause: err });
    }
    console.warn(
      new Error(`Task "${options.task}" failed, retrying...`, { cause: err }),
    );

    return resilient(
      {
        ...options,
        delay: delay + 500,
        retries: retries - 1,
        timeout: timeout * 1.5,
        jitter: jitter * 1.5,
      },
      fn,
    );
  } finally {
    clearTimeout(timer);
    options.signal.removeEventListener("abort", abortTrigger);
  }
}

function applyJitter(value: number, jitter: number) {
  const noise = value * jitter * Math.random();
  return value + noise;
}
