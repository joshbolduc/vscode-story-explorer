/**
 * An object that lazily performs a predefined operation and caches its result.
 */
export class Cacheable<T> {
  private cachedResult?: { result: T } | undefined;

  /**
   * Initialize a new Cacheable with a given callback.
   *
   * @param callback A callback that will be lazily invoked when the result is
   * requested, and whose return value will be cached and returned for
   * subsequent requests.
   */
  public constructor(private callback: () => T) {}

  /**
   * Get the result of the operation, invoking it if necessary. If the operation
   * has already been invoked, its result is returned.
   *
   * @returns The result of the operation, cached or otherwise.
   */
  public getResult() {
    if (!this.cachedResult) {
      this.cachedResult = { result: this.callback() };
    }

    return this.cachedResult.result;
  }

  /**
   * Get the cached result of the operation, if any, or a default value if the
   * result has not already been determined.
   */
  public getCachedResult(): T | undefined;
  public getCachedResult<U>(defaultValue: U): T | U;
  public getCachedResult<U>(defaultValue?: U) {
    return this.cachedResult ? this.cachedResult.result : defaultValue;
  }

  /**
   * Replace the callback used to computed the cached result. The cached result,
   * if any, is cleared.
   *
   * @param callback A callback that will be lazily invoked when the result is
   * requested, and whose return value will be cached and returned for
   * subsequent requests.
   */
  public setCallback(callback: () => T) {
    this.clear();
    this.callback = callback;
  }

  /**
   * Clears the cached result. The next time a result is requested, the
   * operation will be reinvoked and its return value will be cached again.
   */
  public clear() {
    this.cachedResult = undefined;
  }
}
