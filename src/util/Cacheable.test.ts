import { Cacheable } from './Cacheable';

describe('Cacheable', () => {
  it('invokes operation on first getResult', () => {
    const operation = jest.fn(() => 1234);
    const cacheable = new Cacheable(operation);

    expect(operation).toHaveBeenCalledTimes(0);
    expect(cacheable.getResult()).toBe(1234);
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('uses cached value on subsequest getResult calls', () => {
    const operation = jest.fn(() => 1234);
    const cacheable = new Cacheable(operation);

    expect(operation).toHaveBeenCalledTimes(0);
    expect(cacheable.getResult()).toBe(1234);
    expect(cacheable.getResult()).toBe(1234);
    expect(cacheable.getResult()).toBe(1234);
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('makes cached result available', () => {
    const operation = jest.fn(() => 1234);
    const cacheable = new Cacheable(operation);

    expect(cacheable.getCachedResult()).toBe(undefined);
    expect(operation).toHaveBeenCalledTimes(0);
    expect(cacheable.getResult()).toBe(1234);
    expect(cacheable.getCachedResult()).toBe(1234);
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('handles clearing', () => {
    const operation = jest.fn(() => 1234);
    const cacheable = new Cacheable(operation);

    expect(operation).toHaveBeenCalledTimes(0);
    expect(cacheable.getResult()).toBe(1234);

    cacheable.clear();

    expect(cacheable.getCachedResult()).toBe(undefined);
    expect(cacheable.getResult()).toBe(1234);
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it('getCachedResult supports custom default value', () => {
    const operation = jest.fn(() => 1234);
    const cacheable = new Cacheable(operation);

    expect(cacheable.getCachedResult(999)).toBe(999);
    expect(operation).toHaveBeenCalledTimes(0);
  });

  it('handles replacement callback', () => {
    const operation = jest.fn(() => 1234);
    const cacheable = new Cacheable(operation);

    expect(operation).toHaveBeenCalledTimes(0);
    expect(cacheable.getResult()).toBe(1234);

    const replacementOperation = jest.fn(() => 3456);
    cacheable.setCallback(replacementOperation);

    operation.mockClear();

    expect(cacheable.getCachedResult()).toBe(undefined);
    expect(replacementOperation).toHaveBeenCalledTimes(0);
    expect(cacheable.getResult()).toBe(3456);
    expect(operation).toHaveBeenCalledTimes(0);
    expect(replacementOperation).toHaveBeenCalledTimes(1);
  });
});
