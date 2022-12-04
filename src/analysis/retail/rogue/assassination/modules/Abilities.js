import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/rogue';
import COVENANTS from 'game/shadowlands/COVENANTS';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      // Rotational
      {
        spell: SPELLS.ENVENOM.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1000,
        },
        buffSpellId: SPELLS.ENVENOM.id,
      },
      {
        spell: SPELLS.GARROTE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        // During the Subterfuge buff (from the talent), the spell has no cd
        cooldown: () => {
          if (!combatant.hasTalent(SPELLS.SUBTERFUGE_TALENT.id)) {
            return 6;
          } else {
            const hasStealth =
              combatant.hasBuff(SPELLS.SUBTERFUGE_BUFF.id) ||
              combatant.hasBuff(SPELLS.STEALTH.id) ||
              combatant.hasBuff(SPELLS.STEALTH_BUFF.id) ||
              combatant.hasBuff(SPELLS.VANISH_BUFF.id);
            return hasStealth ? 0 : 6;
          }
        },
        gcd: {
          static: 1000,
        },
        buffSpellId: SPELLS.GARROTE.id,
      },
      {
        spell: SPELLS.SHIV.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1000,
        },
      },
      {
        spell: SPELLS.SLICE_AND_DICE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1000,
        },
      },
      {
        spell: SPELLS.MUTILATE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.POISONED_KNIFE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.RUPTURE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1000,
        },
        buffSpellId: SPELLS.RUPTURE.id,
      },
      {
        spell: SPELLS.BLINDSIDE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: TALENTS.MARKED_FOR_DEATH_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 30,
        gcd: null,
        castEfficiency: {
          suggestion: true,
        },
        enabled: combatant.hasTalent(TALENTS.MARKED_FOR_DEATH_TALENT.id),
      },
      {
        spell: SPELLS.CRIMSON_TEMPEST_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: {
          static: 1000,
        },
        buffSpellId: SPELLS.CRIMSON_TEMPEST_TALENT.id,
        enabled: combatant.hasTalent(SPELLS.CRIMSON_TEMPEST_TALENT.id),
      },
      // Rotational AOE
      {
        spell: SPELLS.FAN_OF_KNIVES.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: {
          static: 1000,
        },
      },
      // Cooldowns
      {
        spell: SPELLS.VENDETTA.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 120,
        castEfficiency: {
          suggestion: true,
        },
        gcd: {
          base: 1000,
        },
        buffSpellId: SPELLS.VENDETTA.id,
      },
      {
        spell: SPELLS.VANISH.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 120,
        castEfficiency: {
          suggestion: true,
        },
        buffSpellId: combatant.hasTalent(SPELLS.SUBTERFUGE_TALENT.id)
          ? SPELLS.SUBTERFUGE_BUFF.id
          : SPELLS.MASTER_ASSASSIN_BUFF.id,
      },
      {
        spell: SPELLS.EXSANGUINATE_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 45,
        gcd: {
          static: 1000,
        },
        enabled: combatant.hasTalent(SPELLS.EXSANGUINATE_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: TALENTS.SEPSIS_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: false,
        cooldown: 90,
        gcd: {
          base: 1000,
        },
        castEfficiency: {
          suggestion: true,
        },
      },
      // Defensive
      {
        spell: SPELLS.CLOAK_OF_SHADOWS.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 120,
        gcd: null,
        buffSpellId: SPELLS.CLOAK_OF_SHADOWS.id,
      },
      {
        spell: SPELLS.CRIMSON_VIAL.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 30,
        gcd: {
          base: 1000,
        },
        buffSpellId: SPELLS.CRIMSON_VIAL.id,
      },
      {
        spell: SPELLS.EVASION.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        buffSpellId: SPELLS.EVASION.id,
        cooldown: 120,
        gcd: null,
      },
      {
        spell: SPELLS.FEINT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        buffSpellId: SPELLS.FEINT.id,
        cooldown: 15,
        gcd: {
          static: 1000,
        },
      },
      // Others
      {
        spell: SPELLS.DEADLY_POISON.id,
        category: SPELL_CATEGORY.OTHERS,
      },
      {
        spell: SPELLS.WOUND_POISON.id,
        category: SPELL_CATEGORY.OTHERS,
      },
      {
        spell: SPELLS.CRIPPLING_POISON.id,
        category: SPELL_CATEGORY.OTHERS,
      },
      // Utility
      {
        spell: SPELLS.SHADOWSTEP.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        gcd: null,
        buffSpellId: SPELLS.SHADOWSTEP.id,
      },
      {
        spell: SPELLS.SPRINT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60,
        gcd: null,
        buffSpellId: SPELLS.SPRINT.id,
      },
      {
        spell: SPELLS.TRICKS_OF_THE_TRADE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        gcd: null,
      },
      {
        spell: SPELLS.BLIND.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 120,
        gcd: {
          static: 1000,
        },
        buffSpellId: SPELLS.BLIND.id,
      },
      {
        spell: SPELLS.CHEAP_SHOT.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          static: 1000,
        },
        buffSpellId: SPELLS.CHEAP_SHOT.id,
      },
      {
        spell: SPELLS.DISTRACT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.KICK.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 15,
        gcd: null,
      },
      {
        spell: SPELLS.KIDNEY_SHOT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 20,
        gcd: {
          static: 1000,
        },
        buffSpellId: SPELLS.KIDNEY_SHOT.id,
      },
      {
        spell: SPELLS.SHROUD_OF_CONCEALMENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 6 * 60,
        gcd: {
          base: 1000,
        },
        buffSpellId: SPELLS.SHROUD_OF_CONCEALMENT.id,
      },
      {
        spell: SPELLS.SAP.id,
        category: SPELL_CATEGORY.UTILITY,
        buffSpellId: SPELLS.SAP.id,
      },
      {
        spell: SPELLS.PICK_LOCK.id,
        category: SPELL_CATEGORY.UTILITY,
      },
      {
        spell: SPELLS.PICK_POCKET.id,
        category: SPELL_CATEGORY.UTILITY,
        // While this actually has a 0.5s CD, it shows up weird in the Abilities tab if we set that
      },
      // Covenant Abilities
      {
        spell: TALENTS.SEPSIS_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          base: 1000,
        },
        cooldown: 90,
        enabled: false,
      },
      {
        spell: SPELLS.ECHOING_REPRIMAND.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1000,
        },
        cooldown: 45,
        enabled: false,
      },
      {
        spell: SPELLS.SERRATED_BONE_SPIKE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1000,
        },
        cooldown: 30,
        enabled: false,
      },
    ];
  }
}

export default Abilities;
