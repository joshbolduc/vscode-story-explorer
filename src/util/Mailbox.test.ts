import { Mailbox } from './Mailbox';

describe('Mailbox', () => {
  it('resolves existing value', async () => {
    const mailbox = new Mailbox<number>();
    mailbox.put(1234);

    expect(await mailbox.get()).toBe(1234);
  });

  it('resolves promise that waits for value to be set', async () => {
    const mailbox = new Mailbox<number>();

    const getPromise = mailbox.get();
    mailbox.put(1234);

    expect(await getPromise).toBe(1234);
  });

  it('returns cached value immediately', () => {
    const mailbox = new Mailbox<number>();

    expect(mailbox.getCached()).toBe(undefined);

    mailbox.put(1234);
    expect(mailbox.getCached()).toBe(1234);
  });

  it('handles multiple waiters', async () => {
    const mailbox = new Mailbox<number>();

    const getPromises = [mailbox.get(), mailbox.get(), mailbox.get()];
    mailbox.put(1234);

    const additionalPromises = [mailbox.get(), mailbox.get()];

    expect(await Promise.all(getPromises)).toEqual([1234, 1234, 1234]);
    expect(await Promise.all(additionalPromises)).toEqual([1234, 1234]);
  });

  it('resolves to changed value when value is replaced without being cleared', async () => {
    const mailbox = new Mailbox<number>();

    mailbox.put(1234);
    mailbox.put(3456);

    expect(await mailbox.get()).toBe(3456);
  });

  it('resolves to changed value when value is replaced after clear', async () => {
    const mailbox = new Mailbox<number>();

    mailbox.put(1234);
    mailbox.clear();
    mailbox.put(3456);

    expect(await mailbox.get()).toBe(3456);
  });

  it('resolves to changed value after reset when initially unavailable and value was never read', async () => {
    const mailbox = new Mailbox<number>();

    mailbox.put(1234);
    mailbox.clear();

    const getPromise = mailbox.get();
    mailbox.put(3456);

    expect(await getPromise).toBe(3456);
  });

  it('resolves to changed value after reset when initially unavailable and value was initially read', async () => {
    const mailbox = new Mailbox<number>();

    mailbox.put(1234);

    expect(await mailbox.get()).toBe(1234);
    mailbox.clear();

    const getPromise = mailbox.get();
    mailbox.put(3456);

    expect(await getPromise).toBe(3456);
  });

  it('returns undefined as cached value after being cleared', () => {
    const mailbox = new Mailbox<number>();

    mailbox.put(1234);
    mailbox.clear();

    expect(mailbox.getCached()).toBe(undefined);
  });

  it('returns updated value after value is replaced without being cleared', () => {
    const mailbox = new Mailbox<number>();

    mailbox.put(1234);
    mailbox.put(3456);

    expect(mailbox.getCached()).toBe(3456);
  });

  it('returns updated value after value is cleared and then replaced', () => {
    const mailbox = new Mailbox<number>();

    mailbox.put(1234);
    mailbox.clear();
    mailbox.put(3456);

    expect(mailbox.getCached()).toBe(3456);
  });
});
