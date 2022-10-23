import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Spell from 'common/SPELLS/Spell';
import Events, { ApplyBuffEvent, ChangeBuffStackEvent, RemoveBuffEvent } from 'parser/core/Events';

type BuffStackUpdate = {
  /** What triggered this update */
  type: BuffStackChange;
  /** This update's timestamp */
  timestamp: number;
  /** Instant change of resources with this update (negative indicates a spend or drain)
   *  This is the 'effective' change only, any overcap goes in changeWaste */
  change: number;
  /** Amount of resource the player has AFTER the change */
  current: number;
};

type BuffStackChange =
  /** Player gained a buff stack */
  | 'apply'
  /** Player lost a buff stack */
  | 'remove';

const DEBUG = false;

export default class BuffStackTracker extends Analyzer {
  /////////////////////////////////////////////////////////////////////////////
  // Overrides - implementer must set these values in constructor!
  //

  /** The spell to track */
  buff!: Spell;

  /** Time ordered list of buff stack updates */
  buffStackUpdates: BuffStackUpdate[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER), this.onApplyBuff);
    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER), this.onRemoveBuff);
    this.addEventListener(Events.changebuffstack.to(SELECTED_PLAYER), this.onChangeBuffStack);
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
    const spellId = event.ability.guid;

    if (spellId !== this.buff.id) {
      return;
    }

    this._buffStackUpdate('apply', 1);
  }

  onChangeBuffStack(event: ChangeBuffStackEvent) {
    const spellId = event.ability.guid;

    if (spellId !== this.buff.id) {
      return;
    }

    const type = event.newStacks - event.oldStacks > 0 ? 'apply' : 'remove';
    this._buffStackUpdate(type, event.newStacks - event.oldStacks);
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    const spellId = event.ability.guid;

    if (spellId !== this.buff.id) {
      return;
    }

    this._buffStackUpdate('remove', -1);
  }

  _buffStackUpdate(type: BuffStackChange, change: number) {
    const timestamp = this.owner.currentTimestamp;

    const beforeAmount = this.current;
    const current = beforeAmount + change;

    this._logAndPushUpdate({
      type,
      timestamp,
      change,
      current,
    });
  }

  _logAndPushUpdate(update: BuffStackUpdate) {
    if (DEBUG) {
      console.log(
        'Update for ' + this.buff.name + ' @ ' + this.owner.formatTimestamp(update.timestamp, 1),
        update,
      );
    }
    this.buffStackUpdates.push(update);
  }
}
