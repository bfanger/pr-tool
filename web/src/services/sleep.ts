export default function sleep(
  ms: number,
  { signal }: { signal?: AbortSignal } = {},
) {
  let timer: ReturnType<typeof setTimeout>;
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error("aborted"));
      return;
    }
    function abortTrigger() {
      clearTimeout(timer);
      reject(new DOMException("aborted", "AbortError"));
    }
    timer = setTimeout(() => {
      resolve();
      signal?.removeEventListener("abort", abortTrigger);
    }, ms);

    signal?.addEventListener("abort", abortTrigger);
  });
}
