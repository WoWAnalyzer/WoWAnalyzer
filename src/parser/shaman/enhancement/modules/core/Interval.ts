const debug = false;

export class Interval {
  protected startTime: number;
  protected endTime: number | undefined = undefined;

  constructor(timestamp: number) {
    this.startTime = timestamp;
  }

  get duration(): number {
    if (this.endTime === undefined) {
      debug &&
      console.error(
        'Cannot calculate duration of an Interval with no endTime.',
      );
      return 0;
    }
    return this.endTime - this.startTime;
  }

  get ended(): boolean {
    return this.endTime !== undefined;
  }

  end(timestamp: number) {
    this.endTime = timestamp;
  }
}
