import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import Combatants from 'Parser/Core/Modules/Combatants';
import HealingValue from 'Parser/Core/Modules/HealingValue';
import DamageValue from 'Parser/Core/Modules/DamageValue';
import CritEffectBonus from 'Parser/Core/Modules/Helpers/CritEffectBonus';
import StatTracker from 'Parser/Core/Modules/StatTracker';

import { getSpellInfo } from '../../SpellInfo';
import MasteryEffectiveness from './MasteryEffectiveness';

const DEBUG = true;

const ARMOR_INT_MULTIPLIER = 1.05; // 5% int bonus from wearing all leather means each new point of int worth 1.05 vs character sheet int
const INFUSION_OF_LIGHT_BUFF_EXPIRATION_BUFFER = 150; // the buff expiration can occur several MS before the heal event is logged, this is the buffer time that an IoL charge may have dropped during which it will still be considered active.
const INFUSION_OF_LIGHT_BUFF_MINIMAL_ACTIVE_TIME = 200; // if someone heals with FoL and then immediately casts a HS race conditions may occur. This prevents that (although the buff is probably not applied before the FoL).
const INFUSION_OF_LIGHT_FOL_HEALING_INCREASE = 0.5;

/**
 * Holy Paladin Stat Weights Methodology
 *
 * A full explanation of this approach can be read in the issue linked below. This was written for theorycrafters without needing to understand code.
 * (but it might be outdated, that's always the risk of documentation)
 * https://github.com/WoWAnalyzer/WoWAnalyzer/issues/657
 */
