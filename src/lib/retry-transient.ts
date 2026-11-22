const retryDelays = [1_000, 2_000, 4_000, 8_000, 10_000, 10_000, 10_000, 10_000] as const;
type RetryTransientOptions = {
  delays?: readonly number[];
  shouldRetryError?: (error: unknown) => boolean;
};

export function isTransientHttpStatus(status: number) {
  return [408, 425, 429, 500, 502, 503, 504].includes(status);
}

export async function retryTransient<T>(
  operation: () => Promise<T>,
  shouldRetryResult: (result: T) => boolean,
  signal?: AbortSignal,
  options: RetryTransientOptions = {},
): Promise<T> {
  const delays = options.delays ?? retryDelays;
  for (let attempt = 0; ; attempt += 1) {
    if (signal?.aborted) throw signal.reason ?? createAbortError();

    try {
      const result = await operation();
      if (!shouldRetryResult(result) || attempt >= delays.length) return result;
      if (typeof Response !== "undefined" && result instanceof Response) {
        void result.body?.cancel().catch(() => undefined);
      }
    } catch (error) {
      if (signal?.aborted) throw error;
      if (attempt >= delays.length || !(options.shouldRetryError?.(error) ?? isTransientError(error))) throw error;
    }

    await waitForRetry(delays[attempt], signal);
  }
}

function isTransientError(error: unknown) {
  if (error instanceof TypeError) return true;
  if (!(error instanceof Error)) return false;
  if (/failed to fetch|network error|networkerror|load failed/i.test(error.message)) return true;

  const status = "status" in error ? error.status : "statusCode" in error ? error.statusCode : undefined;
  return typeof status === "number" && isTransientHttpStatus(status);
}

function waitForRetry(delay: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? createAbortError());
      return;
    }

    const finish = () => {
      signal?.removeEventListener("abort", abort);
      resolve();
    };
    const timer = setTimeout(finish, delay);
    const abort = () => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
      reject(signal?.reason ?? createAbortError());
    };
    signal?.addEventListener("abort", abort, { once: true });
    if (signal?.aborted) abort();
  });
}

function createAbortError() {
  return Object.assign(new Error("The request was cancelled."), { name: "AbortError" });
}
