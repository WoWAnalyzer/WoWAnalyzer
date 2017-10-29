import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';

import CoreStatWeights from 'Parser/Core/Modules/Features/StatWeights';
import STAT from 'Parser/Core/Modules/Features/STAT';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import Combatants from 'Parser/Core/Modules/Combatants';
import HealingValue from 'Parser/Core/Modules/HealingValue';
import DamageValue from 'Parser/Core/Modules/DamageValue';
import CritEffectBonus from 'Parser/Core/Modules/Helpers/CritEffectBonus';
import StatTracker from 'Parser/Core/Modules/StatTracker';

import SPELL_INFO from './StatWeightsSpellInfo';
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
class StatWeights extends CoreStatWeights {
  static dependencies = {
    combatants: Combatants,
    critEffectBonus: CritEffectBonus,
    statTracker: StatTracker,
    masteryEffectiveness: MasteryEffectiveness, // this added the `masteryEffectiveness` property to spells that are affected by Mastery
  };

  spellInfo = SPELL_INFO;

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
    const spellInfo = this._getSpellInfo(originalHeal);
    const healVal = new HealingValue(event.amount, event.absorbed, event.overheal);
    this._handleHeal(spellInfo, originalHeal, healVal);
  }
  _handleHealEvent(event, healVal) {
    const spellInfo = this._getSpellInfo(event);
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

    this.totalOneLeech += this._leech(event, healVal);

    if (spellInfo.multiplier) {
      // Multiplier spells aren't counted for weights because they don't **directly** benefit from stat weights
      return;
    }

    if (spellInfo.int) {
      this.totalOneInt += this._intellect(event, healVal);
    }
    if (spellInfo.crit) {
      this.totalOneCrit += this._criticalStrike(event, healVal);
    }
    if (spellInfo.hasteHpct) {
      this.totalOneHasteHpct += this._hasteHpct(event, healVal);
    }
    if (spellInfo.mastery) {
      this.totalOneMastery += this._mastery(event, healVal);
    }
    if (spellInfo.vers) {
      this.totalOneVers += this._versatility(event, healVal);
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
        return healVal.effective / this.statTracker.currentLeechRating; // TODO: Make a generic method to account for base percentage
      }
    } else {
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
    const healIncreaseFromOneInt = (1 * ARMOR_INT_MULTIPLIER) / currInt;
    return healVal.effective * healIncreaseFromOneInt;
  }
  _criticalStrike(event, healVal) {
    return this._criticalStrikeEffectiveHealing(event, healVal) + this._criticalStrikeInfusionOfLightProcs(event, healVal);
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
  _criticalStrikeInfusionOfLightProcs(event, healVal) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.FLASH_OF_LIGHT.id && spellId !== SPELLS.HOLY_LIGHT.id) {
      return 0;
    }
    const hasIol = this.combatants.selected.hasBuff(SPELLS.INFUSION_OF_LIGHT.id, event.timestamp, INFUSION_OF_LIGHT_BUFF_EXPIRATION_BUFFER, INFUSION_OF_LIGHT_BUFF_MINIMAL_ACTIVE_TIME);
    if (!hasIol) {
      return 0;
    }

    if (spellId === SPELLS.FLASH_OF_LIGHT.id) {
      const regularHeal = healVal.raw / (1 + INFUSION_OF_LIGHT_FOL_HEALING_INCREASE);
      const effectiveIolHealing = Math.max(0, healVal.effective - regularHeal);

      const { baseCritChance, ratingCritChance } = this._getCritChance(event);

      const totalCritChance = baseCritChance + ratingCritChance;
      if (totalCritChance > (1 + 1 / this.statTracker.critRatingPerPercent)) {
        // If the crit chance was more than 100%+1 rating, then the last rating was over the cap and worth 0.
        return 0;
      }
      const ratingCritChanceContribution = 1 - baseCritChance / totalCritChance;

      return effectiveIolHealing * ratingCritChanceContribution / this.statTracker.currentCritRating;
    }
    if (spellId === SPELLS.HOLY_LIGHT.id) {
      // TODO: We might be able to use the Haste stat weight to value the CDR
      return 0;
    }
  }
  _hasteHpct(event, healVal) {
    if (healVal.effective === 0) {
      // While Haste does not directly increase overhealing (or any overhealing in a measurable way), casting a spell that does 0 healing is useless regardless. Being able to cast that one spell more because of the player's Haste gained us no useful output. Note that the (effective) beacon transfer healing caused by this spell will still be added to the Haste value separately.
      return 0;
    }

    const healIncreaseFromOneHaste = 1 / this.statTracker.hasteRatingPerPercent;

    return healVal.effective * healIncreaseFromOneHaste;
  }
  _mastery(event, healVal) {
    if (healVal.overheal) {
      // If a spell overheals, it could not have healed for more. Seeing as Mastery only adds HP on top of the existing heal we can skip it as increasing the power of this heal would only be more overhealing.
      return 0;
    }
    if (event.masteryEffectiveness === undefined) {
      console.error('This spell does not have a known masteryEffectiveness:', event.ability.guid, event.ability.name);
      return 0;
    }

    const masteryEffectiveness = event.masteryEffectiveness;
    const healIncreaseFromOneMastery = 1 / this.statTracker.masteryRatingPerPercent * masteryEffectiveness;
    const baseHeal = healVal.effective / (1 + this.statTracker.currentMasteryPercentage * masteryEffectiveness);

    return baseHeal * healIncreaseFromOneMastery;
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
    this.totalOneVersDr += this._versatilityDamageReduction(event, damageVal);
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
      this.playerHealthMissing = event.maxHitPoints - event.hitPoints; // TODO: Verify if the `amount` is already included, and leave a comment here stating the results
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
        stat: STAT.INTELLECT,
        gain: this.totalOneInt,
      },
      {
        stat: STAT.CRITICAL_STRIKE,
        gain: this.totalOneCrit,
      },
      {
        stat: STAT.HASTE_HPCT,
        gain: this.totalOneHasteHpct,
        tooltip: `
          HPCT stands for "Healing per Cast Time". This is the value that 1% Haste would be worth if you would cast everything you are already casting (and that can be casted quicker) 1% faster. Mana is not accounted for in any way and you should consider the Haste stat weight 0 if you run out of mana while doing everything else right.<br /><br />

          The real worth of Haste might be a bit higher when it causes you to fit more things into static buff durations such as Avenging Wrath, Aura Mastery and other buffs.
        `,
      },
      // {
      //   stat: STAT.HASTE_HPM,
      //   className: 'stat-haste',
      //   gain: this.totalOneHasteHpm,
      //   tooltip: 'HPM stands for "Healing per Mana". In valuing Haste, it considers only the faster HoT ticking and not the reduced cast times. Effectively it models haste\'s bonus to mana efficiency. This is typically the better calculation to use for raid encounters where mana is an issue.',
      // },
      {
        stat: STAT.MASTERY,
        gain: this.totalOneMastery,
      },
      {
        stat: STAT.VERSATILITY,
        gain: this.totalOneVers,
        tooltip: 'Weight includes only the boost to healing, and does not include the damage reduction.',
      },
      {
        stat: STAT.VERSATILITY_DR,
        gain: this.totalOneVers + this.totalOneVersDr,
        tooltip: 'Weight includes both healing boost and damage reduction, counting damage reduction as additional throughput.',
      },
      {
        stat: STAT.LEECH,
        gain: this.totalOneLeech,
      },
    ];
  }
}

export default StatWeights;
