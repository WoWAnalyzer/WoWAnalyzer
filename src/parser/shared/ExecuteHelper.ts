import Events, { ApplyBuffEvent, DamageEvent, FightEndEvent, RemoveBuffEvent } from 'parser/core/Events';
import Analyzer from 'parser/core/Analyzer';
import { formatDuration } from 'common/format';

const debug = true;

const MS_BUFFER = 500;

class ExecuteHelper extends Analyzer {

  //region IMPLEMENTME statics
  /**
   * Array of objects from common/SPELLS
   * This should contain any execute spells such as Kill Shot, Execute etc.
   */
  static executeSpells: { id: number, name: string, icon: string }[] = [];

  /**
   * SELECTED_PLAYER or SELECTED_PLAYER_PET for usage in the eventfilter
   */
  static executeSources: number;

  /**
   * Array of objects from common/SPELLS
   * This should contain any SPELLS object that allows execute to be used outside normal execute range
   */
  static executeOutsideRangeEnablers: { id: number, name: string, icon: string }[] = [];

  /**
   * The lower threshold where execute is enabled, shown in decimals.
   */
  static lowerThreshold: number;

  /**
   * The upper threshold where an execute can be enabled immediately at a pull, shown in decimals.
   */
  static upperThreshold: number;
  //endregion

  inExecuteWindow: boolean = false;
  inHealthExecuteWindow: boolean = false;
  executeWindowStart: number = 0;
  lastExecuteHitTimestamp: number = 0;
  totalExecuteWindowDuration: number = 0;
  damage: number = 0;

  //region Execute helpers
  /**
   * Returns true if the event has less HP than the threshold.
   * This is useful for any generic execute.
   * @param event
   */
  isTargetInExecuteRange(event: DamageEvent) {
    if (!event.hitPoints || !event.maxHitPoints) {
      return false;
    }
    return (event.hitPoints / event.maxHitPoints) < this.lowerThreshold;
  }

  /**
   * Returns true if the event has more HP than the threshold.
   * This is useful for things like Firestarter and Flashpoint.
   * @param event
   */
  isTargetInPullExecuteRange(event: DamageEvent) {
    if (!event.hitPoints || !event.maxHitPoints) {
      return false;
    }
    return (event.hitPoints / event.maxHitPoints) > this.upperThreshold;
  }

  /**
   * Returns true if the combatant has one of the buffs that enable execute to be used outside of the regular execute windows
   */
  isExecuteUsableOutsideExecuteRange() {
    let usable: boolean = false;
    this.executeOutsideRangeEnablers.forEach(spell => {
      debug && console.log(spell);
      if (this.selectedCombatant.hasBuff(spell.id)) {
        usable = true;
      }
    });
    return usable;
  }
  //endregion

  constructor(options: any) {
    super(options);
    this.addEventListener(Events.damage.by(this.executeSources), this.onGeneralDamage);
    this.addEventListener(Events.damage.by(this.executeSources).spell(this.executeSpells), this.onExecuteDamage);
    this.addEventListener(Events.applybuff.to(this.executeSources).spell(this.executeOutsideRangeEnablers), this.applyExecuteEnablerBuff);
    this.addEventListener(Events.removebuff.to(this.executeSources).spell(this.executeOutsideRangeEnablers), this.removeExecuteEnablerBuff);
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  get executeSources() {
    const ctor = this.constructor as typeof ExecuteHelper;
    return ctor.executeSources;
  }

  get executeSpells() {
    const ctor = this.constructor as typeof ExecuteHelper;
    return ctor.executeSpells;
  }

  get executeOutsideRangeEnablers() {
    const ctor = this.constructor as typeof ExecuteHelper;
    return ctor.executeOutsideRangeEnablers;
  }

  get lowerThreshold() {
    const ctor = this.constructor as typeof ExecuteHelper;
    return ctor.lowerThreshold;
  }

  get upperThreshold() {
    const ctor = this.constructor as typeof ExecuteHelper;
    return ctor.upperThreshold;
  }

  get executeDamage() {
    return this.damage;
  }

  get totalExecuteDuration() {
    return this.totalExecuteWindowDuration;
  }

  onGeneralDamage(event: DamageEvent) {
    if (event.targetIsFriendly) {
      return;
    }
    if (this.isExecuteUsableOutsideExecuteRange() || this.isTargetInExecuteRange(event) || this.isTargetInPullExecuteRange(event)) {
      this.lastExecuteHitTimestamp = event.timestamp;
      if (!this.inExecuteWindow) {
        this.inExecuteWindow = true;
        this.inHealthExecuteWindow = true;
        this.executeWindowStart = event.timestamp;
        debug && console.log('Execute window started');
      }
    } else {
      if (this.inExecuteWindow && event.timestamp > this.lastExecuteHitTimestamp + MS_BUFFER) {
        this.inExecuteWindow = false;
        this.inHealthExecuteWindow = false;
        this.totalExecuteWindowDuration += event.timestamp - this.executeWindowStart;
        debug && console.log('Execute window ended, current total: ', this.totalExecuteDuration);
      }
    }
  }

  onExecuteDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  applyExecuteEnablerBuff(event: ApplyBuffEvent) {
    this.inExecuteWindow = true;
    this.lastExecuteHitTimestamp = event.timestamp;
  }

  removeExecuteEnablerBuff(event: RemoveBuffEvent) {
    if (!this.inHealthExecuteWindow) {
      this.inExecuteWindow = false;
      this.totalExecuteWindowDuration += event.timestamp - this.executeWindowStart;
      debug && console.log(event.ability.name, ' was removed ending the execute window, current total: ', this.totalExecuteDuration);
    } else {
      debug && console.log('Execute enabler buff ended, but inside execute health window so window still ongoing.');
    }
  }

  onFightEnd(event: FightEndEvent) {
    if (this.inExecuteWindow) {
      this.totalExecuteWindowDuration += event.timestamp - this.executeWindowStart;
    }
    debug && console.log('Fight ended, total duration of execute: ' + this.totalExecuteDuration + ' | ' + formatDuration(this.totalExecuteDuration));
  }

}

export default ExecuteHelper;
