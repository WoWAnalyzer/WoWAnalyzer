// TODO: Move this to the CastEfficiency class

export function calculateMaxCasts(cooldown, fightDuration, charges = 1) {
  return (fightDuration / 1000 / cooldown) + charges - 1;
}

export default function getCastEfficiency(CPM_ABILITIES, abilityTracker, combatants, parser) {
  const fightDuration = parser.fightDuration;
  const minutes = fightDuration / 1000 / 60;

  const getAbility = spellId => abilityTracker.getAbility(spellId);

  const selectedCombatant = combatants.selected;
  if (!selectedCombatant) {
    return null;
  }

  const hastePercentage = selectedCombatant.hastePercentage;

  return CPM_ABILITIES
    .filter(ability => !ability.isActive || ability.isActive(selectedCombatant))
    .map(ability => {
      const castCount = getAbility(ability.spell.id);
      const casts = (ability.getCasts ? ability.getCasts(castCount, parser) : castCount.casts) || 0;
      if (ability.hideWithZeroCasts && casts === 0) {
        return null;
      }
      const cpm = casts / minutes;

      const cooldown = ability.getCooldown(hastePercentage, selectedCombatant);
      // By dividing the fight duration by the cooldown we get the max amount of casts during this particular fight, we round this up because you would be able to cast once at the start of the fight and once at the end since abilities always start off cooldown (e.g. fight is 100 seconds long, you could cast 2 Holy Avengers with a 90 sec cooldown). Good players should be able to reasonably predict this and maximize their casts.
      // Charges don't increase the cooldown recharge rate, they just allow you to store casts for later and give you `charges` addition uses at the start of the fight
      let rawMaxCasts = calculateMaxCasts(cooldown, fightDuration, ability.charges);
      if (ability.getMaxCasts) {
        rawMaxCasts = ability.getMaxCasts(cooldown, fightDuration, getAbility, parser);
      }
      const maxCasts = Math.ceil(rawMaxCasts);
      const maxCpm = cooldown === null ? null : maxCasts / minutes;
      // The reason cast efficiency is based on the `rawMaxCasts` is that it you usually want to save cooldowns for periods where there is a lot of damage coming. Instead of adding a static buffer, this is more dynamic in that if you had 90% of the cooldown time to cast it you probably could have found a good moment, while if you only had 10% of the time then it isn't as likely there was a good opportunity. By making this based on the cooldown time, this scales with the strength of the cooldown; a 1.5 min cooldown is weaker than a 3 min cooldown.
      const castEfficiency = cooldown === null ? null : Math.min(1, casts / rawMaxCasts);

      const recommendedCastEfficiency = ability.recommendedCastEfficiency || 0.8;
      const averageIssueCastEfficiency = ability.averageIssueCastEfficiency || (recommendedCastEfficiency - 0.05);
      const majorIssueCastEfficiency = ability.majorIssueCastEfficiency || (recommendedCastEfficiency - 0.15);

      const canBeImproved = castEfficiency !== null && castEfficiency < recommendedCastEfficiency;

      let overhealing = null;
      if (ability.getOverhealing) {
        overhealing = ability.getOverhealing(castCount, getAbility, parser);
        if (overhealing !== null) {
          overhealing = overhealing || 0; // prevent NaN
        }
      } else {
        const rawHealing = castCount.healingEffective + castCount.healingAbsorbed + castCount.healingOverheal;
        if (rawHealing > 0) {
          overhealing = castCount.healingOverheal / rawHealing;
        }
      }

      return {
        ability,
        cpm,
        maxCpm,
        casts,
        maxCasts,
        overhealing,
        castEfficiency,
        recommendedCastEfficiency,
        averageIssueCastEfficiency,
        majorIssueCastEfficiency,
        canBeImproved,
      };
    })
    .filter(item => item !== null);
}
