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
        charges: 2,
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
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 90,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.6,
          importance: ISSUE_IMPORTANCE.MINOR,
        },
      },
      {
        spell: SPELLS.ARCANE_TORRENT_MANA,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 90,
        isUndetectable: true,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.HEALING_RAIN_CAST,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 10,
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
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.6,
          averageIssueEfficiency: 0.8,
          recommendedEfficiency: 0.90,
        },
      },
      {
        spell: SPELLS.CLOUDBURST_TOTEM_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 30,
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
        enabled: combatant.lv75Talent === SPELLS.EARTHEN_SHIELD_TOTEM_TALENT.id,
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.50,
          averageIssueEfficiency: 0.70,
          recommendedEfficiency: 0.90,
        },
      },
      {
        spell: SPELLS.ANCESTRAL_GUIDANCE_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120,
        enabled: combatant.lv60Talent === SPELLS.ANCESTRAL_GUIDANCE_TALENT.id,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.ASCENDANCE_TALENT_RESTORATION,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        enabled: combatant.lv100Talent === SPELLS.ASCENDANCE_TALENT_RESTORATION.id,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.HEALING_TIDE_TOTEM_CAST,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.20,
          averageIssueEfficiency: 0.5,
          recommendedEfficiency: 0.8,
        },
      },
      {
        spell: SPELLS.SPIRIT_LINK_TOTEM,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.2,
          averageIssueEfficiency: 0.5,
          recommendedEfficiency: 0.8,
        },
      },
      {
        spell: SPELLS.HEALING_WAVE,
        name: `Filler ${SPELLS.HEALING_WAVE.name}`,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        castEfficiency: {
          casts: castCount => (castCount.casts || 0) - (castCount.healingTwHits || 0),
        },
      },
      {
        spell: SPELLS.HEALING_WAVE,
        name: `Tidal Waves ${SPELLS.HEALING_WAVE.name}`,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        castEfficiency: {
          casts: castCount => castCount.healingTwHits || 0,
        },
      },
      {
        spell: SPELLS.HEALING_SURGE_RESTORATION,
        name: `Filler ${SPELLS.HEALING_SURGE_RESTORATION.name}`,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        castEfficiency: {
          casts: castCount => (castCount.casts || 0) - (castCount.healingTwHits || 0),
        },
      },
      {
        spell: SPELLS.HEALING_SURGE_RESTORATION,
        name: `Tidal Waves ${SPELLS.HEALING_SURGE_RESTORATION.name}`,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        castEfficiency: {
          casts: castCount => castCount.healingTwHits || 0,
        },
      },
      {
        spell: SPELLS.CHAIN_HEAL,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        isOnGCD: true,
      },
      {
        spell: SPELLS.PURIFY_SPIRIT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        // Need to check if it actually dispelled something before we can give it a cooldown
        cooldown: 0,
        isOnGCD: true,
      },
      {
        spell: SPELLS.FLAME_SHOCK_RESTORATION,
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        cooldown: 6,
        isOnGCD: true,
      },
      {
        spell: SPELLS.LAVA_BURST,
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        charges: combatant.hasTalent(SPELLS.ECHO_OF_THE_ELEMENTS_TALENT.id) || combatant.hasFinger(ITEMS.SOUL_OF_THE_FARSEER.id) ? 2 : 1,
        cooldown: 8,
        isOnGCD: true,
      },
      {
        spell: SPELLS.LIGHTNING_BOLT_RESTORATION,
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        isOnGCD: true,
      },
    ];
  }
}

export default Abilities;
