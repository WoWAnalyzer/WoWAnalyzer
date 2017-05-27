import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

export const SPELL_CATEGORY = {
  ROTATIONAL: 'Rotational Spell',
  COOLDOWNS: 'Cooldown',
  OTHERS: 'Spell',
};

const CPM_ABILITIES = [
  // Riptide with EotE
  {
    spell: SPELLS.RIPTIDE,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 6,
    isActive: combatant => combatant.lv90Talent === SPELLS.ECHO_OF_THE_ELEMENTS_TALENT.id,
    recommendedCastEfficiency: 0.90,
  },
  // Riptide without EotE
  {
    spell: SPELLS.RIPTIDE,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 6,
    isActive: combatant => !(combatant.lv90Talent === SPELLS.ECHO_OF_THE_ELEMENTS_TALENT.id),
    recommendedCastEfficiency: 0.75,
  },
  {
    spell: SPELLS.HEALING_STREAM_TOTEM_CAST,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: (haste, combatant) => {
        const has4PT19 = combatant.hasBuff(SPELLS.RESTORATION_SHAMAN_T19_4SET_BONUS_BUFF.id);
        
        if (!has4PT19) {
            return 30;
        }

        const abilityTracker = combatant.owner.modules.abilityTracker;

        const riptideCasts = abilityTracker.getAbility(SPELLS.RIPTIDE.id).casts || 0;
        const chainHealCasts = abilityTracker.getAbility(SPELLS.CHAIN_HEAL.id).casts || 0;
        const reducedCD = 3 * (riptideCasts + chainHealCasts);
        const extraHsts = reducedCD / 30;

        const fightDuration = combatant.owner.fightDuration/1000;
        const potentialHstCasts = fightDuration / 30 + 1;
        const newPotentialHstCasts = potentialHstCasts + extraHsts

        const cooldown = fightDuration / newPotentialHstCasts;

        return cooldown;
    },
  },
  {
    spell: SPELLS.ASTRAL_SHIFT,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 90,
    recommendedCastEfficiency: 0.6,
    importance: ISSUE_IMPORTANCE.MINOR,
  },
  {
    spell: SPELLS.ARCANE_TORRENT,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 90,
    hideWithZeroCasts: true,
  },
  {
    spell: SPELLS.VELENS_FUTURE_SIGHT,
    icon: SPELLS.VELENS_FUTURE_SIGHT.icon,
    name: SPELLS.VELENS_FUTURE_SIGHT.name,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 75,
    isActive: combatant => combatant.hasTrinket(ITEMS.VELENS_FUTURE_SIGHT.id),
  },
  {
    spell: SPELLS.HEALING_RAIN_CAST,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 10,
    recommendedCastEfficiency: 0.6,
    importance: ISSUE_IMPORTANCE.MINOR,
  },
  {
    spell: SPELLS.GIFT_OF_THE_QUEEN,
    category: SPELL_CATEGORY.COOLDOWNS,
    recommendedCastEfficiency: 0.7,
    getCooldown: haste => 45,
  },
  {
    spell: SPELLS.CLOUDBURST_TOTEM_CAST,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 30,
    isActive: combatant => combatant.lv90Talent === SPELLS.CLOUDBURST_TOTEM_TALENT.id,
  },
  {
    spell: SPELLS.EARTHEN_SHIELD_TOTEM_CAST,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 60,
    isActive: combatant => combatant.lv75Talent === SPELLS.EARTHEN_SHIELD_TOTEM_TALENT.id,
  },
  {
    spell: SPELLS.ANCESTRAL_GUIDANCE_CAST,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 120,
    isActive: combatant => combatant.lv60Talent === SPELLS.ANCESTRAL_GUIDANCE_TALENT.id,
  },
  {
    spell: SPELLS.ASCENDANCE_CAST,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 180,
    isActive: combatant => combatant.lv100Talent === SPELLS.ASCENDANCE_TALENT.id,
  },
  {
    spell: SPELLS.HEALING_TIDE_TOTEM_CAST,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 180,
  },
  {
    spell: SPELLS.SPIRIT_LINK_TOTEM,
    category: SPELL_CATEGORY.COOLDOWNS,
    recommendedCastEfficiency: 0.7,
    getCooldown: haste => 180,
  },
  {
    spell: SPELLS.HEALING_WAVE,
    name: `Filler ${SPELLS.HEALING_WAVE.name}`,
    category: SPELL_CATEGORY.OTHERS,
    getCasts: castCount => (castCount.casts || 0) - (castCount.healingTwHits || 0),
    getCooldown: haste => null,
  },
  {
    spell: SPELLS.HEALING_WAVE,
    name: `Tidal Waves ${SPELLS.HEALING_WAVE.name}`,
    category: SPELL_CATEGORY.OTHERS,
    getCasts: castCount => castCount.healingTwHits || 0,
    getCooldown: haste => null,
  },
  {
    spell: SPELLS.HEALING_SURGE,
    name: `Filler ${SPELLS.HEALING_SURGE.name}`,
    category: SPELL_CATEGORY.OTHERS,
    getCasts: castCount => (castCount.casts || 0) - (castCount.healingTwHits || 0),
    getCooldown: haste => null,
  },
  {
    spell: SPELLS.HEALING_SURGE,
    name: `Tidal Waves ${SPELLS.HEALING_SURGE.name}`,
    category: SPELL_CATEGORY.OTHERS,
    getCasts: castCount => castCount.healingTwHits || 0,
    getCooldown: haste => null,
  },
];

export default CPM_ABILITIES;
