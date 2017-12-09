import React from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import ClipboardCopyButton from 'Main/ClipboardCopyButton';

import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import Combatants from 'Parser/Core/Modules/Combatants';
import HealingValue from 'Parser/Core/Modules/HealingValue';
import DamageValue from 'Parser/Core/Modules/DamageValue';
import CritEffectBonus from 'Parser/Core/Modules/Helpers/CritEffectBonus';
import StatTracker from 'Parser/Core/Modules/StatTracker';

import CORE_SPELL_INFO from './SpellInfo';
import STAT, { getName, getPawnStringName, getClassNameColor, getIcon } from './STAT';

const DEBUG = false;

// 5% int bonus from wearing all of the highest armor rating (Leather, Mail, Plate) means each new point of int worth 1.05 vs character sheet int
export const ARMOR_INT_BONUS = .05;

/**
 * This is currently completely focussed on Healer stat weights but it should be relatively easy to modify it to work for a DPS, it just requires some work. The only reason no effort was put towards this is that we currently have no DPS interested in implementing this so it would be wasted time. If you do want to implement stat weights for a DPS this should provide you with a very good basis.
 */
class BaseHealerStatValues extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    critEffectBonus: CritEffectBonus,
    statTracker: StatTracker,
  };

  // region Spell info

  // We assume unlisted spells scale with vers only (this will mostly be trinkets)
  fallbackSpellInfo = {
    int: false,
    crit: false,
    hasteHpm: false,
    hasteHpct: false,
    mastery: false,
    vers: true,
  };
  // This will contain shared settings for things like trinkets and Leech
  sharedSpellInfo = CORE_SPELL_INFO;
  // This is for spec specific implementations to override. It gets priority over defaultSpellInfo.
  spellInfo = {};

  mentioned = [];
  _getSpellInfo(event) {
    const spellId = event.ability.guid;

    const specSpecific = this.spellInfo[spellId];
    if (specSpecific) {
      return specSpecific;
    }
    const shared = this.sharedSpellInfo[spellId];
    if (shared) {
      return shared;
    }

    if (process.env.NODE_ENV === 'development') {
      if (!this.mentioned.includes(spellId)) {
        console.warn(`Missing spell definition: ${spellId}: ${event.ability.name}, using fallback:`, this.fallbackSpellInfo);
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
  totalOneVersDr = 0;  // from damage reduced only
  totalOneLeech = 0;

  playerHealthMissing = 0;

  scaleWeightsWithHealth = false;

  on_heal(event) {
    if (this.owner.byPlayer(event) || this.owner.byPlayerPet(event)) {
      const healVal = new HealingValue(event.amount, event.absorbed, event.overheal);
      this._handleHealEvent(event, healVal);
    }
  }
  on_absorbed(event) {
    if (this.owner.byPlayer(event) || this.owner.byPlayerPet(event)) {
      const healVal = new HealingValue(event.amount, 0, 0);
      this._handleHealEvent(event, healVal);
    }
  }
  on_removebuff(event) {
    if (this.owner.byPlayer(event) || this.owner.byPlayerPet(event)) {
      if (event.absorb) {
        const healVal = new HealingValue(0, 0, event.absorb);
        this._handleHealEvent(event, healVal);
      }
    }
  }
  _handleHealEvent(event, healVal) {
    const spellInfo = this._getSpellInfo(event);
    const targetHealthPercentage = (event.hitPoints - healVal.effective) / event.maxHitPoints; // hitPoints contains HP *after* the heal
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
  _handleHeal(spellInfo, eventForWeights, healVal, targetHealthPercentage) {
    // Most spells are counted in healing total, but some spells scale not on their own but 'second hand' from other spells
    // I adjust them out of total healing to preserve some accuracy in the "Rating per 1%" stat.
    // Good examples of multiplier spells are Leech and Velens.
    if (!spellInfo.multiplier) {
      this.totalAdjustedHealing += this._adjustGain(healVal.effective, targetHealthPercentage);
    }

    if (spellInfo.ignored) {
      return;
    }

    this.totalOneLeech += this._adjustGain(this._leech(eventForWeights, healVal, spellInfo), targetHealthPercentage);

    if (spellInfo.multiplier) {
      // Multiplier spells aren't counted for weights because they don't **directly** benefit from stat weights
      return;
    }

    if (spellInfo.int) {
      this.totalOneInt += this._adjustGain(this._intellect(eventForWeights, healVal), targetHealthPercentage);
    }
    if (spellInfo.crit) {
      this.totalOneCrit += this._adjustGain(this._criticalStrike(eventForWeights, healVal), targetHealthPercentage);
    }
    if (spellInfo.hasteHpct) {
      this.totalOneHasteHpct += this._adjustGain(this._hasteHpct(eventForWeights, healVal), targetHealthPercentage);
    }
    if (spellInfo.hasteHpm) {
      this.totalOneHasteHpm += this._adjustGain(this._hasteHpm(eventForWeights, healVal), targetHealthPercentage);
    }
    if (spellInfo.mastery) {
      this.totalOneMastery += this._adjustGain(this._mastery(eventForWeights, healVal), targetHealthPercentage);
    }
    if (spellInfo.vers) {
      this.totalOneVers += this._adjustGain(this._versatility(eventForWeights, healVal), targetHealthPercentage);
    }
  }
  _adjustGain(gain, targetHealthPercentage) {
    // We want 0-20% health to get value gain, and then linearly decay to 100% health
    const maxValueHealthPercentage = 0.3;
    const mult = 1 - Math.max(0, (targetHealthPercentage - maxValueHealthPercentage) / (1 - maxValueHealthPercentage));
    return this.scaleWeightsWithHealth ? gain * mult : gain;
  }
  _leech(event, healVal, spellInfo) {
    const spellId = event.ability.guid;
    if (event.type !== 'heal') {
      return 0; // leech doesn't proc from absorbs
    }

    // We have to calculate leech weight differently depending on if we already have any leech rating.
    // Leech is marked as a 'multplier' heal, so we have to check it before we do the early return below
    const hasLeech = this.statTracker.currentLeechPercentage > 0;
    if (hasLeech) {
      // When the user has Leech we can use the actual Leech healing to accuractely calculate its HPS value without having to do any kind of predicting
      if (!healVal.overheal && spellId === SPELLS.LEECH.id) {
        return healVal.effective / this.statTracker.currentLeechRating; // TODO: Make a generic method to account for base percentage
      }
    } else {
      if (this.owner.toPlayer(event)) {
        return 0; // Leech doesn't proc from self-healing
      }
      if (spellInfo.multiplier) {
        return 0; // Leech doesn't proc from multipliers such as Velen's Future Sight
      }
      // Without Leech we will have to make an estimation so we can still provide the user with a decent value
      if (this.playerHealthMissing > 0) { // if the player is full HP this would have overhealed.
        const healIncreaseFromOneLeech = 1 / this.statTracker.leechRatingPerPercent;
        return healVal.raw * healIncreaseFromOneLeech;
      }
    }
    return 0;
  }
  _intellect(event, healVal) {
    if (healVal.overheal) {
      // If a spell overheals, it could not have healed for more. Seeing as Int only adds HP on top of the existing heal we can skip it as increasing the power of this heal would only be more overhealing.
      return 0;
    }
    const currInt = this.statTracker.currentIntellectRating;
    // noinspection PointlessArithmeticExpressionJS
    const healIncreaseFromOneInt = (1 + ARMOR_INT_BONUS) / currInt;
    return healVal.effective * healIncreaseFromOneInt;
  }
  _getCritChance(event) {
    const rating = this.statTracker.currentCritRating;
    const baseCritChance = this.statTracker.baseCritPercentage;
    const ratingCritChance = rating / this.statTracker.critRatingPerPercent;

    return { baseCritChance, ratingCritChance };
  }
  _criticalStrike(event, healVal) {
    if (event.hitType === HIT_TYPES.CRIT) {
      // This collects the total effective healing contributed by the last 1 point of critical strike rating.
      // We don't make any predictions on normal hits based on crit chance since this would be guess work and we are a log analysis system so we prefer to only work with facts. Actual crit heals are undeniable facts, unlike speculating the chance a normal hit might have crit (and accounting for the potential overhealing of that).

      const { baseCritChance, ratingCritChance } = this._getCritChance(event);

      const totalCritChance = baseCritChance + ratingCritChance;
      if (totalCritChance > (1 + 1 / this.statTracker.critRatingPerPercent)) {
        // If the crit chance was more than 100%+1 rating, then the last rating was over the cap and worth 0.
        return 0;
      }
      const ratingCritChanceContribution = 1 - baseCritChance / totalCritChance;

      const critMult = this.critEffectBonus.getBonus(event);
      const rawBaseHealing = healVal.raw / critMult;
      const effectiveCritHealing = Math.max(0, healVal.effective - rawBaseHealing);
      const rating = this.statTracker.currentCritRating;

      return effectiveCritHealing * ratingCritChanceContribution / rating;
    }
    return 0;
  }
  _hasteHpct(event, healVal) {
    const currHastePerc = this.statTracker.currentHastePercentage;
    const healIncreaseFromOneHaste = 1 / this.statTracker.hasteRatingPerPercent;
    const baseHeal = healVal.effective / (1 + currHastePerc);
    return baseHeal * healIncreaseFromOneHaste;
  }
  _hasteHpm(event, healVal) {
    const healIncreaseFromOneHaste = 1 / this.statTracker.hasteRatingPerPercent;
    const noHasteHealing = healVal.effective / (1 + this.statTracker.currentHastePercentage);
    return noHasteHealing * healIncreaseFromOneHaste;
  }
  _mastery(event, healVal) {
    throw new Error('Missing custom Mastery implementation. This is different per spec.');
  }
  _versatility(event, healVal) {
    if (healVal.overheal) {
      // If a spell overheals, it could not have healed for more. Seeing as Versatility only adds HP on top of the existing heal we can skip it as increasing the power of this heal would only be more overhealing.
      return 0;
    }
    const currVersPerc = this.statTracker.currentVersatilityPercentage;
    const healIncreaseFromOneVers = 1 / this.statTracker.versatilityRatingPerPercent;
    const baseHeal = healVal.effective / (1 + currVersPerc);
    return baseHeal * healIncreaseFromOneVers;
  }

  on_toPlayer_damage(event) {
    this._updateMissingHealth(event);

    const damageVal = new DamageValue(event.amount, event.absorbed, event.overkill);
    const targetHealthPercentage = event.hitPoints / event.maxHitPoints; // hitPoints contains HP *after* the damage taken, which in this case is desirable
    this.totalOneVersDr += this._adjustGain(this._versatilityDamageReduction(event, damageVal), targetHealthPercentage);
  }
  _versatilityDamageReduction(event, damageVal) {
    const amount = damageVal.effective;
    const currentVersDamageReductionPercentage = this.statTracker.currentVersatilityPercentage / 2;
    const damageReductionIncreaseFromOneVers = 1 / this.statTracker.versatilityRatingPerPercent / 2; // the DR part is only 50% of the Versa percentage

    const noVersDamage = amount / (1 - currentVersDamageReductionPercentage);
    return noVersDamage * damageReductionIncreaseFromOneVers;
  }

  on_toPlayer_heal(event) {
    this._updateMissingHealth(event);
  }
  _updateMissingHealth(event) {
    if (event.hitPoints && event.maxHitPoints) { // fields not always populated, don't know why
      // `maxHitPoints` is always the value *after* the effect applied
      this.playerHealthMissing = event.maxHitPoints - event.hitPoints;
    }
  }

  on_finished() {
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

  _ratingPerOnePercent(oneRatingHealing) {
    const onePercentHealing = this.totalAdjustedHealing / 100;
    return onePercentHealing / oneRatingHealing;
  }
  _getGain(stat) {
    switch (stat) {
      case STAT.INTELLECT: return this.totalOneInt;
      case STAT.CRITICAL_STRIKE: return this.totalOneCrit;
      case STAT.HASTE_HPCT: return this.totalOneHasteHpct;
      case STAT.HASTE_HPM: return this.totalOneHasteHpm;
      case STAT.MASTERY: return this.totalOneMastery;
      case STAT.VERSATILITY: return this.totalOneVers;
      case STAT.VERSATILITY_DR: return this.totalOneVers + this.totalOneVersDr;
      case STAT.LEECH: return this.totalOneLeech;
      default: return 0;
    }
  }
  _getPawnString() {
    if(this._getPawnStats) {
      const fightNameWithoutSpaces = this.owner.fight.name.replace(' ', '');
      const playerName = this.owner.player.name;
      const pawnStats = this._getPawnStats();
      return `( Pawn: v1: "WoWAnalyzer-${playerName}-${fightNameWithoutSpaces}": ${pawnStats.reduce((acc, stat) =>
        acc + getPawnStringName(stat) + '=' + this._getGain(stat).toFixed(0) + ', ', '').slice(0, -2)} )`;
    } else {
      return null;
    }
  }
  _getTooltip(stat) {
    switch (stat) {
      case STAT.HASTE_HPCT:
        return 'HPCT stands for "Healing per Cast Time". This is the value that 1% Haste would be worth if you would cast everything you are already casting (and that can be casted quicker) 1% faster. Mana is not accounted for in any way and you should consider the Haste stat weight 0 if you run out of mana while doing everything else right.';
      case STAT.HASTE_HPM:
        return 'HPM stands for "Healing per Mana". In valuing Haste, it considers only the faster HoT ticking and not the reduced cast times. Effectively it models haste\'s bonus to mana efficiency. This is typically the better calculation to use for raid encounters where mana is an issue.';
      case STAT.VERSATILITY:
        return 'Weight includes only the boost to healing, and does not include the damage reduction.';
      case STAT.VERSATILITY_DR:
        return 'Weight includes both healing boost and damage reduction, counting damage reduction as additional throughput.';
      default: return null;
    }
  }
  moreInformationLink = null;
  extraPanelOrder = 200;
  extraPanel() {
    const results = this._prepareResults();
    return (
      <div className="panel items">
        <div className="panel-heading flex">
          <h2>
            <dfn data-tip="These stat values are calculated using the actual circumstances of this encounter. These values reveal the value of the last 1 rating of each stat, they may not necessarily be the best way to gear. The stat values are likely to differ based on fight, raid size, items used, talents chosen, etc.<br /><br />DPS gains are not included in any of the stat values.">Stat Values</dfn>

            {this.moreInformationLink && (
              <a href={this.moreInformationLink} className="pull-right">
                More info
              </a>
            )}
          </h2>
          {this._getPawnStats && (
            <ClipboardCopyButton copyText={this._getPawnString()} label='Pawn String' />
          )}
        </div>
        <div className="panel-body" style={{ padding: 0 }}>
          <table className="data-table compact">
            <thead>
              <tr>
                <th style={{ minWidth: 30 }}><b>Stat</b></th>
                <th className="text-right" style={{ minWidth: 30 }}><dfn data-tip="Normalized so Intellect is always 1.00"><b>Value</b></dfn></th>
                <th className="text-right" style={{ minWidth: 30 }}><dfn data-tip="Amount of stat rating required to increase your total healing by 1%"><b>Rating per 1%</b></dfn></th>
              </tr>
            </thead>
            <tbody>
              {results.map(row => {
                const stat = typeof row === 'object' ? row.stat : row;
                const tooltip = typeof row === 'object' ? row.tooltip : this._getTooltip(stat);
                const gain = this._getGain(stat);
                const weight = gain / (this.totalOneInt || 1);
                const ratingForOne = this._ratingPerOnePercent(gain);

                const Icon = getIcon(stat);

                return (
                  <tr key={stat}>
                    <td className={getClassNameColor(stat)}>
                      <Icon
                        style={{
                          height: '1.6em',
                          width: '1.6em',
                          marginRight: 10,
                        }}
                      />{' '}
                      {tooltip ? <dfn data-tip={tooltip}>{getName(stat)}</dfn> : getName(stat)}
                    </td>
                    <td className="text-right">{stat === STAT.HASTE_HPCT && '0.00 - '}{gain !== null ? weight.toFixed(2) : 'NYI'}</td>
                    <td className="text-right">{gain !== null ? (
                      ratingForOne === Infinity ? '∞' : formatNumber(ratingForOne)
                    ) : 'NYI'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default BaseHealerStatValues;
