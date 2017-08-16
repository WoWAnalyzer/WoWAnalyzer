import SPELLS from 'common/SPELLS';

export const SPELL_CATEGORY = {
  ROTATIONAL: 'Spell',
  COOLDOWNS: 'Cooldown',
};

const CPM_ABILITIES = [
  {
    spell: SPELLS.SPIRIT_BOMB_TALENT,
    isActive: combatant => combatant.lv90Talent === SPELLS.SPIRIT_BOMB_TALENT.id,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 18,
    recommendedCastEfficiency: 1.0,
  },
  {
    spell: SPELLS.IMMOLATION_AURA,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 15,
    recommendedCastEfficiency: 0.85,
  },
  {
    spell: SPELLS.DEMON_SPIKES,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 15,
    recommendedCastEfficiency: 0.75,
  },
  {
    spell: SPELLS.SOUL_CARVER,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 60,
    recommendedCastEfficiency: 0.85,
  },
  {
    spell: SPELLS.FRACTURE_TALENT,
    isActive: combatant => combatant.lv60Talent === SPELLS.FRACTURE_TALENT.id,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 15,
    recommendedCastEfficiency: 0.75,
  },
  {
    spell: SPELLS.FELBLADE_TALENT,
    isActive: combatant => combatant.lv45Talent === SPELLS.FELBLADE_TALENT.id,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 15,
    recommendedCastEfficiency: 0.85,
  },
  {
    spell: SPELLS.FEL_ERUPTION_TALENT,
    isActive: combatant => combatant.lv45Talent === SPELLS.FEL_ERUPTION_TALENT.id,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 30,
    recommendedCastEfficiency: 0.90,
  },
  {
    spell: SPELLS.FEL_DEVASTATION_TALENT,
    isActive: combatant => combatant.lv90Talent === SPELLS.FEL_DEVASTATION_TALENT.id,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 60,
    recommendedCastEfficiency: 0.55,
  },
  {
    spell: SPELLS.SOUL_BARRIER_TALENT,
    isActive: combatant => combatant.lv100Talent === SPELLS.SOUL_BARRIER_TALENT.id,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 30,
    recommendedCastEfficiency: 0.50,
  },
];

export default CPM_ABILITIES;
