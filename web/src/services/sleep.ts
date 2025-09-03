export default function sleep(
  ms: number,
  { signal }: { signal?: AbortSignal } = {},
) {
  let timer: ReturnType<typeof setTimeout>;
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(
        signal.reason ?? new DOMException("sleep was aborted", "AbortError"),
      );
      return;
    }
    function listener() {
      clearTimeout(timer);
      signal?.removeEventListener("abort", listener);
      reject(
        signal?.reason ?? new DOMException("sleep was aborted", "AbortError"),
      );
    }
    timer = setTimeout(() => {
      resolve();
      signal?.removeEventListener("abort", listener);
    }, ms);

    signal?.addEventListener("abort", listener);
  });
}
