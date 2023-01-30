import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Spell from 'common/SPELLS/Spell';
import Events, {
  Ability,
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

export default class BuffStackTracker extends Analyzer {
  /////////////////////////////////////////////////////////////////////////////
  // Overrides - implementer must set these values in constructor!
  //

  /** The spell to track */
  static trackedBuff: Spell | Spell[];

  /** Whether the module should look at player (default) or at pets when tracking buffs */
  static trackPets = false;

  /** Time ordered list of buff stack updates */
  buffStackUpdates: BuffStackUpdate[] = [];

  constructor(options: Options) {
    super(options);
    const trackTarget = !this.trackPets ? SELECTED_PLAYER : SELECTED_PLAYER_PET;
    this.addEventListener(
      Events.applybuff.to(trackTarget).spell(this.trackedBuff),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.applybuffstack.to(trackTarget).spell(this.trackedBuff),
      this.onApplyBuffStack,
    );
    this.addEventListener(
      Events.removebuff.to(trackTarget).spell(this.trackedBuff),
      this.onRemoveBuff,
    );
    this.addEventListener(
      Events.removebuffstack.to(trackTarget).spell(this.trackedBuff),
      this.onRemoveBuffStack,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  get trackPets() {
    const ctor = this.constructor as typeof BuffStackTracker;
    return ctor.trackPets;
  }

  get trackedBuff() {
    const ctor = this.constructor as typeof BuffStackTracker;
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
    this._logAndPushUpdate(
      {
        type: event.type,
        timestamp: event.timestamp,
        change: 1,
        current: 1,
      },
      event.ability,
    );
  }

  onApplyBuffStack(event: ApplyBuffStackEvent) {
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
    this._logAndPushUpdate({
      type: event.type,
      timestamp: event.timestamp,
      change: -this.current,
      current: 0,
    });
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