class StatWeights extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    critEffectBonus: CritEffectBonus,
    statTracker: StatTracker,
    masteryEffectiveness: MasteryEffectiveness, // this added the `masteryEffectiveness` property to spells that are affected by Mastery
  };

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

  on_heal(event) {
    if (event.ability.guid === SPELLS.BEACON_OF_LIGHT.id) {
      // Handle this via the `on_beacon_heal` event
      return;
    }
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
  on_beacon_heal(event, originalHeal) {
    const spellInfo = getSpellInfo(originalHeal.ability.guid, originalHeal.ability.name);
    const healVal = new HealingValue(event.amount, event.absorbed, event.overheal);
    this._handleHeal(spellInfo, originalHeal, healVal);
  }
  _handleHealEvent(event, healVal) {
    const spellInfo = getSpellInfo(event.ability.guid, event.ability.name);
    this._handleHeal(spellInfo, event, healVal);
  }
  _handleHeal(spellInfo, event, healVal) {
    // Most spells are counted in healing total, but some spells scale not on their own but 'second hand' from other spells
    // I adjust them out of total healing to preserve some accuracy in the "Rating per 1%" stat.
    // Good examples of multiplier spells are Leech and Velens.
    if (!spellInfo.multiplier) {
      this.totalAdjustedHealing += healVal.effective;
    }

    if (spellInfo.ignored) {
      return;
    }

    this._leech(event, healVal);

    if (spellInfo.multiplier) {
      // Multiplier spells aren't counted for weights because they don't **directly** benefit from stat weights
      return;
    }

    if (spellInfo.int) {
      this._intellect(event, healVal);
    }
    if (spellInfo.crit) {
      this._criticalStrike(event, healVal);
    }
    if (spellInfo.hasteHpct) {
      this._hasteHpct(event, healVal);
    }
    if (spellInfo.mastery) {
      this._mastery(event, healVal);
    }
    if (spellInfo.vers) {
      this._versatility(event, healVal);
    }
  }
  _leech(event, healVal) {
    const spellId = event.ability.guid;

    // We have to calculate leech weight differently depending on if we already have any leech rating.
    // Leech is marked as a 'multplier' heal, so we have to check it before we do the early return below
    const hasLeech = this.statTracker.currentLeechPercentage > 0;
    if (hasLeech) {
      // When the user has Leech we can use the actual Leech healing to accuractely calculate its HPS value without having to do any kind of predicting
      if (!healVal.overheal && spellId === SPELLS.LEECH.id) {
        this.totalOneLeech += healVal.effective / this.statTracker.currentLeechRating; // TODO: Make a generic method to account for base percentage
      }
    } else {
      // Without Leech we will have to make an estimation so we can still provide the user with a decent value
      if (this.playerHealthMissing > 0) { // if the player is full HP this would have overhealed.
        const healIncreaseFromOneLeech = 1 / this.statTracker.leechRatingPerPercent;
        this.totalOneLeech += healVal.raw * healIncreaseFromOneLeech;
      }
    }
  }
  _intellect(event, healVal) {
    if (healVal.overheal) {
      // If a spell overheals, it could not have healed for more. Seeing as Int only adds HP on top of the existing heal we can skip it as increasing the power of this heal would only be more overhealing.
      return;
    }
    const currInt = this.statTracker.currentIntellectRating;
    // noinspection PointlessArithmeticExpressionJS
    const healIncreaseFromOneInt = (1 * ARMOR_INT_MULTIPLIER) / currInt;
    this.totalOneInt += healVal.effective * healIncreaseFromOneInt;
  }
  _criticalStrike(event, healVal) {
    this._criticalStrikeEffectiveHealing(event, healVal);
    this._criticalStrikeInfusionOfLightProcs(event, healVal);
  }
  _getCritChance(event) {
    const spellId = event.ability.guid;

    const rating = this.statTracker.currentCritRating;
    let baseCritChance = this.statTracker.baseCritPercentage;
    let ratingCritChance = rating / this.statTracker.critRatingPerPercent;

    // region Spec specific crit chance buffs
    if (this.combatants.selected.hasBuff(SPELLS.AVENGING_WRATH.id)) {
      // Avenging Wrath increases the crit chance by 20%, this 20% does not add to the rating contribution since it's unaffected by stats.
      baseCritChance += 0.2;
    }
    if (spellId === SPELLS.HOLY_SHOCK_HEAL.id) {
      // Holy Shock *doubles* the crit chance, this includes doubling the base.
      baseCritChance *= 2;
      ratingCritChance *= 2;
    }
    // endregion

    return { baseCritChance, ratingCritChance };
  }
  _criticalStrikeEffectiveHealing(event, healVal) {
    if (event.hitType === HIT_TYPES.CRIT) {
      // This collects the total effective healing contributed by the last 1 point of critical strike rating.
      // We don't make any predictions on normal hits based on crit chance since this would be guess work and we are a log analysis system so we prefer to only work with facts. Actual crit heals are undeniable facts, unlike speculating the chance a normal hit might have crit (and accounting for the potential overhealing of that).

      const { baseCritChance, ratingCritChance } = this._getCritChance(event);

      const totalCritChance = baseCritChance + ratingCritChance;
      if (totalCritChance > (1 + 1 / this.statTracker.critRatingPerPercent)) {
        // If the crit chance was more than 100%+1 rating, then the last rating was over the cap and worth 0.
        return;
      }
      const ratingCritChanceContribution = 1 - baseCritChance / totalCritChance;

      const critMult = this.critEffectBonus.getBonus(event);
      const rawBaseHealing = healVal.raw / critMult;
      const effectiveCritHealing = Math.max(0, healVal.effective - rawBaseHealing);
      const rating = this.statTracker.currentCritRating;

      this.totalOneCrit += effectiveCritHealing * ratingCritChanceContribution / rating;
    }
  }
  _criticalStrikeInfusionOfLightProcs(event, healVal) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.FLASH_OF_LIGHT.id && spellId !== SPELLS.HOLY_LIGHT.id) {
      return;
    }
    const hasIol = this.combatants.selected.hasBuff(SPELLS.INFUSION_OF_LIGHT.id, event.timestamp, INFUSION_OF_LIGHT_BUFF_EXPIRATION_BUFFER, INFUSION_OF_LIGHT_BUFF_MINIMAL_ACTIVE_TIME);
    if (!hasIol) {
      return;
    }

    if (spellId === SPELLS.FLASH_OF_LIGHT.id) {
      const regularHeal = healVal.raw / (1 + INFUSION_OF_LIGHT_FOL_HEALING_INCREASE);
      const effectiveIolHealing = Math.max(0, healVal.effective - regularHeal);

      const { baseCritChance, ratingCritChance } = this._getCritChance(event);

      const totalCritChance = baseCritChance + ratingCritChance;
      if (totalCritChance > (1 + 1 / this.statTracker.critRatingPerPercent)) {
        // If the crit chance was more than 100%+1 rating, then the last rating was over the cap and worth 0.
        return;
      }
      const ratingCritChanceContribution = 1 - baseCritChance / totalCritChance;

      this.totalOneCrit += effectiveIolHealing * ratingCritChanceContribution / this.statTracker.currentCritRating;
    }
    if (spellId === SPELLS.HOLY_LIGHT.id) {
      // TODO: We might be able to use the Haste stat weight to value the CDR
    }
  }
  _hasteHpct(event, healVal) {
    if (healVal.effective === 0) {
      // While Haste does not directly increase overhealing (or any overhealing in a measurable way), casting a spell that does 0 healing is useless regardless. Being able to cast that one spell more because of the player's Haste gained us no useful output. Note that the (effective) beacon transfer healing caused by this spell will still be added to the Haste value separately.
      return;
    }

    const healIncreaseFromOneHaste = 1 / this.statTracker.hasteRatingPerPercent;

    this.totalOneHasteHpct += healVal.effective * healIncreaseFromOneHaste;
  }
  _mastery(event, healVal) {
    if (healVal.overheal) {
      // If a spell overheals, it could not have healed for more. Seeing as Mastery only adds HP on top of the existing heal we can skip it as increasing the power of this heal would only be more overhealing.
      return;
    }
    if (event.masteryEffectiveness === undefined) {
      console.error('This spell does not have a known masteryEffectiveness:', event.ability.guid, event.ability.name);
      return;
    }

    const masteryEffectiveness = event.masteryEffectiveness;
    const healIncreaseFromOneMastery = 1 / this.statTracker.masteryRatingPerPercent * masteryEffectiveness;
    const baseHeal = healVal.effective / (1 + this.statTracker.currentMasteryPercentage * masteryEffectiveness);

    this.totalOneMastery += baseHeal * healIncreaseFromOneMastery;
  }
  _versatility(event, healVal) {
    if (healVal.overheal) {
      // If a spell overheals, it could not have healed for more. Seeing as Versatility only adds HP on top of the existing heal we can skip it as increasing the power of this heal would only be more overhealing.
      return;
    }
    const currVersPerc = this.statTracker.currentVersatilityPercentage;
    const healIncreaseFromOneVers = 1 / this.statTracker.versatilityRatingPerPercent;
    const baseHeal = healVal.effective / (1 + currVersPerc);
    this.totalOneVers += baseHeal * healIncreaseFromOneVers;
  }

  on_toPlayer_damage(event) {
    const damageVal = new DamageValue(event.amount, event.absorbed, event.overkill);
    const amount = damageVal.effective;
    const currentVersDamageReductionPercentage = this.statTracker.currentVersatilityPercentage / 2;
    const damageReductionIncreaseFromOneVers = 1 / this.statTracker.versatilityRatingPerPercent / 2; // the DR part is only 50% of the Versa percentage

    const noVersDamage = amount / (1 - currentVersDamageReductionPercentage);
    this.totalOneVersDr += noVersDamage * damageReductionIncreaseFromOneVers;

    this._updateMissingHealth(event);
  }

  on_toPlayer_heal(event) {
    this._updateMissingHealth(event);
  }
  _updateMissingHealth(event) {
    if (event.hitPoints && event.maxHitPoints) { // fields not always populated, don't know why
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

  _prepareResults() {
    return [
      {
        stat: 'Intellect',
        className: 'stat-intellect',
        gain: this.totalOneInt,
      },
      {
        stat: 'Crit',
        className: 'stat-criticalstrike',
        gain: this.totalOneCrit,
      },
      {
        stat: 'Haste (HPCT)',
        className: 'stat-haste',
        gain: this.totalOneHasteHpct,
        tooltip: `
          HPCT stands for "Hits per Cast Time". This is the value that 1% Haste would be worth if you would cast everything you are already casting (and that can be casted quicker) 1% faster. Mana is not accounted for in any way and you should consider the Haste stat weight 0 if you run out of mana while doing everything else right.<br /><br />

          The real worth of Haste might be a bit higher when it causes you to fit more things into static buff durations such as Avenging Wrath, Aura Mastery and other buffs.
        `,
      },
      // {
      //   stat: 'Haste (HPM)',
      //   className: 'stat-haste',
      //   gain: this.totalOneHasteHpm,
      //   weight: hasteHpmWeight,
      //   ratingForOne: hasteHpmForOnePercent,
      //   tooltip: 'HPM stands for "Healing per Mana". In valuing Haste, it considers only the faster HoT ticking and not the reduced cast times. Effectively it models haste\'s bonus to mana efficiency. This is typically the better calculation to use for raid encounters where mana is an issue.',
      // },
      {
        stat: 'Mastery',
        className: 'stat-mastery',
        gain: this.totalOneMastery,
      },
      {
        stat: 'Versatility',
        className: 'stat-versatility',
        gain: this.totalOneVers,
        tooltip: 'Weight includes only the boost to healing, and does not include the damage reduction.',
      },
      {
        stat: 'Versatility (incl DR)',
        className: 'stat-versatility',
        gain: this.totalOneVers + this.totalOneVersDr,
        tooltip: 'Weight includes both healing boost and damage reduction, counting damage reduction as additional throughput.',
      },
      {
        stat: 'Leech',
        className: 'stat-leech',
        gain: this.totalOneLeech,
      },
    ];
  }

  extraPanel() {
    const results = this._prepareResults();
    return (
      <div className="panel items">
        <div className="panel-heading">
          <h2><dfn data-tip="Weights are calculated using the actual circumstances of this encounter. Weights are likely to differ based on fight, raid size, items used, talents chosen, etc.<br /><br />DPS gains are not included in any of the stat weights.">Stat Weights</dfn>
          </h2>
        </div>
        <div className="panel-body" style={{ padding: 0 }}>
          <table className="data-table compact">
            <thead>
              <tr>
                <th style={{ minWidth: 30 }}><b>Stat</b></th>
                <th style={{ minWidth: 30 }}><dfn data-tip="Normalized so Intellect is always 1.00"><b>Weight</b></dfn></th>
                <th style={{ minWidth: 30 }}><dfn data-tip="Amount of stat rating required to increase your total healing by 1%"><b>Rating per 1%</b></dfn></th>
              </tr>
            </thead>
            <tbody>
              {results.map(row => {
                const weight = row.gain / (this.totalOneInt || 1);
                const ratingForOne = this._ratingPerOnePercent(row.gain);

                return (
                  <tr key={row.stat}>
                    <td>
                      <div className={`${row.className}-bg`} style={{ width: '1em', height: '1em', borderRadius: '50%', display: 'inline-block', marginRight: 5, marginBottom: -2 }} />

                      {row.tooltip ? <dfn data-tip={row.tooltip}>{row.stat}</dfn> : row.stat}
                    </td>
                    <td>{row.gain !== null ? weight.toFixed(2) : 'NYI'}</td>
                    <td>{row.gain !== null ? (
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

export default StatWeights;
