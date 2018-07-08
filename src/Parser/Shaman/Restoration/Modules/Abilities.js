import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';
import CoreAbilities from 'Parser/Core/Modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.combatants.selected;
    return [
      // Riptide with EotE
      {
        spell: SPELLS.RIPTIDE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        charges: 2,
        cooldown: 6,
        enabled: combatant.hasTalent(SPELLS.ECHO_OF_THE_ELEMENTS_TALENT.id) || combatant.hasFinger(ITEMS.SOUL_OF_THE_FARSEER.id),
        timelineSortIndex: 11,
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.50,
          averageIssueEfficiency: 0.70,
          recommendedEfficiency: 0.90,
        },
      },
      // Riptide without EotE
      {
        spell: SPELLS.RIPTIDE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 6,
        enabled: !(combatant.hasTalent(SPELLS.ECHO_OF_THE_ELEMENTS_TALENT.id) || combatant.hasFinger(ITEMS.SOUL_OF_THE_FARSEER.id)),
        timelineSortIndex: 11,
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.30,
          averageIssueEfficiency: 0.50,
          recommendedEfficiency: 0.70,
        },
      },
      {
        spell: SPELLS.HEALING_STREAM_TOTEM_CAST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isDefensive: true,
        charges: combatant.hasTalent(SPELLS.ECHO_OF_THE_ELEMENTS_TALENT.id) || combatant.hasFinger(ITEMS.SOUL_OF_THE_FARSEER.id) ? 2 : 1,
        timelineSortIndex: 18,
        isOnGCD: true,
        cooldown: (haste, combatant) => {
          const has4PT19 = combatant.hasBuff(SPELLS.RESTORATION_SHAMAN_T19_4SET_BONUS_BUFF.id);

          if (!has4PT19) {
            return 30;
          }

          const abilityTracker = combatant.owner.modules.abilityTracker;

          const riptideCasts = abilityTracker.getAbility(SPELLS.RIPTIDE.id).casts || 0;
          const chainHealCasts = abilityTracker.getAbility(SPELLS.CHAIN_HEAL.id).casts || 0;
          const reducedCD = 3 * (riptideCasts + chainHealCasts);
          const extraHsts = reducedCD / 30;

          const fightDuration = combatant.owner.fightDuration / 1000;
          const potentialHstCasts = fightDuration / 30 + 1;
          const newPotentialHstCasts = potentialHstCasts + extraHsts;

          const cooldown = fightDuration / newPotentialHstCasts;

          return cooldown;
        },
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.50,
          averageIssueEfficiency: 0.70,
          recommendedEfficiency: 0.90,
        },
      },
      {
        spell: SPELLS.ASTRAL_SHIFT,
        buffSpellId: SPELLS.ASTRAL_SHIFT.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        timelineSortIndex: 82,
        cooldown: 90,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.6,
          importance: ISSUE_IMPORTANCE.MINOR,
        },
      },
      {
        spell: SPELLS.HEALING_RAIN_CAST,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 10,
        timelineSortIndex: 17,
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.30,
          averageIssueEfficiency: 0.50,
          recommendedEfficiency: 0.70,
        },
      },
      {
        spell: SPELLS.WELLSPRING_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 20,
        timelineSortIndex: 20,
        isOnGCD: true,
        enabled: combatant.lv100Talent === SPELLS.WELLSPRING_TALENT.id,
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.30,
          averageIssueEfficiency: 0.50,
          recommendedEfficiency: 0.70,
        },
      },
      {
        spell: SPELLS.GIFT_OF_THE_QUEEN,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 45,
        timelineSortIndex: 20,
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.3,
          averageIssueEfficiency: 0.5,
          recommendedEfficiency: 0.7,
        },
      },
      {
        spell: SPELLS.CLOUDBURST_TOTEM_TALENT,
        buffSpellId: SPELLS.CLOUDBURST_TOTEM_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 30,
        timelineSortIndex: 16,
        isOnGCD: true,
        enabled: combatant.lv90Talent === SPELLS.CLOUDBURST_TOTEM_TALENT.id,
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.50,
          averageIssueEfficiency: 0.70,
          recommendedEfficiency: 0.90,
        },
      },
      {
        spell: SPELLS.EARTHEN_SHIELD_TOTEM_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 60,
        timelineSortIndex: 20,
        isOnGCD: true,
        enabled: combatant.lv75Talent === SPELLS.EARTHEN_SHIELD_TOTEM_TALENT.id,
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.50,
          averageIssueEfficiency: 0.70,
          recommendedEfficiency: 0.90,
        },
      },
      {
        spell: SPELLS.UNLEASH_LIFE_TALENT,
        buffSpellId: SPELLS.UNLEASH_LIFE_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 15,
        timelineSortIndex: 5,
        isOnGCD: true,
        enabled: combatant.lv15Talent === SPELLS.UNLEASH_LIFE_TALENT.id,
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.50,
          averageIssueEfficiency: 0.70,
          recommendedEfficiency: 0.90,
        },
      },
      {
        spell: SPELLS.ANCESTRAL_GUIDANCE_TALENT,
        buffSpellId: SPELLS.ANCESTRAL_GUIDANCE_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120,
        enabled: combatant.lv60Talent === SPELLS.ANCESTRAL_GUIDANCE_TALENT.id,
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.4,
          averageIssueEfficiency: 0.6,
          recommendedEfficiency: 0.8,
        },
      },
      {
        spell: SPELLS.ASCENDANCE_TALENT_RESTORATION,
        buffSpellId: SPELLS.ASCENDANCE_TALENT_RESTORATION.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        enabled: combatant.lv100Talent === SPELLS.ASCENDANCE_TALENT_RESTORATION.id,
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.2,
          averageIssueEfficiency: 0.5,
          recommendedEfficiency: 0.8,
        },
      },
      {
        spell: SPELLS.HEALING_TIDE_TOTEM_CAST,
        buffSpellId: SPELLS.HEALING_TIDE_TOTEM_CAST.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.2,
          averageIssueEfficiency: 0.5,
          recommendedEfficiency: 0.8,
        },
      },
      {
        spell: SPELLS.SPIRIT_LINK_TOTEM,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.2,
          averageIssueEfficiency: 0.4,
          recommendedEfficiency: 0.6,
        },
      },
      {
        spell: SPELLS.HEALING_WAVE,
        timelineSortIndex: 13,
        isOnGCD: true,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        castEfficiency: {
          casts: castCount => (castCount.casts || 0) - (castCount.healingTwHits || 0),
        },
      },
      {
        spell: SPELLS.HEALING_WAVE,
        name: `Tidal Waved ${SPELLS.HEALING_WAVE.name}`,
        timelineSortIndex: 13,
        isOnGCD: true,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        castEfficiency: {
          casts: castCount => castCount.healingTwHits || 0,
        },
      },
      {
        spell: SPELLS.HEALING_SURGE_RESTORATION,
        timelineSortIndex: 14,
        isOnGCD: true,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        castEfficiency: {
          casts: castCount => (castCount.casts || 0) - (castCount.healingTwHits || 0),
        },
      },
      {
        spell: SPELLS.HEALING_SURGE_RESTORATION,
        name: `Tidal Waved ${SPELLS.HEALING_SURGE_RESTORATION.name}`,
        timelineSortIndex: 14,
        isOnGCD: true,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        castEfficiency: {
          casts: castCount => castCount.healingTwHits || 0,
        },
      },
      {
        spell: SPELLS.CHAIN_HEAL,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        timelineSortIndex: 12,
        isOnGCD: true,
      },
      {
        spell: SPELLS.PURIFY_SPIRIT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        timelineSortIndex: 80,
        cooldown: 8,
        isOnGCD: true,
      },
      {
        spell: SPELLS.FLAME_SHOCK_RESTORATION,
        buffSpellId: SPELLS.FLAME_SHOCK_RESTORATION.id,
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        timelineSortIndex: 60,
        cooldown: 6,
        isOnGCD: true,
      },
      {
        spell: SPELLS.LAVA_BURST,
        buffSpellId: SPELLS.LAVA_SURGE.id,
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        charges: combatant.hasTalent(SPELLS.ECHO_OF_THE_ELEMENTS_TALENT.id) || combatant.hasFinger(ITEMS.SOUL_OF_THE_FARSEER.id) ? 2 : 1,
        timelineSortIndex: 60,
        cooldown: 8,
        isOnGCD: true,
      },
      {
        spell: SPELLS.LIGHTNING_BOLT_RESTORATION,
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        isOnGCD: true,
        timelineSortIndex: 60,
      },
      {
        spell: SPELLS.GHOST_WOLF,
        buffSpellId: SPELLS.GHOST_WOLF.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        timelineSortIndex: 80,
        isOnGCD: true,
      },
      {
        spell: SPELLS.SPIRITWALKERS_GRACE,
        buffSpellId: SPELLS.SPIRITWALKERS_GRACE.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: combatant.hasTalent(SPELLS.GRACEFUL_SPIRIT_TALENT.id) ? 60 : 120,
        timelineSortIndex: 81,
      },
      {
        spell: SPELLS.EARTHBIND_TOTEM,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        timelineSortIndex: 80,
        isOnGCD: true,
        cooldown: 30,
      },
      {
        spell: SPELLS.PURGE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        timelineSortIndex: 80,
        isOnGCD: true,
      },
      {
        spell: SPELLS.GUST_OF_WIND_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        timelineSortIndex: 81,
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.GUST_OF_WIND_TALENT.id),
        cooldown: 15,
      },
      {
        spell: SPELLS.LIGHTNING_SURGE_TOTEM_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        timelineSortIndex: 80,
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.LIGHTNING_SURGE_TOTEM_TALENT.id),
        cooldown: 45,
      },
      {
        spell: SPELLS.VOODOO_TOTEM_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        timelineSortIndex: 80,
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.VOODOO_TOTEM_TALENT.id),
        cooldown: 30,
      },
      {
        spell: SPELLS.WIND_RUSH_TOTEM_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        timelineSortIndex: 80,
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.WIND_RUSH_TOTEM_TALENT.id),
        cooldown: 120,
      }, 
      {
        spell: SPELLS.EARTHGRAB_TOTEM_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        timelineSortIndex: 80,
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.EARTHGRAB_TOTEM_TALENT.id),
        cooldown: 30,
      }, 
      {
        spell: SPELLS.ANCESTRAL_PROTECTION_TOTEM_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.ANCESTRAL_PROTECTION_TOTEM_TALENT.id),
        cooldown: 300,
      },
      {
        spell: SPELLS.REINCARNATION,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: combatant.traitsBySpellId[SPELLS.SERVANT_OF_THE_QUEEN.id] ? 1200 : 1800,
      },
      {
        spell: SPELLS.WIND_SHEAR, 
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        timelineSortIndex: 80,
        cooldown: 12,
      },
      {
        spell: [SPELLS.HEX, SPELLS.HEX_RAPTOR, SPELLS.HEX_SNAKE, SPELLS.HEX_SPIDER, SPELLS.HEX_COCKROACH, SPELLS.HEX_SKELETAL],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
        timelineSortIndex: 80,
        cooldown: 30,
      },
    ];
  }
}

export default Abilities;
