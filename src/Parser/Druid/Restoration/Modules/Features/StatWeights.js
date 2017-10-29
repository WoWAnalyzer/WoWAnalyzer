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

const DEBUG = false;

const ARMOR_INT_MULTIPLIER = 1.05; // 5% int bonus from wearing all leather means each new point of int worth 1.05 vs character sheet int

/*
 * Resto Druid Stat Weights Methodology
 *
 * Approach -
 * This module generates the players stat weights using the actual logged events. We keep a listing of all the player's healing spells
 * along with which stats those spells scales with, and for each stat a heal scales with we do some simple math to find out
 * how much more it would have healed if the player had one more of that stat. We compare the total healing increases
 * caused by seperately increasing each stat by one in order to generate weights.
 *
 * Overheal -
 * The toughest problem to face when generating healing stat weights is what to do about overhealing. Unfortunately, there is
 * no one correct answer. A main issue is what I call The "Would've" Problem. We can say "an extra bit of healing here doesn't
 * matter because it *would've* just caused the next heal to overheal", but how far can we take this logic? My approach is that
 * it doesn't only matter how much is healed, but also how quickly. We'll count all healing that doesn't overheal even if we
 * theorize that it might lead to overhealing. We're more strict on heals that overheal: they're disregarded entirely even
 * if they're only partial overhealing. This is because a spell that partially overheals will do the same amount of effective
 * healing regardless of the raw strength of the heal. This approach can cause some possible weirdness. For example, consider
 * a situation where there is a heal for 500 (0 overheal) followed immediately by a heal for 400 (+ 100 overheal). 500 of this
 * healing would be counted towards stat weights. Now consider a situation where one heal does 900 (+ 100 overheal). Functionally,
 * this situation is identical, but in this case none of the healing is counted towards stat weights. Counting all effective
 * healing, even heals that partially overheal, fixes this issue and is overall a valid approach, but still not one I will be taking.
 * I think an advantage of disregarding all partial overheals is that it gives "top off" heals an effective lower weight than
 * "life saver" heals. Still, this is a decision I will revisit.
 *
 * Stat Tracking -
 * These calculations work best when they use the players actual stats at the moment of a heal. As such, accuracy will be
 * improved when a StatTracker module is implemented, rather than being forced to use the player's stats at the moment of pull.
 * For now, I'm handling the most common big Druid stat buffs manually.
 *
 * Intellect -
 * Math here is straightforward, as spells that scale with int scale directly and linearly with total int. Due to the 'all leather'
 * bonus, each point of int gained is multiplied by 1.05, which has to be taken into account. The increase in power from
 * one int is simply 1.05 / totalInt.
 *
 * Crit -
 * The general formula is critChanceFromOneRating * healAmount, but we have to make sure to account for anything that makes a
 * crit stronger than 2x (e.g. Drape of Shame), and we also have to account for if healAmount is already a crit. If the heal
 * is already a crit then we double count the weight, so we first have to normalize it to the amount it would have done
 * had it not crit. Special handling is needed for Living Seed obviously. We assume that higher crit will result in proportionally
 * more Living Seeds, and so get the bonus to Living Seed as critChangeFromOneRating / critChance.
 *
 * Haste -
 * Calculating the benefit to healing from being able to cast faster is a huge pain in the ass, particularly for Resto Druids
 * who aren't very dependant on cast times. However, HoTs tick faster and effectively do increased healing per cast due to Haste.
 * We make the decision to only calculate this benefit, which is fairly simple math:
 * healAmount / (1 + hastePercentage) * hastePercentageFromOneRating
 *
 * Mastery -
 * The mastery calculation is almost the same as Haste's, in that you normalize the heal amount to be the amount it would
 * have been without any of the stat, and then multiply by the percentage gain from one rating. The one wrinkle is that mastery's
 * strength is multiplied by the number of hots on target. Fortunately, we can easily calculate the number of HoTs on the target
 * of each heal.
 *
 * Versatility -
 * This is the same calculation as for haste, healAmount / (1 + versPercentage) * versPercentageFromOneRating.
 * We don't currently consider the damage reduction bonus from vers, and it's probably not a good thing to add directly to
 * the weight as damage reduction isn't quite the same thing as healing. It's easy enough to calculate just by skimming the
 * appropriate percentage of each toPlayer_damage. I will probably add it to the tooltip in the future.
 *
 * Leech -
 * Calculating this is different depending on if the player does or does not already have any Leech. If the player does have
 * Leech we calculate this pretty much the same as int: for every Leech heal the increase in power from one leech is
 * simply 1 / totalLeechRating. If the player does not already have Leech, things are much more difficult. I have not yet
 * settled on an approach, and so this calculation is not yet implemented.
 *
 * Special Cases -
 *
 * A few special cases are considered. We're ignoring all Tranq healing, even ticks that don't overheal, under the assumption
 * that the last ticks always overheal so what's the difference? I know this is a violation of the "would've" rule I detailed
 * above. This decision may be revisited.
 *
 * Leech and Velens heals are disregarded for the purpose of the main stat's weights, as they scale with whatever procced them.
 * It's easiest to just not count them.
 *
 * If a heal is not in the database of heals, it's assumed to scale only with Vers. This is generally a good assumption,
 * and this is how most trinket heals behave.
 */
