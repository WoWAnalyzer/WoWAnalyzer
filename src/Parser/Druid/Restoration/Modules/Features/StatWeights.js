import SPELLS from 'common/SPELLS';
import STAT from 'Parser/Core/Modules/Features/STAT';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';

import BaseHealerStatValues from 'Parser/Core/Modules/Features/BaseHealerStatValues';
import Combatants from 'Parser/Core/Modules/Combatants';
import CritEffectBonus from 'Parser/Core/Modules/Helpers/CritEffectBonus';
import StatTracker from 'Parser/Core/Modules/StatTracker';
import Mastery from '../Core/Mastery';

import { DRUID_HEAL_INFO } from '../../SpellInfo';

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
class StatWeights extends BaseHealerStatValues {
  static dependencies = {
    combatants: Combatants,
    critEffectBonus: CritEffectBonus,
    statTracker: StatTracker,
    mastery: Mastery,
  };

  spellInfo = DRUID_HEAL_INFO;

  _getCritChance(event) {
    const spellId = event.ability.guid;
    const critChanceBreakdown = super._getCritChance(event);

    if (spellId === SPELLS.REGROWTH.id) {
      critChanceBreakdown.baseCritChance += 0.4;
    }

    // TODO handle Abundance

    return critChanceBreakdown;
  }

  _criticalStrike(event, healVal) {
    const spellId = event.ability.guid;
    const bonusFromOneCrit = 1 / this.statTracker.critRatingPerPercent;
    if (spellId === SPELLS.LIVING_SEED.id) { // TODO get better Living Seed calcs from a standalone module
      // Living Seed doesn't crit, but it procs from crits only. This calculation approximates increased LS frequency due to more crits.
      const additionalLivingSeedChance = bonusFromOneCrit / this.statTracker.currentCritRating;
      return additionalLivingSeedChance * healVal.effective;
    } else {
      if (healVal.overheal) {
        return 0;
      }
      const critMult = this.critEffectBonus.getBonus(event);
      const noCritHealing = event.hitType === HIT_TYPES.CRIT ? healVal.effective / critMult : healVal.effective;
      return noCritHealing * bonusFromOneCrit * (critMult - 1);
    }
  }

  _hasteHpm(event, healVal) {
    if (healVal.overheal) {
      return 0;
    }
    return super._hasteHpm(event, healVal);
  }

  _mastery(event, healVal) {
    if (healVal.overheal) {
      return 0;
    }
    const target = this.combatants.getEntity(event);
    if(target === null) {
      return 0;
    }
    const bonusFromOneMastery = 1 / this.statTracker.masteryRatingPerPercent;
    const hotCount = this.mastery.getHotCount(target);
    const noMasteryHealing = healVal.effective / (1 + (this.statTracker.currentMasteryPercentage * hotCount));
    return noMasteryHealing * bonusFromOneMastery * hotCount;
  }

  _prepareResults() {
    return [
      STAT.INTELLECT,
      STAT.CRITICAL_STRIKE,
      // STAT.HASTE_HPCT, // TODO implement
      STAT.HASTE_HPM,
      STAT.MASTERY,
      STAT.VERSATILITY,
      STAT.VERSATILITY_DR,
      STAT.LEECH,
    ];
  }
  _getPawnStats() {
    return {
      Intellect: STAT.INTELLECT,
      CritRating: STAT.CRITICAL_STRIKE,
      HasteRating: STAT.HASTE_HPM,
      MasteryRating: STAT.MASTERY,
      Versatility: STAT.VERSATILITY,
    }
  }

}

export default StatWeights;
