import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, HealEvent, ResourceChangeEvent } from 'parser/core/Events';

interface PositionalData {
  x: number;
  y: number;
  timestamp: number;
}

interface BuffWindow {
  start: number;
  end: number | null;
  lastPosition: PositionalData | null;
  totalMovement: number;
}

class MovementTracker extends Analyzer {
  private buffWindows = new Map<number, BuffWindow[]>();

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.trackPosition);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.trackPosition);
    this.addEventListener(Events.heal.to(SELECTED_PLAYER), this.trackPosition);
    this.addEventListener(Events.resourcechange.to(SELECTED_PLAYER), this.trackPosition);
  }

  startTracking(spellId: number, timestamp: number) {
    if (!this.buffWindows.has(spellId)) {
      this.buffWindows.set(spellId, []);
    }

    const windows = this.buffWindows.get(spellId)!;

    // end active buff windows with the same id
    // can add to this module if several same id buffs can be active simultaneously
    const activeWindow = windows.find((w) => w.end === null);
    if (activeWindow) {
      activeWindow.end = timestamp;
    }

    windows.push({
      start: timestamp,
      end: null,
      lastPosition: null,
      totalMovement: 0,
    });
  }

  stopTracking(spellId: number, timestamp: number) {
    const windows = this.buffWindows.get(spellId);
    if (!windows || windows.length === 0) return;

    const lastWindow = windows[windows.length - 1];
    if (lastWindow.end === null) {
      lastWindow.end = timestamp;
    }
  }

  // parsing from DistanceMoved
  calculateDistance(x1: number, y1: number, x2: number, y2: number) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)) / 100;
  }

  trackPosition(event: CastEvent | DamageEvent | HealEvent | ResourceChangeEvent) {
    if (!event.x || !event.y) return;

    const currentPosition: PositionalData = {
      x: event.x,
      y: event.y,
      timestamp: event.timestamp,
    };

    for (const [_spellId, windows] of this.buffWindows.entries()) {
      const activeWindow = windows.find((w) => w.end === null && event.timestamp >= w.start);

      if (activeWindow) {
        if (activeWindow.lastPosition) {
          if (
            activeWindow.lastPosition.x !== currentPosition.x ||
            activeWindow.lastPosition.y !== currentPosition.y
          ) {
            const distance = this.calculateDistance(
              activeWindow.lastPosition.x,
              activeWindow.lastPosition.y,
              currentPosition.x,
              currentPosition.y,
            );
            activeWindow.totalMovement += distance;
            activeWindow.lastPosition = currentPosition;
          }
        } else {
          activeWindow.lastPosition = currentPosition;
        }
      }
    }
  }

  getTotalMovement(spellId: number): number {
    const windows = this.buffWindows.get(spellId);
    if (!windows) {
      return 0;
    }
    return windows.reduce((total, window) => total + window.totalMovement, 0);
  }

  getTotalDuration(spellId: number): number {
    const windows = this.buffWindows.get(spellId);
    if (!windows) {
      return 0;
    }
    return windows.reduce((total, window) => {
      const end = window.end ?? this.owner.currentTimestamp;
      return total + (end - window.start);
    }, 0);
  }

  getWindowCount(spellId: number): number {
    const windows = this.buffWindows.get(spellId);
    return windows ? windows.length : 0;
  }

  getAverageMovementPerWindow(spellId: number): number {
    const count = this.getWindowCount(spellId);
    if (count === 0) {
      return 0;
    }
    return this.getTotalMovement(spellId) / count;
  }
}

export default MovementTracker;
