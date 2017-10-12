import SPELLS from 'common/SPELLS';
import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';
import CoreCastEfficiency from 'Parser/Core/Modules/CastEfficiency';

/* eslint-disable no-unused-vars */

class CastEfficiency extends CoreCastEfficiency {
  static CPM_ABILITIES = [
    ...CoreCastEfficiency.CPM_ABILITIES,
    // Riptide with EotE
    {
      spell: SPELLS.RIPTIDE,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 6,
      isActive: combatant => combatant.lv90Talent === SPELLS.ECHO_OF_THE_ELEMENTS_TALENT.id,
      recommendedCastEfficiency: 0.90,
    },
    // Riptide without EotE
    {
      spell: SPELLS.RIPTIDE,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 6,
      isActive: combatant => !(combatant.lv90Talent === SPELLS.ECHO_OF_THE_ELEMENTS_TALENT.id),
      recommendedCastEfficiency: 0.75,
    },
    {
      spell: SPELLS.HEALING_STREAM_TOTEM_CAST,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
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

        const fightDuration = combatant.owner.fightDuration / 1000;
        const potentialHstCasts = fightDuration / 30 + 1;
        const newPotentialHstCasts = potentialHstCasts + extraHsts;

        const cooldown = fightDuration / newPotentialHstCasts;

        return cooldown;
      },
      getOverhealing: (_, getAbility) => {
        const { healingEffective, healingAbsorbed, healingOverheal } = getAbility(SPELLS.HEALING_STREAM_TOTEM_HEAL.id);
        return healingOverheal / (healingEffective + healingAbsorbed + healingOverheal);
      },
    },
    {
      spell: SPELLS.ASTRAL_SHIFT,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 90,
      recommendedCastEfficiency: 0.6,
      importance: ISSUE_IMPORTANCE.MINOR,
    },
    {
      spell: SPELLS.ARCANE_TORRENT_MANA,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 90,
      hideWithZeroCasts: true,
    },
    {
      spell: SPELLS.HEALING_RAIN_CAST,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 10,
      recommendedCastEfficiency: 0.6,
      importance: ISSUE_IMPORTANCE.MINOR,
      getOverhealing: (_, getAbility) => {
        const { healingEffective, healingAbsorbed, healingOverheal } = getAbility(SPELLS.HEALING_RAIN_HEAL.id);
        return healingOverheal / (healingEffective + healingAbsorbed + healingOverheal);
      },
    },
    {
      spell: SPELLS.GIFT_OF_THE_QUEEN,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      recommendedCastEfficiency: 0.7,
      getCooldown: haste => 45,
    },
    {
      spell: SPELLS.CLOUDBURST_TOTEM_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 30,
      isActive: combatant => combatant.lv90Talent === SPELLS.CLOUDBURST_TOTEM_TALENT.id,
      getOverhealing: (_, getAbility) => {
        const { healingEffective, healingAbsorbed, healingOverheal } = getAbility(SPELLS.CLOUDBURST_TOTEM_HEAL.id);
        return healingOverheal / (healingEffective + healingAbsorbed + healingOverheal);
      },
    },
    {
      spell: SPELLS.EARTHEN_SHIELD_TOTEM_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 60,
      isActive: combatant => combatant.lv75Talent === SPELLS.EARTHEN_SHIELD_TOTEM_TALENT.id,
      getOverhealing: (_, getAbility, parser) => {
        const earthenShieldHealing = parser.modules.earthenShieldTotem.healing || 0;
        const earthenShieldPotentialHealing = parser.modules.earthenShieldTotem.potentialHealing || 0;
        const earthenShieldEfficiency = earthenShieldHealing / earthenShieldPotentialHealing;
        return 1 - earthenShieldEfficiency;
      },
    },
    {
      spell: SPELLS.ANCESTRAL_GUIDANCE_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 120,
      isActive: combatant => combatant.lv60Talent === SPELLS.ANCESTRAL_GUIDANCE_TALENT.id,
      getOverhealing: (_, getAbility) => {
        const { healingEffective, healingAbsorbed, healingOverheal } = getAbility(SPELLS.ANCESTRAL_GUIDANCE_HEAL.id);
        return healingOverheal / (healingEffective + healingAbsorbed + healingOverheal);
      },
    },
    {
      spell: SPELLS.ASCENDANCE_TALENT_RESTORATION,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 180,
      isActive: combatant => combatant.lv100Talent === SPELLS.ASCENDANCE_TALENT_RESTORATION.id,
      getOverhealing: (_, getAbility) => {
        const { healingEffective, healingAbsorbed, healingOverheal } = getAbility(SPELLS.ASCENDANCE_HEAL.id);
        return healingOverheal / (healingEffective + healingAbsorbed + healingOverheal);
      },
    },
    {
      spell: SPELLS.HEALING_TIDE_TOTEM_CAST,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 180,
      getOverhealing: (_, getAbility) => {
        const { healingEffective, healingAbsorbed, healingOverheal } = getAbility(SPELLS.HEALING_TIDE_TOTEM_HEAL.id);
        return healingOverheal / (healingEffective + healingAbsorbed + healingOverheal);
      },
    },
    {
      spell: SPELLS.SPIRIT_LINK_TOTEM,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      recommendedCastEfficiency: 0.7,
      getCooldown: haste => 180,
    },
    {
      spell: SPELLS.HEALING_WAVE,
      name: `Filler ${SPELLS.HEALING_WAVE.name}`,
      category: CastEfficiency.SPELL_CATEGORIES.OTHERS,
      getCasts: castCount => (castCount.casts || 0) - (castCount.healingTwHits || 0),
      getCooldown: haste => null,
      getOverhealing: ({ healingEffective, healingAbsorbed, healingOverheal, healingTwHealing, healingTwAbsorbed, healingTwOverheal }) => ((healingOverheal - healingTwOverheal) / ((healingEffective - healingTwHealing) + (healingAbsorbed - healingTwAbsorbed) + (healingOverheal - healingTwOverheal))) || null,
    },
    {
      spell: SPELLS.HEALING_WAVE,
      name: `Tidal Waves ${SPELLS.HEALING_WAVE.name}`,
      category: CastEfficiency.SPELL_CATEGORIES.OTHERS,
      getCasts: castCount => castCount.healingTwHits || 0,
      getCooldown: haste => null,
      getOverhealing: ({ healingTwHealing, healingTwAbsorbed, healingTwOverheal }) => (healingTwOverheal / (healingTwHealing + healingTwAbsorbed + healingTwOverheal)) || null,
    },
    {
      spell: SPELLS.HEALING_SURGE_RESTORATION,
      name: `Filler ${SPELLS.HEALING_SURGE_RESTORATION.name}`,
      category: CastEfficiency.SPELL_CATEGORIES.OTHERS,
      getCasts: castCount => (castCount.casts || 0) - (castCount.healingTwHits || 0),
      getCooldown: haste => null,
      getOverhealing: ({ healingEffective, healingAbsorbed, healingOverheal, healingTwHealing, healingTwAbsorbed, healingTwOverheal }) => ((healingOverheal - healingTwOverheal) / ((healingEffective - healingTwHealing) + (healingAbsorbed - healingTwAbsorbed) + (healingOverheal - healingTwOverheal))) || null,
    },
    {
      spell: SPELLS.HEALING_SURGE_RESTORATION,
      name: `Tidal Waves ${SPELLS.HEALING_SURGE_RESTORATION.name}`,
      category: CastEfficiency.SPELL_CATEGORIES.OTHERS,
      getCasts: castCount => castCount.healingTwHits || 0,
      getCooldown: haste => null,
      getOverhealing: ({ healingTwHealing, healingTwAbsorbed, healingTwOverheal }) => (healingTwOverheal / (healingTwHealing + healingTwAbsorbed + healingTwOverheal)) || null,
    },
  ];
}

export default CastEfficiency;
