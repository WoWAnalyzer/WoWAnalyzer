import { formatMilliseconds, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import CLASSIC_SPELLS from 'common/SPELLS/classic';
import { TALENTS_DEATH_KNIGHT, TALENTS_MAGE, TALENTS_PRIEST, TALENTS_SHAMAN } from 'common/TALENTS';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import GameBranch from 'game/GameBranch';
import { wclGameVersionToBranch } from 'game/VERSIONS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Combatant from 'parser/core/Combatant';
import EventFilter from 'parser/core/EventFilter';
import Events, {
  Item,
  AnyEvent,
  ApplyBuffEvent,
  ApplyDebuffEvent,
  ChangeBuffStackEvent,
  ChangeDebuffStackEvent,
  ChangeStatsEvent,
  EventType,
  SourcedEvent,
  RemoveBuffEvent,
  RemoveDebuffEvent,
} from 'parser/core/Events';
import EventEmitter from 'parser/core/modules/EventEmitter';
import StatTracker from 'parser/shared/modules/StatTracker';

const debug = false;

interface HasteBuff {
  itemId?: number;
  hastePerStack?: number;
  haste?: number;
}

type HasteBuffMap = { [spellId: number]: number | HasteBuff };

const DEFAULT_HASTE_BUFFS: HasteBuffMap = {
  // HASTE RATING BUFFS ARE HANDLED BY THE STATTRACKER MODULE

  ...BLOODLUST_BUFFS,
  [SPELLS.BERSERKING.id]: 0.1,

  //region Warrior
  [SPELLS.ENRAGE.id]: 0.25,
  [SPELLS.IN_FOR_THE_KILL_TALENT_BUFF.id]: 0.1,
  //endregion

  //region Demon Hunter
  [SPELLS.METAMORPHOSIS_HAVOC_BUFF.id]: 0.25,
  [SPELLS.FURIOUS_GAZE.id]: 0.1, // Havoc DH haste buff from fully channeling a cast of Eye Beam
  //endregion

  //region Death Knight
  [SPELLS.BONE_SHIELD.id]: 0.1, // Blood DK haste buff from maintaining boneshield
  [TALENTS_DEATH_KNIGHT.EMPOWER_RUNE_WEAPON_TALENT.id]: 0.15,
  [TALENTS_DEATH_KNIGHT.UNHOLY_ASSAULT_TALENT.id]: 0.3,
  [SPELLS.UNHOLY_GROUND_HASTE_BUFF.id]: 0.05,
  //endregion

  //region Druid
  [SPELLS.STARLORD.id]: {
    hastePerStack: 0.04,
  },
  [SPELLS.CELESTIAL_ALIGNMENT.id]: 0.1,
  [SPELLS.INCARNATION_CHOSEN_OF_ELUNE.id]: 0.1,
  [SPELLS.NATURES_GRACE.id]: 0.15,
  [SPELLS.FRANTIC_MOMENTUM.id]: 0.1,
  [SPELLS.CENARIUS_MIGHT_BUFF.id]: 0.1,
  [SPELLS.SAVAGE_FURY_BUFF.id]: 0.1,
  // Guardian Berserk handled in spec module
  //endregion

  //region Hunter
  [SPELLS.DIRE_BEAST_BUFF.id]: 0.05,
  [SPELLS.STEADY_FOCUS_BUFF.id]: 0.07,
  //endregion

  //region Paladin
  [SPELLS.RELENTLESS_INQUISITOR_TALENT_BUFF.id]: {
    hastePerStack: 0.01,
  },
  [SPELLS.RUSH_OF_LIGHT.id]: 0.05,

  //region Priest
  [TALENTS_PRIEST.POWER_INFUSION_TALENT.id]: 0.2,
  [SPELLS.BORROWED_TIME_BUFF.id]: 0.08,
  //endregion

  //region Mage
  [TALENTS_MAGE.ICY_VEINS_TALENT.id]: 0.3,
  [TALENTS_MAGE.TOME_OF_ANTONIDAS_TALENT.id]: 0.02,
  [SPELLS.FIRE_MASTERY_BUFF.id]: {
    hastePerStack: 0.01,
  },
  [SPELLS.MANA_ADDICTION_BUFF_FIRE.id]: {
    hastePerStack: 0.02,
  },
  [SPELLS.MANA_ADDICTION_BUFF_ARCANE.id]: {
    hastePerStack: 0.03,
  },
  [SPELLS.ARCANE_TEMPO_BUFF.id]: {
    hastePerStack: 0.02,
  },
  //endregion

  //region Monk
  [SPELLS.INVOKERS_DELIGHT_BUFF.id]: 0.33,
  [SPELLS.FURY_OF_XUEN_BUFF.id]: 0.05,
  [SPELLS.SECRET_INFUSION_HASTE_BUFF.id]: 0, // manually set in monk files
  [SPELLS.LESSON_OF_FEAR_BUFF.id]: 0.25,
  //endregion

  //region Shaman
  [SPELLS.ELEMENTAL_BLAST_HASTE.id]: 0.03,
  [TALENTS_SHAMAN.UNLIMITED_POWER_TALENT.id]: {
    hastePerStack: 0.01,
  },
  //endregion

  //region Warlock
  [SPELLS.REVERSE_ENTROPY_BUFF.id]: 0.15,
  //endregion

  //region Encounter
  //Raids
  [SPELLS.ASTRAL_FLARE_BUFF.id]: { hastePerStack: 0.05 }, // Sarkareth
  //endregion

  //region CLASSIC
  // Raids
  [CLASSIC_SPELLS.CORRUPTION_ABSOLUTE.id]: 1, // Cho'gall
  [CLASSIC_SPELLS.ESSENCE_OF_THE_RED.id]: 1, // Sinestra
  // Druid
  [CLASSIC_SPELLS.MOONKIN_AURA.id]: 0.05,
  // Warlock
  [CLASSIC_SPELLS.DARK_INTENT_HASTE.id]: 0.03,
  //endregion
};

const CLASSIC_HASTE_BUFF_OVERRIDES: HasteBuffMap = {
  [SPELLS.BERSERKING.id]: 0.2,
};

class Haste extends Analyzer {
  static dependencies = {
    eventEmitter: EventEmitter,
    statTracker: StatTracker,
  };

  protected statTracker!: StatTracker;
  protected eventEmitter!: EventEmitter;

  private defaultHasteBuffs = DEFAULT_HASTE_BUFFS;

  protected hasteBuffOverrides: HasteBuffMap = {};

  protected getHasteBuff(spellId: number): HasteBuff | number | undefined {
    const override = this.hasteBuffOverrides[spellId];

    if (override !== undefined) {
      return override;
    }

    return this.defaultHasteBuffs[spellId];
  }

  get changehaste() {
    return new EventFilter(EventType.ChangeHaste);
  }

  current: number;

  constructor(options: Options) {
    super(options);

    if (wclGameVersionToBranch(options.owner.report.gameVersion) === GameBranch.Classic) {
      this.defaultHasteBuffs = Object.assign({}, DEFAULT_HASTE_BUFFS, CLASSIC_HASTE_BUFF_OVERRIDES);
    }

    this.current = (options.statTracker as StatTracker).currentHastePercentage;
    debug && console.log(`Haste: Starting haste: ${formatPercentage(this.current)}%`);
    this.eventEmitter = options.eventEmitter as EventEmitter;
    this._triggerChangeHaste(null, null, this.current);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER), this.onApplyBuff);
    this.addEventListener(Events.changebuffstack.to(SELECTED_PLAYER), this.onChangeBuffStack);
    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER), this.onRemoveBuff);
    this.addEventListener(Events.applydebuff.to(SELECTED_PLAYER), this.onApplyDebuff);
    this.addEventListener(Events.changedebuffstack.to(SELECTED_PLAYER), this.onChangeDebuffStack);
    this.addEventListener(Events.removedebuff.to(SELECTED_PLAYER), this.onRemoveDebuff);
    this.addEventListener(Events.ChangeStats.to(SELECTED_PLAYER), this.onChangeStats);
  }

  /**
   * Adds a buff that affects the haste percentage.
   *
   * > HASTE RATING BUFFS ARE HANDLED BY THE STATTRACKER MODULE
   */
  addHasteBuff(
    spellId: number,
    /** Either a haste rating percentage (10% = 0.1), or a {@link HasteBuff} object. */
    haste: number | HasteBuff,
  ): void {
    this.hasteBuffOverrides[spellId] = haste;
  }

  onApplyBuff(event: ApplyBuffEvent) {
    this._applyActiveBuff(event);
  }

  onChangeBuffStack(event: ChangeBuffStackEvent) {
    this._changeBuffStack(event);
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    this._removeActiveBuff(event);
  }

  onApplyDebuff(event: ApplyDebuffEvent) {
    this._applyActiveBuff(event);
  }

  onChangeDebuffStack(event: ChangeDebuffStackEvent) {
    this._changeBuffStack(event);
  }

  onRemoveDebuff(event: RemoveDebuffEvent) {
    this._removeActiveBuff(event);
  }

  onChangeStats(event: ChangeStatsEvent) {
    // fabbed event from StatTracker
    if (!event.delta.haste) {
      return;
    }

    // Calculating the Haste percentage difference form a rating change is hard because all rating (from gear + buffs) is additive while Haste percentage buffs are both multiplicative and additive (see the applyHaste function).
    // 1. Calculate the total Haste percentage without any rating (since the total percentage from the total rating multiplies like any other Haste buff)
    const remainingHasteBuffs = Haste.removeHaste(
      this.current,
      this.statTracker.hastePercentage(event.before.haste, true),
    );
    // 2. Calculate the new total Haste percentage with the new rating and the old total buff percentage
    const newHastePercentage = Haste.addHaste(
      this.statTracker.hastePercentage(event.after.haste, true),
      remainingHasteBuffs,
    );

    this._setHaste(event, newHastePercentage);

    if (debug && 'ability' in event.trigger) {
      const spellName = event.trigger.ability ? event.trigger.ability.name : 'unknown';
      console.log(
        formatMilliseconds(this.owner.fightDuration),
        `Haste: Current haste: ${formatPercentage(this.current!)}% (haste RATING changed by ${
          event.delta.haste
        } from ${spellName})`,
      );
    }
  }

  _applyActiveBuff(event: ApplyBuffEvent | ApplyDebuffEvent) {
    const spellId = event.ability.guid;
    const hasteGain = this._getBaseHasteGain(spellId);

    if (hasteGain) {
      this._applyHasteGain(event, hasteGain);

      debug &&
        console.log(
          formatMilliseconds(this.owner.fightDuration),
          'Haste:',
          'Current haste:',
          `${formatPercentage(this.current!)}%`,
          `(gained ${formatPercentage(hasteGain)}% from ${event.ability.name})`,
        );
    } else {
      debug &&
        console.warn(
          formatMilliseconds(this.owner.fightDuration),
          'Haste: Applied not recognized buff:',
          event.ability.name,
        );
    }
  }

  _removeActiveBuff(event: RemoveBuffEvent | RemoveDebuffEvent) {
    const spellId = event.ability.guid;
    const haste = this._getBaseHasteGain(spellId);

    if (haste) {
      this._applyHasteLoss(event, haste);

      debug &&
        console.log(
          formatMilliseconds(this.owner.fightDuration),
          `Haste: Current haste: ${formatPercentage(this.current!)}% (lost ${formatPercentage(
            haste,
          )}% from ${SPELLS[spellId] ? SPELLS[spellId].name : spellId})`,
        );
    } else {
      debug &&
        console.warn(
          formatMilliseconds(this.owner.fightDuration),
          'Haste: Removed not recognized buff:',
          event.ability.name,
        );
    }
  }

  /**
   * Gets the base Haste gain for the provided spell.
   */
  _getBaseHasteGain(spellId: number) {
    const hasteBuff = this.getHasteBuff(spellId);

    if (typeof hasteBuff === 'number') {
      // A regular number is a static Haste percentage
      return hasteBuff;
    } else if (typeof hasteBuff === 'object') {
      // An object can provide more info
      if (hasteBuff.haste) {
        return this._getHasteValue(hasteBuff.haste, hasteBuff);
      }
    }
    return null;
  }

  _changeBuffStack(event: ChangeBuffStackEvent | ChangeDebuffStackEvent) {
    const spellId = event.ability.guid;
    const haste = this._getHastePerStackGain(spellId);

    if (haste) {
      // Haste stacks are additive, so at 5 stacks with 3% per you'd be at 15%, 6 stacks = 18%. This means the only right way to add a Haste stack is to reset to Haste without the old total and then add the new total Haste again.
      // 1. Calculate the total Haste percentage without the buff
      const baseHaste = Haste.removeHaste(this.current, event.oldStacks * haste);
      // 2. Calculate the new total Haste percentage with the Haste from the new amount of stacks
      const newHastePercentage = Haste.addHaste(baseHaste, event.newStacks * haste);

      this._setHaste(event, newHastePercentage);

      debug &&
        console.log(
          formatMilliseconds(this.owner.fightDuration),
          `Haste: Current haste: ${formatPercentage(this.current!)}% (gained ${formatPercentage(
            haste * event.stacksGained,
          )}% from ${SPELLS[spellId] ? SPELLS[spellId].name : spellId})`,
        );
    }
  }

  _getHastePerStackGain(spellId: number) {
    const hasteBuff = this.getHasteBuff(spellId);

    if (typeof hasteBuff === 'number') {
      // hasteBuff being a number is shorthand for static haste only
    } else if (typeof hasteBuff === 'object') {
      if (hasteBuff.hastePerStack) {
        return this._getHasteValue(hasteBuff.hastePerStack, hasteBuff);
      }
    }
    return null;
  }

  /**
   * Get the actual Haste value from a prop allowing various formats.
   */
  _getHasteValue(
    value: number | ((combatant: Combatant, item?: Item) => number),
    hasteBuff: HasteBuff | number,
  ) {
    if (typeof value === 'function') {
      const selectedCombatant = this.selectedCombatant;
      let itemDetails;
      if (typeof hasteBuff === 'object' && hasteBuff.itemId) {
        const { itemId } = hasteBuff;
        itemDetails = selectedCombatant.getItem(itemId);
        if (!itemDetails) {
          console.error('Failed to retrieve item information for item with ID:', itemId);
        }
      }
      return value(selectedCombatant, itemDetails);
    }
    return value;
  }

  _applyHasteGain(event: AnyEvent, haste: number) {
    this._setHaste(event, Haste.addHaste(this.current, haste));
  }

  _applyHasteLoss(event: AnyEvent, haste: number) {
    this._setHaste(event, Haste.removeHaste(this.current, haste));
  }

  _setHaste(event: AnyEvent, haste: number) {
    if (isNaN(haste)) {
      throw new Error('Attempted to set an invalid Haste value. Something broke.');
    }
    const oldHaste = this.current;
    this.current = haste;

    this._triggerChangeHaste(event, oldHaste, this.current);
  }

  _triggerChangeHaste(event: AnyEvent | null, oldHaste: number | null, newHaste: number) {
    const fabricatedEvent = {
      type: EventType.ChangeHaste,
      sourceID: event ? (event as SourcedEvent<any>).sourceID : this.owner.playerId,
      targetID: this.owner.playerId,
      oldHaste,
      newHaste,
    };
    debug && console.log(EventType.ChangeHaste, fabricatedEvent);
    this.eventEmitter.fabricateEvent(fabricatedEvent, event);
  }

  static addHaste(baseHaste: number, hasteGain: number) {
    return baseHaste * (1 + hasteGain) + hasteGain;
  }

  static removeHaste(baseHaste: number, hasteLoss: number) {
    return (baseHaste - hasteLoss) / (1 + hasteLoss);
  }
}

export default Haste;
