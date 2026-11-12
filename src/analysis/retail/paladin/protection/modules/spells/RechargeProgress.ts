interface Checkpoint {
  timestamp: number;
  progress: number;
  cooldownMs: number;
}

export default class RechargeProgress {
  private readonly checkpoints: Checkpoint[];

  constructor(
    private readonly baseCooldownMs: number,
    timestamp: number,
    haste: number,
  ) {
    this.checkpoints = [{ timestamp, progress: 0, cooldownMs: baseCooldownMs / (1 + haste) }];
  }

  changeHaste(timestamp: number, haste: number) {
    this.checkpoints.push({
      timestamp,
      progress: this.progressAt(timestamp),
      cooldownMs: this.baseCooldownMs / (1 + haste),
    });
  }

  reductionProgress(timestamps: number[], reductionMs: number) {
    return timestamps.reduce(
      (total, timestamp) => total + reductionMs / this.checkpointAt(timestamp).cooldownMs,
      0,
    );
  }

  between(start: number, end: number) {
    return this.progressAt(end) - this.progressAt(start);
  }

  private checkpointAt(timestamp: number) {
    return (
      this.checkpoints.findLast((checkpoint) => checkpoint.timestamp <= timestamp) ??
      this.checkpoints[0]
    );
  }

  private progressAt(timestamp: number) {
    const checkpoint = this.checkpointAt(timestamp);
    return (
      checkpoint.progress + Math.max(0, timestamp - checkpoint.timestamp) / checkpoint.cooldownMs
    );
  }
}
