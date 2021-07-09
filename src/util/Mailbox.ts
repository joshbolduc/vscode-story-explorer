import { LazyPromise } from './LazyPromise';

/**
 * An object that stores a value and allows others to retrieve it or wait for it
 * to be set.
 */
export class Mailbox<T> {
  private lazyPromise = new LazyPromise<T>();

  /**
   * Get a promise that resolves to the requested value. If the value has not
   * yet been stored, the promise will resolve when it is set.
   *
   * @returns A promise that resolves to the requested value.
   */
  public get(): Promise<T> {
    return this.lazyPromise.promise;
  }

  /**
   * Return the resolved value synchronously, if it is available.
   *
   * @returns The cached resolved value, if any, or `undefined` otherwise.
   */
  public getCached(): T | undefined {
    return this.lazyPromise.getResolvedValue();
  }

  /**
   * Stores a value to be retrieved.
   *
   * @param value The value to store.
   */
  public put(value: T): void {
    if (this.lazyPromise.hasResolved()) {
      this.lazyPromise = new LazyPromise();
    }

    this.lazyPromise.resolve(value);
  }

  /**
   * Clear the existing result, if any. If not previously resolved or rejected,
   * the existing promise is rejected with an aborted error.
   */
  public clear(): void {
    this.lazyPromise.reject(new Error('Aborted'));
    this.lazyPromise = new LazyPromise();
  }

  public dispose(): void {
    this.clear();
  }
}
