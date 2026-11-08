export class RateLimiter {
  private readonly hits = new WeakMap<object, number[]>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {}

  consume(key: object): boolean {
    const now = Date.now();
    const recent = (this.hits.get(key) ?? []).filter(
      (hitAt) => now - hitAt < this.windowMs,
    );
    if (recent.length >= this.limit) {
      this.hits.set(key, recent);
      return false;
    }
    recent.push(now);
    this.hits.set(key, recent);
    return true;
  }
}
