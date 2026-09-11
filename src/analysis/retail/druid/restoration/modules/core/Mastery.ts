import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Entity from 'parser/core/Entity';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, {
  AbsorbedEvent,
  ApplyBuffEvent,
  FightEndEvent,
  HealEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import STAT from 'parser/shared/modules/features/STAT';
import HealingValue from 'parser/shared/modules/HealingValue';
import StatTracker from 'parser/shared/modules/StatTracker';

import { TALENTS_DRUID } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import {
  ABILITIES_AFFECTED_BY_HEALING_INCREASES,
  HARMONIUS_BLOOMING_EXTRA_STACKS,
  MASTERY_STACK_BUFF_IDS,
  masteryHotCountToMult,
  DOUBLE_MASTERY_BENEFIT_IDS,
  hotBuffIdForHeal,
} from 'analysis/retail/druid/restoration/constants';
import { getSourceBloom } from 'analysis/retail/druid/restoration/normalizers/CastLinkNormalizer';

const DEBUG = false;

// TODO - LB extra stack handling is very "special case-y", better way to do it? Mapping of stacks?
/**
 * Resto Druid's "Mastery: Harmony" -
 * Your healing is increased by X% for each of your Restoration heal over time effects on the target.
 *
 * When attempting to attribute healing to a Druid HoT, we must look not only at the direct healing from the HoT
 * but also the amount the Druid's *other spells* are boosted by the presence of that HoT.
 *
 * This module performs the background calculations needed to make these attributions.
 */
class Mastery extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    statTracker: StatTracker,
  };

  protected combatants!: Combatants;
  protected statTracker!: StatTracker;

  totalNoMasteryHealing = 0;
  druidSpellNoMasteryHealing = 0;
  masteryTimesHealing = 0;

  /** Extra healing from Harmonius Blooming's bonus LB stacks (DR-aware). */
  harmoniusBloomingHealing = 0;
  harmoniusBloomingOverheal = 0;
  /** Harmonius Blooming extra-stack healing on Everbloom splash (subset of {@link harmoniusBloomingHealing}). */
  harmoniusBloomingEverbloomSplashHealing = 0;
  harmoniusBloomingEverbloomSplashOverheal = 0;
  /**
   * Mastery stack snapshot at each Lifebloom bloom, keyed by `timestamp:targetID`.
   * Everbloom splash copies the bloom amount (including that mastery) and does not
   * re-apply mastery from HoTs on the splash target — look up this snapshot instead.
   */
  private bloomMasterySnapshots = new Map<string, MasteryStackSnapshot>();
  /** Ally currently bonded by Symbiotic Relationship. */
  private bondedAllyId: number | undefined;
  /**
   * Stacks that scaled the most recent self-heal (for the 10% copy to the bonded ally).
   * Includes 0-stack snapshots so trinket self-heals don't inherit a stale HoT count.
   */
  private lastSelfHealMastery: MasteryStackSnapshot = { hotsOn: [], hotCount: 0 };
  /**
   * Stacks that scaled the most recent heal on the bonded ally (for the 8% copy back to self).
   */
  private lastBondedAllyHealMastery: MasteryStackSnapshot = { hotsOn: [], hotCount: 0 };

  // tracks mastery attribution by spell
  spellAttributions: MasteryAttributionsBySpell = {};

  // Tracks healing attributable to mastery buffs
  buffAttributions: MasteryAttributionsByBuff = {};

  /** Number of extra stacks Lifebloom gives due to the talent */
  extraLbStacks: number;
  /** spellId of Lifebloom (changes based on if Undergrowth is picked) */
  lbBuffId: number;

  constructor(options: Options) {
    super(options);

    this.extraLbStacks = this.selectedCombatant.hasTalent(TALENTS_DRUID.HARMONIOUS_BLOOMING_TALENT)
      ? HARMONIUS_BLOOMING_EXTRA_STACKS
      : 0;
    this.lbBuffId = SPELLS.LIFEBLOOM_BUFF.id;

    // inits spellAttributions with an entry for each HoT that works with Mastery
    MASTERY_STACK_BUFF_IDS.forEach((id) => {
      this.spellAttributions[id] = new MasterySpellAttribution();
    });

    // Player heals + pet heals that benefit from Mastery (e.g. Grove Guardian Wild Growth).
    this.addEventListener(Events.heal.by(SELECTED_PLAYER | SELECTED_PLAYER_PET), this.onHeal);
    this.addEventListener(Events.absorbed.by(SELECTED_PLAYER), this.onAbsorbed);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS_DRUID.SYMBIOTIC_RELATIONSHIP_TALENT),
      this.onSymbioticRelationshipApply,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS_DRUID.SYMBIOTIC_RELATIONSHIP_TALENT),
      this.onSymbioticRelationshipRemove,
    );

    // for outputting final computed values when debug is enabled
    DEBUG && this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onHeal(event: HealEvent): void {
    const spellId = event.ability.guid;
    const attributionSpellId = hotBuffIdForHeal(spellId);
    const target = this.combatants.getEntity(event);
    const healVal = HealingValue.fromEvent(event);

    if (target === null) {
      return;
    }

    if (this.spellAttributions[attributionSpellId]) {
      this.spellAttributions[attributionSpellId].direct += healVal.effective;
    }

    // Copy heals inherit the source heal's mastery and do not double-dip from dest HoTs.
    const replicationSnapshot = this._snapshotForReplicationHeal(event);
    if (replicationSnapshot) {
      this._tallyMasteryAffectedHeal(
        event,
        healVal,
        replicationSnapshot.hotsOn,
        replicationSnapshot.hotCount,
        1,
        attributionSpellId,
      );
      return;
    }
    if (this._isReplicationHeal(spellId)) {
      this.totalNoMasteryHealing += healVal.effective;
      return;
    }

    if (ABILITIES_AFFECTED_BY_HEALING_INCREASES.includes(spellId)) {
      const hotsOn = this.getHotsOn(target);
      const hotCount = this.getHotCount(target);
      const masteryBenefitMult = DOUBLE_MASTERY_BENEFIT_IDS.includes(spellId) ? 2 : 1;

      if (spellId === SPELLS.LIFEBLOOM_BLOOM_HEAL.id) {
        this.bloomMasterySnapshots.set(this._bloomKey(event), { hotsOn, hotCount });
      }

      this._tallyMasteryAffectedHeal(
        event,
        healVal,
        hotsOn,
        hotCount,
        masteryBenefitMult,
        attributionSpellId,
      );
    } else {
      this.totalNoMasteryHealing += healVal.effective;
      this._rememberSourceHealMastery(event, [], 0);
    }
  }

  onAbsorbed(event: AbsorbedEvent): void {
    this.totalNoMasteryHealing += event.amount;
  }

  onFightEnd(_: FightEndEvent): void {
    DEBUG && this.log(`Spell Attributions`, this.spellAttributions);
    DEBUG && this.log(`Buff Attributions`, this.buffAttributions);
  }

  /* accessors for computed values */

  /**
   * Gets the direct healing attributed to the given resto HoT ID.
   * Should be same as number in WCL and includes own mastery stack.
   * @param healId the spell ID of the HoT
   */
  getDirectHealing(healId: number): number {
    return this.spellAttributions[healId].direct;
  }

  /** Mastery healing this HoT granted to *other* spells on the same target. */
  getMasteryHealing(healId: number) {
    return this.spellAttributions[healId].totalMastery;
  }

  getMasteryOverhealing(healId: number) {
    return this.spellAttributions[healId].totalMasteryOverheal;
  }

  getHarmoniusBloomingHealing(): number {
    return this.harmoniusBloomingHealing;
  }

  getHarmoniusBloomingOverhealing(): number {
    return this.harmoniusBloomingOverheal;
  }

  getHarmoniusBloomingEverbloomSplashHealing(): number {
    return this.harmoniusBloomingEverbloomSplashHealing;
  }

  getHarmoniusBloomingEverbloomSplashOverhealing(): number {
    return this.harmoniusBloomingEverbloomSplashOverheal;
  }

  getBondedAllyId(): number | undefined {
    return this.bondedAllyId;
  }

  /*
   * Gets the total healing attributable to the given resto HoT IDs.
   * Counts both direct and by mastery, and avoids the mastery/direct double count issue between the hots.
   */
  getMultiMasteryHealing(healIds: number[]) {
    let total = 0;
    healIds.forEach((healId) => {
      total += Object.entries(this.spellAttributions[healId].mastery)
        .filter((entry) => !healIds.includes(Number(entry[0])))
        .reduce((sum, entry) => sum + entry[1], 0);
      total += this.spellAttributions[healId].direct;
    });
    return total;
  }

  /**
   * Gets the spell attribution object for a HoT with the given ID.
   * @param healId the HoT's ID
   */
  getHealingDetails(healId: number) {
    return this.spellAttributions[healId];
  }

  /**
   * Gets the buff attribution object for a mastery buff with the given ID.
   * @param buffId the buff ID
   */
  getBuffBenefit(buffId: number): MasteryBuffAttribution | undefined {
    return this.buffAttributions[buffId];
  }

  /**
   * This is the average multiple of player's mastery bonus the player's heals benefitted from, weighted by effective healing done.
   * Heals and absorbs that don't benefit from mastery are factored into the weighting.
   * Because as of patch 11.1 mastery stacks have diminishing returns, this will NOT be equivalent to average stacks.
   * For example, if player's mastery is 10% and their calculated weighted average bonus is 17%, this will return 1.7.
   */
  getAverageMasteryBonusMult() {
    return this.masteryTimesHealing / this.totalNoMasteryHealing;
  }

  /**
   * This is the average multiple of player's mastery bonus the player's heals benefitted from, weighted by effective healing done.
   * This ONLY counts heals that actually benefit from mastery.
   * Because as of patch 11.1 mastery stacks have diminishing returns, this will NOT be equivalent to average stacks.
   * For example, if player's mastery is 10% and their calculated weighted average bonus is 17%, this will return 1.7.
   */
  getAverageDruidSpellMasteryBonusMult() {
    return this.masteryTimesHealing / this.druidSpellNoMasteryHealing;
  }

  /**
   * Returns the spell IDs of the Mastery boosting HoTs the Druid currently has on the given Entity target.
   */
  getHotsOn(target: Entity): number[] {
    return target
      .activeBuffs()
      .map((buffObj) => buffObj.ability.guid)
      .filter((buffId) => MASTERY_STACK_BUFF_IDS.includes(buffId));
  }

  /**
   * Returns the number of Mastery boosting HoTs the Druid currently has on the given Entity target.
   */
  getHotCount(target: Entity): number {
    const hotsOn = this.getHotsOn(target);
    const extraStacks = hotsOn.includes(this.lbBuffId) ? this.extraLbStacks : 0;
    return hotsOn.length + extraStacks;
  }

  private _bloomKey(bloom: HealEvent): string {
    return `${bloom.timestamp}:${bloom.targetID}`;
  }

  private _isReplicationHeal(spellId: number): boolean {
    return (
      spellId === SPELLS.EVERBLOOM_SPLASH_HEAL.id ||
      spellId === SPELLS.SYMBIOTIC_RELATIONSHIP_HEAL.id
    );
  }

  private onSymbioticRelationshipApply = (event: ApplyBuffEvent): void => {
    if (event.targetID !== this.selectedCombatant.id) {
      this.bondedAllyId = event.targetID;
    }
  };

  private onSymbioticRelationshipRemove = (event: RemoveBuffEvent): void => {
    if (event.targetID === this.bondedAllyId) {
      this.bondedAllyId = undefined;
    }
  };

  /**
   * Stacks that actually scaled a copy heal. Everbloom splash uses the source bloom;
   * Symbiotic Relationship uses the preceding self-heal (10% to ally) or bonded-ally heal
   * (8% back to self).
   */
  private _snapshotForReplicationHeal(event: HealEvent): MasteryStackSnapshot | undefined {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.EVERBLOOM_SPLASH_HEAL.id) {
      const sourceBloom = getSourceBloom(event);
      if (!sourceBloom) {
        return undefined;
      }
      return this.bloomMasterySnapshots.get(this._bloomKey(sourceBloom));
    }
    if (spellId === SPELLS.SYMBIOTIC_RELATIONSHIP_HEAL.id) {
      if (event.targetID === this.selectedCombatant.id) {
        return this.lastBondedAllyHealMastery;
      }
      this.bondedAllyId = event.targetID;
      return this.lastSelfHealMastery;
    }
    return undefined;
  }

  /** Remember stacks used on this heal so a following Symbiotic Relationship copy can inherit them. */
  private _rememberSourceHealMastery(event: HealEvent, hotsOn: number[], hotCount: number): void {
    if (event.ability.guid === SPELLS.SYMBIOTIC_RELATIONSHIP_HEAL.id) {
      return;
    }
    const snapshot = { hotsOn, hotCount };
    if (event.targetID === this.selectedCombatant.id) {
      this.lastSelfHealMastery = snapshot;
    } else if (this._isBondedAllyTarget(event.targetID)) {
      this.bondedAllyId = event.targetID;
      this.lastBondedAllyHealMastery = snapshot;
    }
  }

  private _isBondedAllyTarget(targetId: number): boolean {
    if (this.bondedAllyId === targetId) {
      return true;
    }
    const ally = this.combatants.getEntities()[targetId];
    return (
      ally?.hasBuff(
        TALENTS_DRUID.SYMBIOTIC_RELATIONSHIP_TALENT.id,
        null,
        0,
        0,
        this.selectedCombatant.id,
      ) ?? false
    );
  }

  /**
   * Shared attribution path for heals that benefit from Mastery.
   * `hotsOn` / `hotCount` must already reflect the stacks that actually scaled the heal
   * (the healed target for normal spells, the Lifebloom target for Everbloom splash).
   */
  private _tallyMasteryAffectedHeal(
    event: HealEvent,
    healVal: HealingValue,
    hotsOn: number[],
    hotCount: number,
    masteryBenefitMult: number,
    attributionSpellId: number,
  ): void {
    const decomposedHeal = this._decompHeal(healVal, hotCount, masteryBenefitMult);

    if (DEBUG) {
      let logPrefix = 'ALL-EFFECTIVE';
      if (healVal.effective === 0) {
        logPrefix = 'ALL-OVERHEAL';
      } else if (healVal.overheal > 0) {
        logPrefix = 'PARTIAL-EFFECTIVE';
      }
      console.log(
        `${logPrefix} - ${event.ability.name}: ${healVal.effective.toFixed(
          0,
        )} (O: ${healVal.overheal.toFixed(
          0,
        )}) // Mastery: ${this.statTracker.currentMasteryPercentage.toFixed(
          2,
        )} Hots: ${hotCount} EffMult: ${decomposedHeal.effectiveStackMult}`,
      );
    }

    this.totalNoMasteryHealing += decomposedHeal.noMastery;
    this.druidSpellNoMasteryHealing += decomposedHeal.noMastery;
    this.masteryTimesHealing += decomposedHeal.noMastery * decomposedHeal.effectiveStackMult;

    if (this.extraLbStacks > 0 && hotsOn.includes(this.lbBuffId)) {
      this._tallyHarmoniusBlooming(healVal, hotCount, masteryBenefitMult, event);
    }

    hotsOn
      .filter((hotOn) => hotOn !== attributionSpellId)
      .forEach((hotOn) =>
        this._tallyMasteryBenefit(
          hotOn,
          event.ability.guid,
          decomposedHeal.oneStack,
          decomposedHeal.oneStackOverheal,
        ),
      );

    this.selectedCombatant
      .activeBuffs()
      .filter(
        (buff) =>
          this.statTracker.statBuffs[buff.ability.guid] &&
          this.statTracker.statBuffs[buff.ability.guid].mastery,
      )
      .forEach((buff) => {
        const buffId = buff.ability.guid;
        const statBuff = this.statTracker.statBuffs[buffId];
        if (!this.buffAttributions[buffId]) {
          this.buffAttributions[buffId] = new MasteryBuffAttribution(
            this.statTracker.getBuffValue(statBuff, statBuff.mastery),
          );
        }

        this.buffAttributions[buffId].attributable += calculateEffectiveHealing(
          event,
          decomposedHeal.relativeBuffBenefit(
            this.buffAttributions[buffId].buffAmount * buff.stacks,
          ),
        );
      });

    this._rememberSourceHealMastery(event, hotsOn, hotCount);
  }

  /**
   * Tallies a heal with spellAttributions
   * @param hotId the ID of the HoT on the healed target
   * @param healId the ID of the heal being boosted
   * @param amount the amount of the boost
   * @param overhealAmount the overheal attributable to one stack of this HoT
   */
  _tallyMasteryBenefit(
    hotId: number,
    healId: number,
    amount: number,
    overhealAmount: number,
  ): void {
    const attribution = this.spellAttributions[hotId];
    const stackMult = hotId === this.lbBuffId ? 1 + this.extraLbStacks : 1;
    const adjustedAmount = amount * stackMult;
    const adjustedOverheal = overhealAmount * stackMult;

    if (attribution.mastery[healId]) {
      attribution.mastery[healId] += adjustedAmount;
    } else {
      attribution.mastery[healId] = adjustedAmount;
    }

    if (attribution.masteryOverheal[healId]) {
      attribution.masteryOverheal[healId] += adjustedOverheal;
    } else {
      attribution.masteryOverheal[healId] = adjustedOverheal;
    }
  }

  decomposeHeal(event: HealEvent): DecomposedHeal | null {
    const healVal = HealingValue.fromEvent(event);
    const replicationSnapshot = this._snapshotForReplicationHeal(event);
    if (replicationSnapshot) {
      return this._decompHeal(healVal, replicationSnapshot.hotCount);
    }
    if (this._isReplicationHeal(event.ability.guid)) {
      return this._decompHeal(healVal, 0);
    }
    const target = this.combatants.getEntity(event);
    if (target === null) {
      return null;
    }
    const masteryBenefitMult = DOUBLE_MASTERY_BENEFIT_IDS.includes(event.ability.guid) ? 2 : 1;
    return this._decompHeal(healVal, this.getHotCount(target), masteryBenefitMult);
  }

  /**
   * Extra stacks are the marginal (highest) ones, so overheal comes off them first.
   * Credits (mult(n) - mult(n - extraLbStacks)) * masteryPct * rawNoMastery.
   */
  _tallyHarmoniusBlooming(
    healVal: HealingValue,
    hotCount: number,
    masteryBenefitMult: number,
    event: HealEvent,
  ): void {
    const masteryBonus = this.statTracker.currentMasteryPercentage;
    const multWith = masteryHotCountToMult(hotCount);
    const multWithout = masteryHotCountToMult(hotCount - this.extraLbStacks);
    const healMasteryMultWith = 1 + multWith * masteryBonus * masteryBenefitMult;
    const healMasteryMultWithout = 1 + multWithout * masteryBonus * masteryBenefitMult;
    const rawNoMasteryHealing = healVal.raw / healMasteryMultWith;

    const extraStacksRaw =
      rawNoMasteryHealing * (multWith - multWithout) * masteryBonus * masteryBenefitMult;
    const rawWithout = rawNoMasteryHealing * healMasteryMultWithout;
    const extraStacksEffective = Math.max(
      0,
      Math.min(extraStacksRaw, healVal.effective - rawWithout),
    );
    const extraStacksOverheal = extraStacksRaw - extraStacksEffective;

    this.harmoniusBloomingHealing += extraStacksEffective;
    this.harmoniusBloomingOverheal += extraStacksOverheal;

    if (event.ability.guid === SPELLS.EVERBLOOM_SPLASH_HEAL.id) {
      this.harmoniusBloomingEverbloomSplashHealing += extraStacksEffective;
      this.harmoniusBloomingEverbloomSplashOverheal += extraStacksOverheal;
    }
  }

  /**
   * Decomposes a heal's amount to show the amounts attributable to mastery
   * @param masteryBenefitMult extra multiplier on the mastery bonus (2 for GG Nourish). DR table still uses hotCount.
   */
  _decompHeal(healVal: HealingValue, hotCount: number, masteryBenefitMult = 1): DecomposedHeal {
    // mastery diminishing returns with more HoTs on - do the table lookup and get overall bonus
    const hotMult = masteryHotCountToMult(hotCount);
    const masteryBonus = this.statTracker.currentMasteryPercentage;
    const healBonus = hotMult * masteryBonus * masteryBenefitMult;
    const healMasteryMult = 1 + healBonus;
    // the raw healing this spell would have done if it benefitted from zero mastery stacks
    const rawNoMasteryHealing = healVal.raw / healMasteryMult;
    // effective healing spell would have done if it benefitted from zero mastery stacks
    const noMasteryHealing = Math.min(rawNoMasteryHealing, healVal.effective);

    // because Mastery is a bonus on top of the base healing, all overhealing is counted against Mastery
    const effectiveMasteryHealing = healVal.effective - noMasteryHealing;
    const rawMasteryHealing = healVal.raw - rawNoMasteryHealing;
    const masteryOverheal = Math.max(0, rawMasteryHealing - effectiveMasteryHealing);
    // when Mastery bonus is partially but not completely overhealing, the stacks equally share attribution
    const oneStackMasteryHealingEffective = hotCount > 0 ? effectiveMasteryHealing / hotCount : 0;
    const oneStackMasteryOverheal = hotCount > 0 ? masteryOverheal / hotCount : 0;

    const oneStackMasteryHealingRaw = rawNoMasteryHealing * masteryBonus;
    // the multiplier of mastery that we actually benefitted from once overheal is considered.
    const effectiveStackMult =
      oneStackMasteryHealingRaw > 0 ? effectiveMasteryHealing / oneStackMasteryHealingRaw : 0;

    const relativeBuffBenefit = (buffRating: number) => {
      const buffBonus =
        (hotCount * buffRating * masteryBenefitMult) /
        this.statTracker.ratingNeededForNextPercentage(
          this.statTracker.currentMasteryRating,
          this.statTracker.statBaselineRatingPerPercent[STAT.MASTERY],
          this.selectedCombatant.spec?.masteryCoefficient,
        );
      return buffBonus / healMasteryMult;
    };

    return {
      noMastery: noMasteryHealing,
      oneStack: oneStackMasteryHealingEffective,
      oneStackOverheal: oneStackMasteryOverheal,
      effectiveStackMult,
      relativeBuffBenefit,
    };
  }
}

