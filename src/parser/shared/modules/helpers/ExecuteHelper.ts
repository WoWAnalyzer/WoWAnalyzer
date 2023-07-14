import { formatDuration, formatPercentage } from 'common/format';
import Spell from 'common/SPELLS/Spell';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, {
  Ability,
  MappedEvent,
  ApplyBuffEvent,
  DamageEvent,
  FightEndEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { encodeEventTargetString } from '../Enemies';

const debug = false;

const MS_BUFFER = 500;

export enum ExecuteRangeType {
  /**
   * A range that indicates low (or high, for reverse executes) HP.
   */
  Health,
  /**
   * A range indicating the duration of a single-use buff. After a single cast, the buff is consumed and the ability is no longer usable.
   */
  SingleUseBuff,
  /**
   * A range indicating a buff during which the ability is usable as many times as it is available.
   */
  EnablerBuff,
}

type HealthExecuteRange = {
  type: ExecuteRangeType.Health;
  startEvent: MappedEvent;
  endEvent: MappedEvent;
  ability?: undefined;
};

type BuffExecuteRange = {
  type: Exclude<ExecuteRangeType, ExecuteRangeType.Health>;
  startEvent: MappedEvent;
  endEvent: MappedEvent;
  ability: Ability;
};

/**
 * A range of time (indicated by start and end event) during which an execute spell was usable.
 *
 * If the range corresponds to a buff, there is an `ability` field identifying the buff that enabled the execute.
 */
export type ExecuteRange = HealthExecuteRange | BuffExecuteRange;

type IncompleteExecuteRange<T extends ExecuteRange> = Omit<T, 'endEvent'>;

class ExecuteHelper extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  //region IMPLEMENTME statics
  /**
   * Array of objects from common/SPELLS
   * This should contain any execute spells such as Kill Shot, Execute etc.
   */
  static executeSpells: Spell[] = [];

  /**
   * SELECTED_PLAYER or SELECTED_PLAYER_PET for usage in the eventfilter
   */
  static executeSources: number;

  /**
   * Array of objects from common/SPELLS
   * This should contain any SPELLS object that allows execute to be used outside normal execute range
   */
  static executeOutsideRangeEnablers: Spell[] = [];

  /**
   * Array of objects from common/SPELLS
   * This should contain any SPELLS object that allows an execute to be used once, even outside normal execute range
   */
  static singleExecuteEnablers: Spell[] = [];

  /**
   * Whether cooldown of the executeSpells should count as time in execute.
   * For spells such as Execute this should be set to true,
   * but for spells like Aimed Shot that also function outside of execute this shouldn't be set.
   */
  static countCooldownAsExecuteTime: boolean;

  /**
   * The lower threshold where execute is enabled, shown in decimals.
   */
  static lowerThreshold: number;

  /**
   * The upper threshold where an execute can be enabled immediately at a pull, shown in decimals.
   */
  static upperThreshold: number;

  /**
   * A boolean representing if the given execute modifies the damage of an existing spell.
   * An execute spell should be labelled as false, whereas a talent that modifies an existing spell should be labelled as true.
   */
  static modifiesDamage: boolean;

  /**
   * represents the modifier of of a talent (or some other effect) that modifies the damage done by an existing spell
   */
  static damageModifier: number;
  //endregion

  //region Generic Variables
  /**
   * Is true if we're in an execute window either because of a buff giving access to execute spells or because of health windows
   */
  inExecuteWindow: boolean = false;

  /**
   * Is true if we're in an execute window due to health on a target, so a buff granting access to execute is pointless at this point
   */
  inHealthExecuteWindow: boolean = false;

  /**
   * A variable marking the timestamp of the start of the current execute window
   */
  executeWindowStart: number = 0;

  /**
   * A variable marking the timestamp of the last damage event within the execute window
   */
  lastExecuteHitTimestamp: number = 0;

  /**
   * The amount of time spent inside executewindows, either caused by health or by buffs giving access to execute
   */
  totalExecuteWindowDuration: number = 0;

  /**
   * Amount of damage done by the spells defined in executeSpells
   */
  damage: number = 0;

  /**
   * returns the total amount of casts of the executes listed in executeSpells
   */
  casts: number = 0;

  /**
   * returns the amount of casts of the executes listed in executeSpells that were cast whilst being in an execute window
   */
  castsWithExecute: number = 0;

  /**
   * returns the amount of times a buff was applied that allows for a single cast of a given execute spell
   */
  singleExecuteEnablerApplications: number = 0;
  //endregion

  public readonly executeRanges: ExecuteRange[] = [];

  // track in-progress ranges to later be completed and appended to `executeRanges`
  // need one per type because they may overlap (e.g. you could get a Kill Shot proc during the execute HP period.)
  private currentHealthRanges: Map<string, IncompleteExecuteRange<HealthExecuteRange>> = new Map();
  private currentBuffRanges: Map<number, IncompleteExecuteRange<BuffExecuteRange>> = new Map();

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
    return event.hitPoints / event.maxHitPoints < this.lowerThreshold;
  }

  /**
   * Returns true if the event has more HP than the threshold.
   * This is useful for things like Firestarter and Flashpoint.
   * @param event
   */
  isTargetInReverseExecuteRange(event: DamageEvent) {
    if (!event.hitPoints || !event.maxHitPoints) {
      return false;
    }
    return event.hitPoints / event.maxHitPoints > this.upperThreshold;
  }

  /**
   * Returns true if either isTargetInExecuteRange() or isTargetInReverseExecuteRange() is true.
   * @param event
   */
  isTargetInHealthExecuteWindow(event: DamageEvent) {
    if (!event.hitPoints || !event.maxHitPoints) {
      return false;
    }
    return this.isTargetInExecuteRange(event) || this.isTargetInReverseExecuteRange(event);
  }

  /**
   * Returns true if the combatant has one of the buffs that enable execute to be used outside of the regular execute windows
   */
  get isExecuteUsableOutsideExecuteRange() {
    let usable = false;
    this.executeOutsideRangeEnablers.forEach((spell) => {
      if (this.selectedCombatant.hasBuff(spell.id)) {
        usable = true;
      }
    });
    return usable;
  }

  /**
   * If all execute spells are on cooldown, then we should count the entire period of cooldown as "inside execute" to properly calculate maxCasts
   */
  get areExecuteSpellsOnCD() {
    let allOnCD = true;
    this.executeSpells.forEach((spell) => {
      if (!this.spellUsable.isOnCooldown(spell.id)) {
        allOnCD = false;
      }
    });
    return allOnCD;
  }

  //endregion

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.damage.by(this.executeSources), this.onGeneralDamage);
    this.addEventListener(
      Events.cast.by(this.executeSources).spell(this.executeSpells),
      this.onExecuteCast,
    );
    this.addEventListener(
      Events.damage.by(this.executeSources).spell(this.executeSpells),
      this.onExecuteDamage,
    );
    this.addEventListener(
      Events.applybuff.to(this.executeSources).spell(this.executeOutsideRangeEnablers),
      this.applyExecuteEnablerBuff,
    );
    this.addEventListener(
      Events.removebuff.to(this.executeSources).spell(this.executeOutsideRangeEnablers),
      this.removeExecuteEnablerBuff,
    );
    this.addEventListener(
      Events.applybuff.to(this.executeSources).spell(this.singleExecuteEnablers),
      this.applySingleExecuteEnablerBuff,
    );
    this.addEventListener(
      Events.refreshbuff.to(this.executeSources).spell(this.singleExecuteEnablers),
      this.refreshSingleExecuteEnablerBuff,
    );
    this.addEventListener(
      Events.removebuff.to(this.executeSources).spell(this.singleExecuteEnablers),
      this.removeSingleExecuteEnablerBuff,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  //region Static Getters
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

  get modifiesDamage() {
    const ctor = this.constructor as typeof ExecuteHelper;
    return ctor.modifiesDamage;
  }

  get damageModifier() {
    const ctor = this.constructor as typeof ExecuteHelper;
    return ctor.damageModifier;
  }

  get countCooldownAsExecuteTime() {
    const ctor = this.constructor as typeof ExecuteHelper;
    return ctor.countCooldownAsExecuteTime;
  }

  get singleExecuteEnablers() {
    const ctor = this.constructor as typeof ExecuteHelper;
    return ctor.singleExecuteEnablers;
  }
  //endregion

  //region Generic Getters
  get executeDamage() {
    return this.damage;
  }

  get totalExecuteDuration() {
    return this.totalExecuteWindowDuration;
  }

  get totalCasts() {
    return this.casts;
  }

  get totalExecuteCasts() {
    return this.castsWithExecute;
  }

  get totalNonExecuteCasts() {
    return this.casts - this.castsWithExecute;
  }

  //endregion

  //region Event Listener functions
  onGeneralDamage(event: DamageEvent) {
    if (event.targetIsFriendly) {
      return;
    }

    const targetKey = encodeEventTargetString(event);
    const currentHealthRange = this.currentHealthRanges.get(targetKey);

    // maintain execute ranges
    // future conditionals don't handle overlapping ranges
    if (
      this.isTargetInHealthExecuteWindow(event) &&
      event.overkill === undefined &&
      !currentHealthRange
    ) {
      // open the health execute range
      this.currentHealthRanges.set(targetKey, {
        type: ExecuteRangeType.Health,
        startEvent: event,
      });
    } else if (
      // we check overkill here because certain enemies "die" but don't actually die for fight reasons.
      // example: on primal council the bosses stay at 1 hp until all are killed.
      (!this.isTargetInHealthExecuteWindow(event) ||
        event.hitPoints === 0 ||
        (event.overkill ?? 0) > 0) &&
      currentHealthRange
    ) {
      // close the health execute range
      this.executeRanges.push({
        ...currentHealthRange,
        endEvent: event,
      });
      this.currentHealthRanges.delete(targetKey);
    }

    if (
      (this.areExecuteSpellsOnCD && this.countCooldownAsExecuteTime) ||
      this.isExecuteUsableOutsideExecuteRange ||
      this.isTargetInHealthExecuteWindow(event)
    ) {
      this.lastExecuteHitTimestamp = event.timestamp;
      if (!this.inExecuteWindow) {
        this.inExecuteWindow = true;
        this.inHealthExecuteWindow = true;
        this.executeWindowStart = event.timestamp;
        debug &&
          console.log(
            'Execute window started at timestamp:',
            event.timestamp,
            'with ability',
            event.ability.name,
            `at ${formatPercentage((event.hitPoints ?? 1) / (event.maxHitPoints ?? 1))}%`,
          );
      }
    } else {
      if (this.inExecuteWindow && event.timestamp > this.lastExecuteHitTimestamp + MS_BUFFER) {
        this.inExecuteWindow = false;
        this.inHealthExecuteWindow = false;
        this.totalExecuteWindowDuration += event.timestamp - this.executeWindowStart;
        debug &&
          console.log(
            'Execute window ended, current total time in execute: ',
            this.totalExecuteDuration,
            'at timestamp:',
            event.timestamp,
          );
      }
    }
  }

  onExecuteCast() {
    this.casts += 1;
    if (this.inExecuteWindow || this.inHealthExecuteWindow) {
      this.castsWithExecute += 1;
    }
  }

  onExecuteDamage(event: DamageEvent) {
    if (this.inExecuteWindow || this.inHealthExecuteWindow) {
      if (this.modifiesDamage) {
        this.damage += calculateEffectiveDamage(event, this.damageModifier);
      } else {
        this.damage += event.amount + (event.absorbed || 0);
      }
    }
  }

  applySingleExecuteEnablerBuff(event: ApplyBuffEvent) {
    this.singleExecuteEnablerApplications += 1;

    const ability = event.ability;

    // applybuff means there isn't already a window for this buff
    // ---or if there is we missed the end due to logging range or other quirks.
    this.currentBuffRanges.set(ability.guid, {
      type: ExecuteRangeType.SingleUseBuff,
      ability,
      startEvent: event,
    });
  }

  refreshSingleExecuteEnablerBuff(event: RefreshBuffEvent) {
    this.singleExecuteEnablerApplications += 1;
  }

  removeSingleExecuteEnablerBuff(event: RemoveBuffEvent) {
    const range = this.currentBuffRanges.get(event.ability.guid);
    this.currentBuffRanges.delete(event.ability.guid);

    if (range) {
      this.executeRanges.push({
        ...range,
        endEvent: event,
      });
    } else {
      debug && console.warn('Single-Use Execute range ended without a starting event!', event);
    }
  }

  applyExecuteEnablerBuff(event: ApplyBuffEvent) {
    if (!this.inExecuteWindow && !this.inHealthExecuteWindow) {
      this.executeWindowStart = event.timestamp;
    }
    this.inExecuteWindow = true;
    this.lastExecuteHitTimestamp = event.timestamp;
    // similar logic here as for single execute enablers---applybuff means it wasn't there, so no open buff window
    const ability = event.ability;
    this.currentBuffRanges.set(ability.guid, {
      type: ExecuteRangeType.EnablerBuff,
      ability,
      startEvent: event,
    });
    debug && console.log(event.ability.name, ' was applied starting the execute window');
  }

  removeExecuteEnablerBuff(event: RemoveBuffEvent) {
    if (!this.inHealthExecuteWindow) {
      this.inExecuteWindow = false;
      this.totalExecuteWindowDuration += event.timestamp - this.executeWindowStart;
      debug &&
        console.log(
          event.ability.name,
          ' was removed ending the execute window, current total: ',
          this.totalExecuteDuration,
        );
    } else {
      debug &&
        console.log(
          'Execute enabler buff ended, but inside execute health window so window still ongoing.',
        );
    }

    // maintain buff windows
    const incompleteRange = this.currentBuffRanges.get(event.ability.guid);
    this.currentBuffRanges.delete(event.ability.guid);

    if (incompleteRange) {
      this.executeRanges.push({
        ...incompleteRange,
        endEvent: event,
      });
    } else {
      debug &&
        console.warn(
          'Execute enabler buff ended, but there was not an incomplete buff window ongoing!',
          event,
        );
    }
  }

  onFightEnd(event: FightEndEvent) {
    if (this.inExecuteWindow) {
      this.totalExecuteWindowDuration += event.timestamp - this.executeWindowStart;
      this.inExecuteWindow = false;
    }
    // close off all incomplete ranges and add them to executeRanges

    for (const healthRange of this.currentHealthRanges.values()) {
      this.executeRanges.push({
        ...healthRange,
        endEvent: event,
      });
    }

    for (const buffRange of this.currentBuffRanges.values()) {
      this.executeRanges.push({
        ...buffRange,
        endEvent: event,
      });
    }

    debug &&
      console.log(
        'Fight ended, total duration of execute: ' +
          this.totalExecuteDuration +
          ' | ' +
          formatDuration(this.totalExecuteDuration),
      );
  }

  //endregion
}

export default ExecuteHelper;
