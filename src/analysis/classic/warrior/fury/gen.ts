import genAbilities from 'parser/core/modules/genAbilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import spells from './spell-list_Warrior_Fury.classic';

export const Abilities = genAbilities({
  allSpells: Object.values(spells),
  rotational: [
    spells.BLOODTHIRST,
    spells.RAGING_BLOW,
    spells.WILD_STRIKE,
    spells.HEROIC_STRIKE,
    spells.EXECUTE,
    spells.COLOSSUS_SMASH,
    spells.WHIRLWIND,
    spells.CLEAVE,
  ],
  cooldowns: [
    spells.RECKLESSNESS,
    spells.AVATAR_TALENT,
    spells.BLOODBATH_TALENT,
    spells.STORM_BOLT_TALENT,
    spells.DRAGON_ROAR_TALENT,
    spells.SKULL_BANNER,
  ],
  defensives: [
    spells.ENRAGED_REGENERATION_TALENT,
    spells.DIE_BY_THE_SWORD,
    spells.RALLYING_CRY,
    spells.DEMORALIZING_BANNER,
    spells.MASS_SPELL_REFLECTION_TALENT,
    spells.SAFEGUARD_TALENT,
    spells.VIGILANCE_TALENT,
    spells.SHIELD_WALL,
    spells.SPELL_REFLECTION,
    spells.INTIMIDATING_SHOUT,
  ],
  overrides: {
    [spells.WHIRLWIND.id]: (_combatant, generated) => ({
      ...generated,
      category: SPELL_CATEGORY.ROTATIONAL_AOE,
    }),
    // Cleave and Heroic Strike are off-GCD rage dumps with no real cooldown. The
    // 1.5s "cooldown" in the generated data is a swing-timer/GCD artifact; left as-is
    // it makes cast efficiency compute a nonsense max (fightDuration / 1.5s). Drop it
    // so they show a plain cast count like Whirlwind.
    [spells.CLEAVE.id]: (_combatant, generated) => ({
      ...generated,
      category: SPELL_CATEGORY.ROTATIONAL_AOE,
      cooldown: undefined,
    }),
    [spells.HEROIC_STRIKE.id]: (_combatant, generated) => ({
      ...generated,
      cooldown: undefined,
    }),
    // Bladestorm is an AOE-only DPS cooldown (the MoP Fury APL only casts it when
    // numberTargets > 1). On single-target fights it is correctly never used, so
    // grouping it with on-cooldown cooldowns made it read as a missed "0/N casts"
    // cooldown. Present it as a situational AOE spell (plain cast count, no cast
    // efficiency) instead.
    [spells.BLADESTORM_TALENT.id]: (_combatant, generated) => ({
      ...generated,
      category: SPELL_CATEGORY.ROTATIONAL_AOE,
      cooldown: undefined,
    }),
  },
});