/**
 * Mastery stacks that actually scaled a heal (and any copy heals that inherit it).
 */
interface MasteryStackSnapshot {
  hotsOn: number[];
  hotCount: number;
}

/**
 * A mapping from spell guid to the MasteryAttribution for that spell
 */
type MasteryAttributionsBySpell = Record<number, MasterySpellAttribution>;

/**
 * A HoT's mastery attribution.
 */
class MasterySpellAttribution {
  direct: number; // the direct healing from the HoT, should be same as entry in WCL. Includes benefit from own stack of Mastery.
  mastery: Record<number, number>; // a mapping from spell ID to how much this HoT boosted it via Mastery.
  masteryOverheal: Record<number, number>; // parallel to mastery, overheal from the Mastery boost.

  constructor() {
    this.direct = 0;
    this.mastery = {};
    this.masteryOverheal = {};
  }

  get totalMastery(): number {
    return Object.values(this.mastery).reduce((s, v) => s + v, 0);
  }

  get totalMasteryOverheal(): number {
    return Object.values(this.masteryOverheal).reduce((s, v) => s + v, 0);
  }

  get total(): number {
    return this.direct + this.totalMastery;
  }
}

/**
 * A mapping from buff guid to the attribution amount for that buff
 */
type MasteryAttributionsByBuff = Record<number, MasteryBuffAttribution>;

/**
 * A Buff's mastery attribution.
 */
class MasteryBuffAttribution {
  attributable: number; // the amount of healing attributable to the buff
  buffAmount: number; // the amount of mastery rating the buff provides

  constructor(buffAmount: number) {
    this.attributable = 0;
    this.buffAmount = buffAmount;
  }
}

/**
 * A instance of healing that has been decomposed into parts based on Mastery attribution
 */
interface DecomposedHeal {
  /** The amount of effective healing that would have been done before being boosted by mastery */
  noMastery: number;
  /** The amount of effective heal added per stack of mastery */
  oneStack: number;
  /** The amount of overheal attributable per stack of mastery */
  oneStackOverheal: number;
  /** Multiplier of our mastery that we actually benefitted from once overheal is considered */
  effectiveStackMult: number;
  /** Function from mastery buff rating to heal attributable to that buff */
  relativeBuffBenefit: (rating: number) => number;
}

export default Mastery;
