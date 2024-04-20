import { Trans } from '@lingui/macro';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import HIT_TYPES from 'game/HIT_TYPES';
import { Tooltip, TooltipElement } from 'interface';
import InformationIcon from 'interface/icons/Information';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, {
  AbsorbedEvent,
  DamageEvent,
  EventType,
  HealEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import DamageValue from 'parser/shared/modules/DamageValue';
import HealingValue from 'parser/shared/modules/HealingValue';
import CritEffectBonus from 'parser/shared/modules/helpers/CritEffectBonus';
import StatTracker from 'parser/shared/modules/StatTracker';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import StatisticGroup from 'parser/ui/StatisticGroup';

import QELiveLogo from './images/QE-Logo-New-Small.png';
import CORE_SPELL_INFO from './SpellInfo';
import STAT, { getClassNameColor, getIcon, getName, getNameTranslated } from './STAT';

const DEBUG = false;

/**
 * This is currently completely focussed on Healer stat weights but it should be relatively easy to modify it to work for a DPS, it just requires some work. The only reason no effort was put towards this is that we currently have no DPS interested in implementing this so it would be wasted time. If you do want to implement stat weights for a DPS this should provide you with a very good basis.
 * @property {CritEffectBonus} critEffectBonus
 * @property {StatTracker} statTracker
 */
abstract class BaseHealerStatValues extends Analyzer {
  static dependencies = {
    critEffectBonus: CritEffectBonus,
    statTracker: StatTracker,
  };

  protected critEffectBonus!: CritEffectBonus;
  protected statTracker!: StatTracker;

  /**
   * QE Live Link Setter
   * As of right now this is only enabled for MW, Resto Druid, and Holy Pally
   * Unless you talk to Voulk, the creator of QElive, Do not flip the switch for other healers
   */
  qeLive = false;

  // region Spell info

  // We assume unlisted spells scale with vers only (this will mostly be trinkets)
  fallbackSpellInfo: HealerSpellInfo = {
    int: false,
    crit: true,
    hasteHpm: false,
    hasteHpct: false,
    mastery: false,
    vers: true,
  };
  // This will contain shared settings for things like trinkets and Leech
  sharedSpellInfo: { [key: string]: HealerSpellInfo } = CORE_SPELL_INFO;
  // This is for spec specific implementations to override. It gets priority over defaultSpellInfo.
  spellInfo: ListOfHealerSpellInfo = {};

  mentioned: number[] = [];
  _getSpellInfo(event: HealerStatWeightEvents): HealerSpellInfo {
    const spellId = event.ability.guid;

    const specSpecific = this.spellInfo[spellId];
    if (specSpecific) {
      return specSpecific;
    }
    const shared = this.sharedSpellInfo[spellId];
    if (shared) {
      return shared;
    }

    if (import.meta.env.DEV) {
      if (!this.mentioned.includes(spellId)) {
        console.warn(
          `Missing spell definition: ${spellId}: ${event.ability.name}, using fallback:`,
          this.fallbackSpellInfo,
        );
        this.mentioned.push(spellId);
      }
    }

    return this.fallbackSpellInfo;
  }

  // endregion

  totalAdjustedHealing = 0; // total healing after excluding 'multiplier' spells like Leech / Velens

  // These are the total healing that would be gained if their respective stats ratings were increased by one.
  totalOneInt = 0;
  totalOneCrit = 0;
  totalOneHasteHpct = 0;
  totalOneHasteHpm = 0;
  totalOneMastery = 0;
  totalOneVers = 0; // from healing increase only
  totalOneVersDr = 0; // from damage reduced only
  totalOneLeech = 0;

  playerHealthMissing = 0;

  scaleWeightsWithHealth = false;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER_PET), this.onHeal);
    this.addEventListener(Events.absorbed.by(SELECTED_PLAYER), this.onAbsorb);
    this.addEventListener(Events.absorbed.by(SELECTED_PLAYER_PET), this.onAbsorb);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER), this.onRemoveBuff);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER_PET), this.onRemoveBuff);
    this.addEventListener(Events.heal.to(SELECTED_PLAYER), this.onHealTaken);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onHeal(event: HealEvent) {
    const healVal = new HealingValue(event.amount, event.absorbed, event.overheal);
    this._handleHealEvent(event, healVal);
  }
  onAbsorb(event: AbsorbedEvent) {
    const healVal = new HealingValue(event.amount, 0, 0);
    this._handleHealEvent(event, healVal);
  }
  onRemoveBuff(event: RemoveBuffEvent) {
    if (event.absorb) {
      const healVal = new HealingValue(0, 0, event.absorb);
      this._handleHealEvent(event, healVal);
    }
  }
  _handleHealEvent(event: HealerStatWeightEvents, healVal: HealingValue) {
    const spellInfo = this._getSpellInfo(event);
    //an Absorbed event doesn't have hitPoints nor MaxHitPoints meaning this would go to NaN / NaN = NaN
    let targetHealthPercentage = NaN;
    if ('hitPoints' in event) {
      targetHealthPercentage = (event.hitPoints - healVal.effective) / event.maxHitPoints;
    }
    // hitPoints contains HP *after* the heal
    this._handleHeal(spellInfo, event, healVal, targetHealthPercentage);
  }
  /**
   * This actually does that stat weights calculations.
   * @param spellInfo An object containing information about how to treat the spell, like on what stats it scales.
   * @param eventForWeights The event that uses the stats to scale its healing. If we're tracking a multiplier (like Beacons), this should be the source of the multiplier.
   * @param {HealingValue} healVal The actual healing done, all child weight calculators should use this instead of the event data as that might be for another event.
   * @param targetHealthPercentage The percentage of health the target has remaining BEFORE the heal.
   * @private
   */
  _handleHeal(
    spellInfo: HealerSpellInfo,
    eventForWeights: HealerStatWeightEvents,
    healVal: HealingValue,
    targetHealthPercentage: number,
  ) {
    // Most spells are counted in healing total, but some spells scale not on their own but 'second hand' from other spells
    // I adjust them out of total healing to preserve some accuracy in the "Rating per 1%" stat.
    // Good examples of multiplier spells are Leech and Velens.
    if (!spellInfo.multiplier) {
      this.totalAdjustedHealing += this._adjustGain(healVal.effective, targetHealthPercentage);
    }

    if (spellInfo.ignored) {
      return;
    }

    this.totalOneLeech += this._adjustGain(
      this._leech(eventForWeights, healVal, spellInfo),
      targetHealthPercentage,
    );

    if (spellInfo.multiplier) {
      // Multiplier spells aren't counted for weights because they don't **directly** benefit from stat weights
      return;
    }

    if (spellInfo.int) {
      this.totalOneInt += this._adjustGain(
        this._intellect(eventForWeights, healVal),
        targetHealthPercentage,
      );
    }
    if (spellInfo.crit) {
      this.totalOneCrit += this._adjustGain(
        this._criticalStrike(eventForWeights, healVal),
        targetHealthPercentage,
      );
    }
    if (spellInfo.hasteHpct) {
      this.totalOneHasteHpct += this._adjustGain(
        this._hasteHpct(eventForWeights, healVal),
        targetHealthPercentage,
      );
    }
    if (spellInfo.hasteHpm) {
      this.totalOneHasteHpm += this._adjustGain(
        this._hasteHpm(eventForWeights, healVal),
        targetHealthPercentage,
      );
    }
    if (spellInfo.mastery) {
      this.totalOneMastery += this._adjustGain(
        this._mastery(eventForWeights, healVal),
        targetHealthPercentage,
      );
    }
    if (spellInfo.vers) {
      this.totalOneVers += this._adjustGain(
        this._versatility(eventForWeights, healVal),
        targetHealthPercentage,
      );
    }
  }
  _adjustGain(gain: number, targetHealthPercentage: number) {
    if (gain === 0) {
      return 0;
    }
    // We want 0-20% health to get value gain, and then linearly decay to 100% health
    const maxValueHealthPercentage = 0.3;
    const mult =
      1 -
      Math.max(
        0,
        (targetHealthPercentage - maxValueHealthPercentage) / (1 - maxValueHealthPercentage),
      );
    return this.scaleWeightsWithHealth ? gain * mult : gain;
  }
  _leech(event: HealerStatWeightEvents, healVal: HealingValue, spellInfo: HealerSpellInfo) {
    if (event.type !== EventType.Heal) {
      return 0; // leech doesn't proc from absorbs
    }

    // We have to calculate leech weight differently depending on if we already have any leech rating.
    // Leech is marked as a 'multplier' heal, so we have to check it before we do the early return below
    const hasLeech = this.statTracker.currentLeechPercentage > 0;
    if (hasLeech) {
      return this._leechHasLeech(event, healVal);
    } else {
      return this._leechPrediction(event, healVal, spellInfo);
    }
  }
  _leechHasLeech(event: HealerStatWeightEvents, healVal: HealingValue) {
    // When the user has Leech we can use the actual Leech healing to accuractely calculate its HPS value without having to do any kind of predicting
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.LEECH.id) {
      return 0;
    }
    if (!healVal.overheal) {
      return healVal.effective / this.statTracker.currentLeechRating; // TODO: Make a generic method to account for base percentage
    }
    return 0;
  }
  _leechPrediction(
    event: HealerStatWeightEvents,
    healVal: HealingValue,
    spellInfo: HealerSpellInfo,
  ) {
    // Without Leech we will have to make an estimation so we can still provide the user with a decent value
    if (this.owner.toPlayer(event)) {
      return 0; // Leech doesn't proc from self-healing
    }
    if (spellInfo.multiplier) {
      return 0; // Leech doesn't proc from multipliers such as Velen's Future Sight
    }
    if (this.playerHealthMissing > 0) {
      // if the player is full HP this would have overhealed.
      const healIncreaseFromOneLeech =
        this.statTracker.playerMultipliers.leech /
        this.statTracker.ratingNeededForNextPercentage(
          this.statTracker.currentLeechRating,
          this.statTracker.statBaselineRatingPerPercent[STAT.LEECH],
          1,
          false,
        );
      return healVal.raw * healIncreaseFromOneLeech;
    }
    return 0;
  }
  _intellect(event: HealerStatWeightEvents, healVal: HealingValue) {
    if (healVal.overheal) {
      // If a spell overheals, it could not have healed for more. Seeing as Int only adds HP on top of the existing heal we can skip it as increasing the power of this heal would only be more overhealing.
      return 0;
    }
    const healIncreaseFromOneInt =
      this.statTracker.playerMultipliers.intellect / this.statTracker.currentIntellectRating;
    return healVal.effective * healIncreaseFromOneInt;
  }
  _getCritChance(event: HealerStatWeightEvents) {
    const rating = this.statTracker.currentCritRating;
    const baseCritChance = this.statTracker.baseCritPercentage;
    const ratingCritChance =
      rating /
      this.statTracker.ratingNeededForNextPercentage(
        this.statTracker.currentCritRating,
        this.statTracker.statBaselineRatingPerPercent[STAT.CRITICAL_STRIKE],
      );

    return { baseCritChance, ratingCritChance };
  }
  _isCrit(event: HealerStatWeightEvents) {
    return 'hitType' in event ? event.hitType === HIT_TYPES.CRIT : false;
  }
  _criticalStrike(event: HealerStatWeightEvents, healVal: HealingValue) {
    if (this._isCrit(event)) {
      // This collects the total effective healing contributed by the last 1 point of critical strike rating.
      // We don't make any predictions on normal hits based on crit chance since this would be guess work and we are a log analysis system so we prefer to only work with facts. Actual crit heals are undeniable facts, unlike speculating the chance a normal hit might have crit (and accounting for the potential overhealing of that).

      const { baseCritChance, ratingCritChance } = this._getCritChance(event);

      const totalCritChance = baseCritChance + ratingCritChance;
      if (
        totalCritChance >
        1 +
          1 /
            this.statTracker.ratingNeededForNextPercentage(
              this.statTracker.currentCritRating,
              this.statTracker.statBaselineRatingPerPercent[STAT.CRITICAL_STRIKE],
            )
      ) {
        // If the crit chance was more than 100%+1 rating, then the last rating was over the cap and worth 0.
        return 0;
      }
      const ratingCritChanceContribution = 1 - baseCritChance / totalCritChance;

      const critMult = this.critEffectBonus.getBonus(event);
      const rawBaseHealing = healVal.raw / critMult;
      const effectiveCritHealing = Math.max(0, healVal.effective - rawBaseHealing);
      const rating = this.statTracker.currentCritRating;
      const healIncreaseFromOneCrit =
        (this.statTracker.playerMultipliers.crit * ratingCritChanceContribution) / rating;

      return effectiveCritHealing * healIncreaseFromOneCrit;
    }
    return 0;
  }
  _hasteHpct(event: HealerStatWeightEvents, healVal: HealingValue) {
    const currHastePerc = this.statTracker.currentHastePercentage;
    const healIncreaseFromOneHaste =
      this.statTracker.playerMultipliers.haste /
      this.statTracker.ratingNeededForNextPercentage(
        this.statTracker.currentHasteRating,
        this.statTracker.statBaselineRatingPerPercent[STAT.HASTE],
      );
    const baseHeal = healVal.effective / (1 + currHastePerc);
    return baseHeal * healIncreaseFromOneHaste;
  }
  _hasteHpm(event: HealerStatWeightEvents, healVal: HealingValue) {
    const healIncreaseFromOneHaste =
      this.statTracker.playerMultipliers.haste /
      this.statTracker.ratingNeededForNextPercentage(
        this.statTracker.currentHasteRating,
        this.statTracker.statBaselineRatingPerPercent[STAT.HASTE],
      );
    const noHasteHealing = healVal.effective / (1 + this.statTracker.currentHastePercentage);
    return noHasteHealing * healIncreaseFromOneHaste;
  }
  _mastery(event: HealerStatWeightEvents, healVal: HealingValue): number {
    throw new Error('Missing custom Mastery implementation. This is different per spec.');
  }
  _versatility(event: HealerStatWeightEvents, healVal: HealingValue) {
    if (healVal.overheal) {
      // If a spell overheals, it could not have healed for more. Seeing as Versatility only adds HP on top of the existing heal we can skip it as increasing the power of this heal would only be more overhealing.
      return 0;
    }
    const currVersPerc = this.statTracker.currentVersatilityPercentage;
    const healIncreaseFromOneVers =
      this.statTracker.playerMultipliers.versatility /
      this.statTracker.ratingNeededForNextPercentage(
        this.statTracker.currentVersatilityRating,
        this.statTracker.statBaselineRatingPerPercent[STAT.VERSATILITY],
        1,
        false,
      );
    const baseHeal = healVal.effective / (1 + currVersPerc);
    return baseHeal * healIncreaseFromOneVers;
  }

  onDamageTaken(event: DamageEvent) {
    this._updateMissingHealth(event);

    const damageVal = new DamageValue(event.amount, event.absorbed, event.blocked, event.overkill);
    // const targetHealthPercentage = event.hitPoints / event.maxHitPoints; // hitPoints contains HP *after* the damage taken, which in this case is desirable
    // this.totalOneVersDr += this._adjustGain(this._versatilityDamageReduction(event, damageVal), targetHealthPercentage);
    // TODO: Figure out how to make this account for target health since damage event don't appear to have hitPoints info
    this.totalOneVersDr += this._versatilityDamageReduction(event, damageVal);
  }
  _versatilityDamageReduction(event: DamageEvent, damageVal: DamageValue) {
    const amount = damageVal.effective;
    const currentVersDamageReductionPercentage = this.statTracker.currentVersatilityPercentage / 2;
    const damageReductionIncreaseFromOneVers =
      this.statTracker.playerMultipliers.versatility /
      this.statTracker.ratingNeededForNextPercentage(
        this.statTracker.currentVersatilityRating,
        this.statTracker.statBaselineRatingPerPercent[STAT.VERSATILITY],
        1,
        false,
      ) /
      2; // the DR part is only 50% of the Versa percentage

    const noVersDamage = amount / (1 - currentVersDamageReductionPercentage);
    return noVersDamage * damageReductionIncreaseFromOneVers;
  }

  onHealTaken(event: HealEvent) {
    this._updateMissingHealth(event);
  }
  _updateMissingHealth(event: HealEvent | DamageEvent) {
    if (event.hitPoints && event.maxHitPoints) {
      // fields not always populated, don't know why
      // `maxHitPoints` is always the value *after* the effect applied
      this.playerHealthMissing = event.maxHitPoints - event.hitPoints;
    }
  }

  onFightEnd() {
    if (DEBUG) {
      console.log('total', formatNumber(this.totalAdjustedHealing));
      console.log(`Int - ${formatNumber(this.totalOneInt)}`);
      console.log(`Crit - ${formatNumber(this.totalOneCrit)}`);
      console.log(`Haste HPCT - ${formatNumber(this.totalOneHasteHpct)}`);
      console.log(`Haste HPM - ${formatNumber(this.totalOneHasteHpm)}`);
      console.log(`Mastery - ${formatNumber(this.totalOneMastery)}`);
      console.log(`Vers - ${formatNumber(this.totalOneVers)}`);
      console.log(`Leech - ${formatNumber(this.totalOneLeech)}`);
    }
  }

  get hpsPerIntellect() {
    return (this._getGain(STAT.INTELLECT) / this.owner.fightDuration) * 1000;
  }
  get hpsPerCriticalStrike() {
    return (this._getGain(STAT.CRITICAL_STRIKE) / this.owner.fightDuration) * 1000;
  }
  get hpsPerHasteHPCT() {
    return (this._getGain(STAT.HASTE_HPCT) / this.owner.fightDuration) * 1000;
  }
  get hpsPerHasteHPM() {
    return (this._getGain(STAT.HASTE_HPM) / this.owner.fightDuration) * 1000;
  }
  get hpsPerHaste() {
    return this.hpsPerHasteHPCT + this.hpsPerHasteHPM;
  }
  get hpsPerMastery() {
    return (this._getGain(STAT.MASTERY) / this.owner.fightDuration) * 1000;
  }
  get hpsPerVersatility() {
    return (this._getGain(STAT.VERSATILITY) / this.owner.fightDuration) * 1000;
  }
  get hpsPerVersatilityDR() {
    return (this._getGain(STAT.VERSATILITY_DR) / this.owner.fightDuration) * 1000;
  }
  get hpsPerLeech() {
    return (this._getGain(STAT.LEECH) / this.owner.fightDuration) * 1000;
  }

  // region statistic
  _ratingPerOnePercent(oneRatingHealing: number) {
    const onePercentHealing = this.totalAdjustedHealing / 100;
    return onePercentHealing / oneRatingHealing;
  }
  _getGain(stat: string) {
    switch (stat) {
      case STAT.INTELLECT:
        return this.totalOneInt;
      case STAT.CRITICAL_STRIKE:
        return this.totalOneCrit;
      case STAT.HASTE_HPCT:
        return this.totalOneHasteHpct;
      case STAT.HASTE_HPM:
        return this.totalOneHasteHpm;
      case STAT.MASTERY:
        return this.totalOneMastery;
      case STAT.VERSATILITY:
        return this.totalOneVers;
      case STAT.VERSATILITY_DR:
        return this.totalOneVers + this.totalOneVersDr;
      case STAT.LEECH:
        return this.totalOneLeech;
      default:
        return 0;
    }
  }
  _getTooltip(stat: string) {
    switch (stat) {
      case STAT.HASTE_HPCT:
        return (
          <Trans id="shared.healerStatValues.stats.hpct">
            HPCT stands for "Healing per Cast Time". This is the value that Haste would be worth if
            you would cast everything you are already casting (and that scales with Haste) faster.
            Mana is not accounted for in any way and you should consider the Haste stat weight 0 if
            you run out of mana while doing everything else right.
          </Trans>
        );
      case STAT.HASTE_HPM:
        return (
          <Trans id="shared.healerStatValues.stats.hpm">
            HPM stands for "Healing per Mana". In valuing Haste, it considers only the faster HoT
            ticking and not the reduced cast times. Effectively it models haste's bonus to mana
            efficiency. This is typically the better calculation to use for raid encounters where
            mana is an issue.
          </Trans>
        );
      case STAT.VERSATILITY_DR:
        return (
          <Trans id="shared.healerStatValues.stats.versDR">
            Weight includes both healing boost and damage reduction, counting the damage reduced as
            additional throughput.
          </Trans>
        );
      default:
        return null;
    }
  }

  abstract _prepareResults(): Array<STAT | StatMessage>;

  static position = STATISTIC_ORDER.CORE(9);
  statistic() {
    const results = this._prepareResults();
    const qeLink = results
      .reduce((urlParts: string[], stat: StatMessage | STAT) => {
        if (stat === STAT.INTELLECT || stat === STAT.VERSATILITY_DR) {
          return urlParts;
        }

        const statValue = typeof stat === 'object' ? stat.stat : stat;
        const gain = this._getGain(statValue);
        const weight = gain / (this.totalOneInt || 1);
        const gottenName = getName(statValue);
        const statName = gottenName === null ? '' : gottenName.replace(/[()\s+]/g, '');

        urlParts.push(statName + '=' + weight.toFixed(2));
        return urlParts;
      }, [])
      .join('&');
    return (
      <StatisticGroup position={BaseHealerStatValues.position}>
        <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
          <div className="panel items statistic">
            <div className="panel-body" style={{ padding: '10px 0 16px' }}>
              <table className="data-table compact" style={{ margin: 0 }}>
                <thead>
                  <tr className="text-muted">
                    <th style={{ minWidth: 30, fontWeight: 400 }}>
                      <TooltipElement
                        content={
                          <Trans id="shared.healerStatValues.statistic.title.tooltip">
                            These stat values are calculated using the actual circumstances of this
                            encounter. These values reveal the value of the last 1 rating of each
                            stat, they may not necessarily be the best way to gear. The stat values
                            are likely to differ based on fight, raid size, items used, talents
                            chosen, etc.
                            <br />
                            <br />
                            DPS gains are not included in any of the stat values.
                          </Trans>
                        }
                      >
                        <Trans id="shared.healerStatValues.statistic.title">Stat Values</Trans>
                      </TooltipElement>
                      {this.qeLive && this.selectedCombatant.characterProfile && (
                        <Tooltip content="Opens in a new tab. Leverage the QE Live Tool to directly compare gear and trinkets based on your stat values.">
                          <a
                            href={`https://www.questionablyepic.com/live?import=WoWA&spec=${this.selectedCombatant.specId}&pname=${this.selectedCombatant.name}&realm=${this.selectedCombatant.characterProfile.realm}&region=${this.selectedCombatant.characterProfile.region}&${qeLink}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Trans id="shared.healerStatValues.statistic.qeLink">
                              <img
                                src={QELiveLogo}
                                alt="Questionably Epic Live"
                                style={{ height: '1.2em', marginLeft: 15 }}
                              />{' '}
                              Open Questionably Epic Live
                            </Trans>
                          </a>
                        </Tooltip>
                      )}
                    </th>
                    <th
                      className="text-right"
                      style={{ minWidth: 30, fontWeight: 400 }}
                      colSpan={2}
                    >
                      <TooltipElement
                        content={
                          <Trans id="shared.healerStatValues.statistic.title.value.tooltip">
                            Normalized so Intellect is always 1.00.
                          </Trans>
                        }
                      >
                        <Trans id="shared.healerStatValues.statistic.title.value">Value</Trans>
                      </TooltipElement>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((row) => {
                    const stat = typeof row === 'object' ? row.stat : row;
                    const tooltip = typeof row === 'object' ? row.tooltip : this._getTooltip(stat);
                    const gain = this._getGain(stat);
                    const weight = gain / (this.totalOneInt || 1);
                    const ratingForOne = this._ratingPerOnePercent(gain);

                    const Icon = getIcon(stat);

                    const className = getClassNameColor(stat);
                    const classNameCorrected = className ? className : undefined;

                    const gainPerSecond = ((gain / this.owner.fightDuration) * 1000).toFixed(2);
                    const rating =
                      gain !== null
                        ? ratingForOne === Infinity
                          ? '∞'
                          : formatNumber(ratingForOne)
                        : 'NYI';
                    const informationIconTooltip = (
                      <Trans id="shared.healerStatValues.statistic.stats.tooltip">
                        {gainPerSecond} HPS per 1 rating / {rating} rating per 1% throughput
                      </Trans>
                    );

                    return (
                      <tr key={stat}>
                        <td className={classNameCorrected}>
                          {Icon ? (
                            <Icon
                              style={{
                                height: '1.6em',
                                width: '1.6em',
                                marginRight: 10,
                              }}
                            />
                          ) : (
                            ''
                          )}{' '}
                          {tooltip ? (
                            <TooltipElement content={tooltip}>
                              {getNameTranslated(stat)}
                            </TooltipElement>
                          ) : (
                            getNameTranslated(stat)
                          )}
                        </td>
                        <td className="text-right">
                          {stat === STAT.HASTE_HPCT && '0.00 - '}
                          {gain !== null ? weight.toFixed(2) : 'NYI'}
                        </td>
                        <td style={{ padding: 6 }}>
                          <Tooltip content={informationIconTooltip}>
                            <div>
                              <InformationIcon />
                            </div>
                          </Tooltip>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </StatisticGroup>
    );
  }
  // endregion
}

export default BaseHealerStatValues;

export type HealerStatWeightEvents = HealEvent | AbsorbedEvent | RemoveBuffEvent;

export interface HealerSpellInfo {
  int?: boolean;
  crit?: boolean;
  hasteHpm?: boolean;
  hasteHpct?: boolean;
  mastery?: boolean;
  vers?: boolean;
  ignored?: boolean;
  multiplier?: boolean;
  masteryStack?: boolean;
}

export interface ListOfHealerSpellInfo {
  [key: number]: HealerSpellInfo;
}

export interface StatMessage {
  stat: STAT;
  tooltip: JSX.Element;
}
