export class LazyPromise<T> {
  public readonly promise: Promise<T>;
  private resolveFn!: (value: T | PromiseLike<T>) => void;
  private rejectFn!: (reason?: unknown) => void;

  private _hasResolved = false;
  private resolvedValue?: T;

  private _hasRejected = false;
  private rejectReason?: unknown;

  public constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolveFn = resolve;
      this.rejectFn = reject;
    });
  }

  public resolve(value: T) {
    if (!this._hasResolved && !this._hasRejected) {
      this._hasResolved = true;
      this.resolvedValue = value;
      this.resolveFn(value);
    }
  }

  public reject(reason?: unknown) {
    if (!this._hasResolved && !this._hasRejected) {
      this._hasRejected = true;
      this.rejectReason = reason;
      this.rejectFn(reason);
    }
  }

  public hasResolved(): boolean {
    return this._hasResolved;
  }

  public getResolvedValue() {
    return this.resolvedValue;
  }
}
