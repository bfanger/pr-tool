type StableOptions = {
  signal: AbortSignal;
  retries: number;
  timeout: number;
  delay?: number;
  jitter?: number;
  fetch?: typeof fetch;
};
/**
 * Similar api to fetch, but with retry on timeout behavior
 */
export default async function stableFetch(
  url: string,
  request: RequestInit,
  options: StableOptions,
): Promise<any> {
  const { signal, ...init } = request;
  let { timeout, retries, jitter, fetch } = options;
  if (!fetch) {
    fetch = globalThis.fetch;
  }
  if (options.delay) {
    await sleep(applyJitter(options.delay, jitter), options.signal);
  }

  const timeoutController = new AbortController();
  const timer = setTimeout(
    () => timeoutController.abort("timed out"),
    applyJitter(timeout, jitter),
  );
  function abortTrigger() {
    timeoutController.abort();
  }
  options.signal.addEventListener("abort", abortTrigger);
  if (request.signal) {
    request.signal.addEventListener("abort", abortTrigger);
  }
  try {
    return await fetch(url, {
      ...init,
      signal: timeoutController.signal,
    });
  } catch (err) {
    if (
      !navigator.onLine ||
      retries <= 1 ||
      options.signal.aborted ||
      !timeoutController.signal.aborted
    ) {
      throw err;
    }
    console.warn(err);

    return stableFetch(url, request, {
      ...options,
      retries: retries - 1,
      timeout: timeout * 1.5,
    });
  } finally {
    clearTimeout(timer);
    options.signal.removeEventListener("abort", abortTrigger);
    if (request.signal) {
      request.signal.removeEventListener("abort", abortTrigger);
    }
  }
}

function sleep(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new Error("aborted"));
      return;
    }
    const timer = setTimeout(() => {
      resolve();
      signal.removeEventListener("abort", abortTrigger);
    }, ms);
    function abortTrigger() {
      clearTimeout(timer);
      reject(new DOMException("aborted", "AbortError"));
    }
    signal.addEventListener("abort", abortTrigger);
  });
}

function applyJitter(value: number, jitter = 0.1) {
  const noise = value * jitter * Math.random();
  return value + noise;
}
