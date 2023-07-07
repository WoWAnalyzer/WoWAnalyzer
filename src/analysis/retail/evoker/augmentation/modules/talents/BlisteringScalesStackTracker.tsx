import TALENTS from 'common/TALENTS/evoker';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  Ability,
  AnyEvent,
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  FightEndEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';

type BuffStackUpdate = {
  /** What triggered this update */
  type: string;
  /** This update's timestamp */
  timestamp: number;
  /** Instant change of resources with this update (negative indicates a spend or drain)
   *  This is the 'effective' change only */
  change: number;
  /** Amount of resource the player has AFTER the change */
  current: number;
};

const DEBUG = false;

export default class BlisteringScalesStackTracker extends Analyzer {
  static trackedBuff = TALENTS.BLISTERING_SCALES_TALENT;

  static trackPets = false;

  currentBuffTargetId: number = 0;

  buffStackUpdates: BuffStackUpdate[] = [];

  startStacksGathered: boolean = false;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(this.trackedBuff),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(this.trackedBuff),
      this.onApplyBuffStack,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(this.trackedBuff),
      this.onRemoveBuff,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(this.trackedBuff),
      this.onRemoveBuffStack,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  get trackPets() {
    const ctor = this.constructor as typeof BlisteringScalesStackTracker;
    return ctor.trackPets;
  }

  get trackedBuff() {
    const ctor = this.constructor as typeof BlisteringScalesStackTracker;
    return ctor.trackedBuff;
  }

  /** The player's buff stack amount at the current timestamp */
  get current(): number {
    const lastUpdate = this.buffStackUpdates.at(-1);
    if (!lastUpdate) {
      // there have been no updates so far, return a default
      return 0;
    }
    return lastUpdate.current;
  }

  onApplyBuff(event: ApplyBuffEvent) {
    if (!this.startStacksGathered) {
      this.createGraphStart(event);
    }
    this.currentBuffTargetId = event.targetID;
    this._logAndPushUpdate(
      {
        type: event.type,
        timestamp: event.timestamp,
        change: 15 - this.current,
        current: 15,
      },
      event.ability,
    );
  }

  onApplyBuffStack(event: ApplyBuffStackEvent) {
    if (!this.startStacksGathered) {
      this.createGraphStart(event);
    }
    this._logAndPushUpdate(
      {
        type: event.type,
        timestamp: event.timestamp,
        change: event.stack - this.current,
        current: event.stack,
      },
      event.ability,
    );
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    if (!this.startStacksGathered) {
      this.createGraphStart(event);
    }
    if (event.targetID !== this.currentBuffTargetId) {
      return;
    }
    this._logAndPushUpdate(
      {
        type: event.type,
        timestamp: event.timestamp,
        change: -this.current,
        current: 0,
      },
      event.ability,
    );
  }

  onRemoveBuffStack(event: RemoveBuffStackEvent) {
    if (!this.startStacksGathered) {
      this.createGraphStart(event);
    }
    this._logAndPushUpdate(
      {
        type: event.type,
        timestamp: event.timestamp,
        change: event.stack - this.current,
        current: event.stack,
      },
      event.ability,
    );
  }

  onFightEnd(event: FightEndEvent) {
    if (!this.startStacksGathered) {
      this.createGraphStart(event);
    }
    this._logAndPushUpdate({
      type: event.type,
      timestamp: event.timestamp,
      change: -this.current,
      current: 0,
    });
  }

  createGraphStart(event: AnyEvent) {
    if (!this.startStacksGathered) {
      this._logAndPushUpdate({
        type: event.type,
        timestamp: this.owner.fight.start_time,
        change: 0,
        current: 0,
      });
      this.startStacksGathered = true;
    }
  }

  _logAndPushUpdate(update: BuffStackUpdate, spell?: Ability) {
    if (DEBUG) {
      console.log(
        'Update for ' + spell?.name + ' @ ' + this.owner.formatTimestamp(update.timestamp, 1),
        update,
      );
    }
    this.buffStackUpdates.push(update);
  }
}
