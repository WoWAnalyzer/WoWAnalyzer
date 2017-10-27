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

const DEBUG = true;

const ARMOR_INT_MULTIPLIER = 1.05; // 5% int bonus from wearing all leather means each new point of int worth 1.05 vs character sheet int
const INFUSION_OF_LIGHT_BUFF_EXPIRATION_BUFFER = 150; // the buff expiration can occur several MS before the heal event is logged, this is the buffer time that an IoL charge may have dropped during which it will still be considered active.
const INFUSION_OF_LIGHT_BUFF_MINIMAL_ACTIVE_TIME = 200; // if someone heals with FoL and then immediately casts a HS race conditions may occur. This prevents that (although the buff is probably not applied before the FoL).
const INFUSION_OF_LIGHT_FOL_HEALING_INCREASE = 0.5;

/*
 * Holy Paladin Stat Weights Methodology
 *
 * Approach -
 * This module generates the players stat weights using the actual logged events. We keep a listing of all the player's healing spells
 * along with which stats those spells scales with, and for each stat a heal scales with we do some math to find out
 * how much the last point of that stat contributed in healing. We compare the total healing increases
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
 * For now, I'm handling the most common big Paladin stat buffs manually.
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
 * had it not crit. Special handling is needed for Holy Shock obviously. We assume that higher crit will result in proportionally
 * more Infusion of Lights, and so get the bonus to Infusion of Light as NYI.
 *
 * Haste -
 * NYI
 *
 * Mastery -
 * NYI
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
 * A few special cases are considered.
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
    this._handleHeal(spellInfo, event, healVal);
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
        const healIncreaseFromOneLeech = 1 / 23000;
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
    // Imagine when you average out a fight this is the result with 33% crit chance (10,000 rating) total:
    // ```
    // type effective overheal   raw
    // hit      1,000        0 1,000
    // hit      1,000        0 1,000
    // crit     1,500      500 2,000
    // ```
    // This approach would ignore the two hits completely and focus on the crit.
    // The crit's base healing was `1,000`, the raw crit part `1,000` and `500` of the crit part was effective crit healing. `1` crit rating would be worth `500 / crit rating` if we didn't get a `8%` base crit chance. Doing `500 * (1 - (8% / 33%))` gives us the averaged out value of the crit **rating** alone; `378,79`, dividing this by the crit rating gets us the value per one stat; `378,79 / 10,000 = 0,0379` healing per rating.
    // If we had 9% crit, the 500 effective healing gained from the rating would be just 55 HP after adjusting for base crit chance, which makes sense as only a fraction of the crit is gained from the rating.

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
    // Calculate Haste
    // my current hypothesis is to consider 1% of all healing done with spells with GCDs/channels affected by Haste to be considered the basis for the value of 1% Haste (since 1% Haste allows you to cast these spells 1% more often), but if someone ran OOM at the end of the fight you'd consider the Haste value to be 0.

    // const currHastePerc = this.statTracker.currentHastePercentage;
    // const healIncreaseFromOneHaste = 1 / this.statTracker.hasteRatingPerPercent;
    // const noHasteHealing = amount / (1 + currHastePerc);
    // this.totalOneHasteHpm += healIncreaseFromOneHaste * noHasteHealing;
    // NYI
  }
  _mastery(event, healVal) {
    if (healVal.overheal) {
      // If a spell overheals, it could not have healed for more. Seeing as Mastery only adds HP on top of the existing heal we can skip it as increasing the power of this heal would only be more overhealing.
      return;
    }
    // NYI
    // Get mastery effectiveness for this spell, then do same calculation as vers mult by effectiveness
  }
  _versatility(event, healVal) {
    if (healVal.overheal) {
      // If a spell overheals, it could not have healed for more. Seeing as Versatility only adds HP on top of the existing heal we can skip it as increasing the power of this heal would only be more overhealing.
      return;
    }
    const currVersPerc = this.statTracker.currentVersatilityPercentage;
    const healIncreaseFromOneVers = 1 / this.statTracker.versatilityRatingPerPercent;
    const noVersHealing = healVal.effective / (1 + currVersPerc);
    this.totalOneVers += noVersHealing * healIncreaseFromOneVers;
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
    const versTooltip = "Weight includes only the boost to healing, and does not include the damage reduction nor the DPS gain.";
    const versDrTooltip = "Weight includes both healing boost and damage reduction, counting damage reduction as additional throughput. The DPS gain is ignored.";

    return [
      { stat: 'Intellect', weight: intWeight, ratingForOne: intForOnePercent },
      { stat: 'Crit', weight: critWeight, ratingForOne: critForOnePercent },
      { stat: 'Haste (HPM)', weight: hasteHpmWeight, ratingForOne: hasteHpmForOnePercent, tooltip: hasteHpmTooltip },
      { stat: 'Mastery', weight: masteryWeight, ratingForOne: masteryForOnePercent },
      { stat: 'Versatility', weight: versWeight, ratingForOne: versForOnePercent, tooltip: versTooltip },
      { stat: 'Versatility (incl DR)', weight: versDrWeight, ratingForOne: versDrForOnePercent, tooltip: versDrTooltip },
      { stat: 'Leech', weight: leechWeight, ratingForOne: leechForOnePercent },
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
                  <td>{row.weight.toFixed ? row.weight.toFixed(2) : "NYI"}</td>
                  <td>{row.ratingForOne ? (
                    row.ratingForOne === Infinity ? '∞' : formatNumber(row.ratingForOne)
                  ) : 'NYI'}</td>
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
