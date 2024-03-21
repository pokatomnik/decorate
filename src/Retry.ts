import { ClassMethod } from "./ClassMethod.ts";

const TIMES_FALLBACK_VALUE = 1;

/**
 * Repeats trying to invoke an asynchronous method until
 * attemps exceeded or the Promise resolves a value
 * @param times how many times to try
 * @param retryIf optional function to test if further attempts should be.
 * @returns class method decorator
 */
export function Retry<
  TThis extends object,
  TArgs extends ReadonlyArray<unknown>,
  TReturn
>(times: number, retryIf: (error: unknown) => boolean = () => true) {
  return function (
    target: ClassMethod<TThis, Promise<TReturn>, TArgs>,
    _context: ClassMethodDecoratorContext<
      TThis,
      ClassMethod<TThis, Promise<TReturn>, TArgs>
    >
  ) {
    return async function (this: TThis, ...args: TArgs): Promise<TReturn> {
      const timesCorrect = ensureCorrectTimesValue(times);
      let lastError: unknown;
      for (let i = 0; i < timesCorrect; ++i) {
        try {
          return await target.call(this, ...args);
        } catch (e) {
          if (!retryIf(e)) {
            throw e;
          }
          lastError = e;
        }
      }
      throw lastError ?? new Error();
    };
  };
}

function ensureCorrectTimesValue(value: number): number {
  if (Number.isNaN(value)) {
    return TIMES_FALLBACK_VALUE;
  }
  if (!Number.isFinite(value)) {
    return TIMES_FALLBACK_VALUE;
  }
  const times = Math.floor(value);
  return Math.max(TIMES_FALLBACK_VALUE, times);
}