class StatWeights extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    critEffectBonus: CritEffectBonus,
    statTracker: StatTracker,
  };

  totalAdjustedHealing = 0; // total healing after excluding 'multiplier' spells like Leech / Velens

  // These are the total healing that would be gained if their respective stats ratings were increased by one.
  totalOneInt = 0;
  totalOneCrit = 0;
  totalOneHasteHpm = 0;
  totalOneMastery = 0;
  totalOneVers = 0; // from healing increase only
  totalOneVersDr = 0;  // from damage reduced only
  totalOneLeech = 0;

  playerHealthMissing = 0;

  on_byPlayer_heal(event) {
    const healVal = new HealingValue(event.amount, event.absorbed, event.overheal);
    this._handleHeal(event, healVal);
  }

  on_byPlayer_absorbed(event) {
    const healVal = new HealingValue(event.amount, 0, 0);
    this._handleHeal(event, healVal);
  }

  on_toPlayer_damage(event) {
    const damageVal = new DamageValue(event.amount, event.absorbed, event.overkill);
    this._handleDamage(event, damageVal);
    this._updateMissingHealth(event);
  }

  on_toPlayer_heal(event) {
    this._updateMissingHealth(event);
  }

  _updateMissingHealth(event) {
    if(event.hitPoints && event.maxHitPoints) { // fields not always populated, don't know why
      this.playerHealthMissing = event.maxHitPoints - event.hitPoints;
    }
  }

  _handleHeal(event, healVal) {
    const spellId = event.ability.guid;
    const target = this.combatants.getEntity(event);
    if(target === null) {
      return;
    }

    const amount = healVal.effective;
    const spellInfo = getSpellInfo(event.ability.guid);

    // region LEECH
    // We have to calculate leech weight differently depending on if we already have any leech rating.
    // Leech is marked as a 'multplier' heal, so we have to check it before we do the early return below
    const hasLeech = this.statTracker.currentLeechRating > 0;
    if(hasLeech && spellId === SPELLS.LEECH.id && !healVal.overheal) {
      this.totalOneLeech += amount / this.statTracker.currentLeechRating;
    } else if(!hasLeech && this.playerHealthMissing > 0) {
      const bonusFromOneLeech = 1 / this.statTracker.leechRatingPerPercent;
      this.totalOneLeech += healVal.raw * bonusFromOneLeech;
    }
    // endregion

    // Most spells are counted in healing total, but some spells scale not on their own but 'second hand' from other spells
    // I adjust them out of total healing to preserve some accuracy in the "Rating per 1%" stat.
    // Good examples of multiplier spells are Leech and Velens.
    if(!spellInfo.multiplier) {
      this.totalAdjustedHealing += healVal.effective;
    }

    // Multiplier spells and explicitly ignored spells aren't counted for weights.
    // If a spell overheals, it could not have healed for more, so we also don't give it a weight because it can't be increased.
    if(spellInfo.multiplier || spellInfo.ignored || healVal.overheal) {
      return;
    }

    // region INT
    if(spellInfo.int) {
      const currInt = this.statTracker.currentIntellectRating;
      const bonusFromOneInt = (1 / currInt) * ARMOR_INT_MULTIPLIER;
      this.totalOneInt += amount * bonusFromOneInt;
    }
    // endregion

    // region CRIT
    if(spellInfo.crit) {
      const bonusFromOneCrit = 1 / this.statTracker.critRatingPerPercent;
      if(spellId === SPELLS.LIVING_SEED.id) {
        // Living Seed doesn't crit, but it procs from crits only. This calculation approximates increased LS frequency due to more crits.
        const additionalLivingSeedChance = bonusFromOneCrit / this.statTracker.currentCritRating;
        this.totalOneCrit += additionalLivingSeedChance * amount;
      } else {
        const critMult = this.critEffectBonus.getBonus(event);
        const noCritHealing = event.hitType === HIT_TYPES.CRIT ? amount / critMult : amount;
        this.totalOneCrit += noCritHealing * bonusFromOneCrit * (critMult - 1);
      }
    }
    // endregion

    // region HASTE
    if(spellInfo.hasteHpm) {
      const bonusFromOneHaste = 1 / this.statTracker.hasteRatingPerPercent;
      const noHasteHealing = amount / (1 + this.statTracker.currentHastePercentage);
      this.totalOneHasteHpm += bonusFromOneHaste * noHasteHealing;
    }
    // endregion

    // FIXME Previous hasteHpct calculation was unsatisfactory. Excluding entirely for now.

    // region MASTERY
    if(spellInfo.mastery) {
      const bonusFromOneMastery = 1 / this.statTracker.masteryRatingPerPercent;
      const hotCount = target.activeBuffs()
          .map(buffObj => buffObj.ability.guid)
          .filter(buffId => getSpellInfo(buffId).masteryStack)
          .length;
      const noMasteryHealing = amount / (1 + (this.statTracker.currentMasteryPercentage * hotCount));
      this.totalOneMastery += noMasteryHealing * bonusFromOneMastery * hotCount;
    }
    // endregion

    // region VERS
    if(spellInfo.vers) {
      const bonusFromOneVers = 1 / this.statTracker.versatilityRatingPerPercent;
      const noVersHealing = amount / (1 + this.statTracker.currentVersatilityPercentage);
      this.totalOneVers += noVersHealing * bonusFromOneVers;
    }
    // endregion
  }

  _handleDamage(event, damageVal) {
    const amount = damageVal.effective;
    const currVersDrPerc = this.statTracker.currentVersatilityPercentage / 2;
    const bonusFromOneVersDr = (1 / this.statTracker.versatilityRatingPerPercent) / 2;

    const noVersDamage = amount / (1 - currVersDrPerc);
    this.totalOneVersDr += noVersDamage * bonusFromOneVersDr;
  }

  on_finished() {
    if(DEBUG) {
      console.log(`Int - ${formatNumber(this.totalOneInt)}`);
      console.log(`Crit - ${formatNumber(this.totalOneCrit)}`);
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
    const intWeight = this.totalOneInt / this.totalOneInt;
    const critWeight = this.totalOneCrit / this.totalOneInt;
    const hasteHpmWeight = this.totalOneHasteHpm / this.totalOneInt;
    const masteryWeight = this.totalOneMastery / this.totalOneInt;
    const versWeight = this.totalOneVers / this.totalOneInt;
    const versDrWeight = (this.totalOneVers + this.totalOneVersDr) / this.totalOneInt;
    const leechWeight = this.totalOneLeech / this.totalOneInt;

    const intForOnePercent = this._ratingPerOnePercent(this.totalOneInt);
    const critForOnePercent = this._ratingPerOnePercent(this.totalOneCrit);
    const hasteHpmForOnePercent = this._ratingPerOnePercent(this.totalOneHasteHpm);
    const masteryForOnePercent = this._ratingPerOnePercent(this.totalOneMastery);
    const versForOnePercent = this._ratingPerOnePercent(this.totalOneVers);
    const versDrForOnePercent = this._ratingPerOnePercent(this.totalOneVers + this.totalOneVersDr);
    const leechForOnePercent = this._ratingPerOnePercent(this.totalOneLeech);

    const hasteHpmTooltip = "HPM stands for 'Healing per Mana'. In valuing Haste, it considers only the faster HoT ticking and not the reduced cast times. Effectively it models haste's bonus to mana efficiency. This is typically the better calculation to use for raid encounters where mana is an issue.";
    const versTooltip = "Weight includes only the boost to healing, and does not include damage reduction.";
    const versDrTooltip = "Weight includes both healing boost and damage reduction, counting damage reduction as additional throughput";

    return [
      { stat:'Intellect', weight:intWeight, ratingForOne:intForOnePercent },
      { stat:'Crit', weight:critWeight, ratingForOne:critForOnePercent },
      { stat:'Haste (HPM)', weight:hasteHpmWeight, ratingForOne:hasteHpmForOnePercent, tooltip:hasteHpmTooltip },
      { stat:'Mastery', weight:masteryWeight, ratingForOne:masteryForOnePercent },
      { stat:'Versatility', weight:versWeight, ratingForOne:versForOnePercent, tooltip:versTooltip },
      { stat:'Versatility (incl DR)', weight:versDrWeight, ratingForOne:versDrForOnePercent, tooltip:versDrTooltip },
      { stat: 'Leech', weight:leechWeight, ratingForOne:leechForOnePercent },
    ];
  }

  extraPanel() {
    const results = this._prepareResults();
    return (
      <div className="panel items">
      <div className="panel-heading">
        <h2><dfn data-tip="Weights are calculated using the actual circumstances of this encounter. Weights are likely to differ based on fight, raid size, items used, talents chosen, etc.">Stat Weights</dfn>
        </h2>
      </div>
      <div className="panel-body" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ minWidth: 30 }}><b>Stat</b></th>
                <th style={{ minWidth: 30 }}><dfn data-tip="Normalized so Intellect is always 1.00"><b>Weight</b></dfn></th>
                <th style={{ minWidth: 30 }}><dfn data-tip="Amount of stat rating required to increase your total healing by 1%"><b>Rating per 1%</b></dfn></th>
              </tr>
            </thead>
            <tbody>
              {results.map(row => (
                <tr>
                  {row.tooltip ? (<td><dfn data-tip={row.tooltip}>{row.stat}</dfn></td>) : (<td>{row.stat}</td>)}
                  <td>{row.weight ? row.weight.toFixed(2) : "???"}</td>
                  <td>{row.ratingForOne ? formatNumber(row.ratingForOne) : "???"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

}

export default StatWeights;
