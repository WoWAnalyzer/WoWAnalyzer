import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import CoreAbilities from 'Parser/Core/Modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() {
    return [
      {
        spell: SPELLS.MONGOOSE_BITE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 12 / (1 + haste),
        charges: 3,
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: SPELLS.THROWING_AXES_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 15 / (1 + haste),
        charges: 2,
        enabled: this.combatants.selected.hasTalent(SPELLS.THROWING_AXES_TALENT.id),
        isOnGCD: true,
      },
      {
        spell: SPELLS.FLANKING_STRIKE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
        cooldown: haste => 6 / (1 + haste),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: .9,
        },
      },
      {
        spell: SPELLS.CARVE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
        enabled: !this.combatants.selected.hasTalent(SPELLS.BUTCHERY_TALENT.id),
      },
      {
        spell: SPELLS.FURY_OF_THE_EAGLE_TRAIT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
        cooldown: 45,
      },
      {
        spell: SPELLS.EXPLOSIVE_TRAP_CAST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
        cooldown: 24,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: .75,
        },
      },
      {
        spell: SPELLS.A_MURDER_OF_CROWS_TALENT_SURVIVAL,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 60,
        enabled: this.combatants.selected.hasTalent(SPELLS.A_MURDER_OF_CROWS_TALENT_SURVIVAL.id),
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: .95,
        },
      },
      {
        spell: SPELLS.SNAKE_HUNTER_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120,
        isOnGCD: false,
        enabled: this.combatants.selected.hasTalent(SPELLS.SNAKE_HUNTER_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.85,
        },
      },
      {
        spell: SPELLS.CALTROPS_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 12,
        isOnGCD: true,
        enabled: this.combatants.selected.hasTalent(SPELLS.CALTROPS_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.6,
        },
      },
      {
        spell: SPELLS.STEEL_TRAP_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 48,
        isOnGCD: true,
        enabled: this.combatants.selected.hasTalent(SPELLS.STEEL_TRAP_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: SPELLS.STICKY_BOMB_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 25,
        isOnGCD: true,
        enabled: this.combatants.selected.hasTalent(SPELLS.STICKY_BOMB_TALENT.id),
      },
      {
        spell: SPELLS.RANGERS_NET_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 1,
        isOnGCD: true,
        enabled: this.combatants.selected.hasTalent(SPELLS.RANGERS_NET_TALENT.id),
      },
      {
        spell: SPELLS.BUTCHERY_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 12 / (1 + haste),
        charges: 3,
        isOnGCD: true,
        enabled: this.combatants.selected.hasTalent(SPELLS.BUTCHERY_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: SPELLS.DRAGONSFIRE_GRENADE_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 30,
        isOnGCD: true,
        enabled: this.combatants.selected.hasTalent(SPELLS.DRAGONSFIRE_GRENADE_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: .95,
        },
      },
      {
        spell: SPELLS.SPITTING_COBRA_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 60,
        isOnGCD: true,
        enabled: this.combatants.selected.hasTalent(SPELLS.SPITTING_COBRA_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: .95,
        },
      },
      {
        spell: SPELLS.RAPTOR_STRIKE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
      },
      {
        spell: SPELLS.HATCHET_TOSS,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
      },
      {
        spell: SPELLS.LACERATE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
      },
      {
        spell: SPELLS.ASPECT_OF_THE_EAGLE,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: () => {
          const hasEmbrace = this.combatants.selected.traitsBySpellId[SPELLS.EMBRACE_OF_THE_ASPECTS.id];
          const cooldownAfterEmbrace = hasEmbrace ? 120 - (120 * 0.2) : 120;
          const hasCallOfTheWild = this.combatants.selected.hasWrists(ITEMS.CALL_OF_THE_WILD.id);
          return cooldownAfterEmbrace * (1 - (hasCallOfTheWild ? 0.35 : 0));
        },
        isOnGCD: false,
      },
      {
        spell: SPELLS.ASPECT_OF_THE_CHEETAH,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: () => {
          const hasEmbrace = this.combatants.selected.traitsBySpellId[SPELLS.EMBRACE_OF_THE_ASPECTS.id];
          const cooldownAfterEmbrace = hasEmbrace ? 180 - (180 * 0.2) : 180;
          const hasCallOfTheWild = this.combatants.selected.hasWrists(ITEMS.CALL_OF_THE_WILD.id);
          return cooldownAfterEmbrace * (1 - (hasCallOfTheWild ? 0.35 : 0));
        },
        isOnGCD: false,
      },
      {
        spell: SPELLS.ASPECT_OF_THE_TURTLE,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: () => {
          const hasEmbrace = this.combatants.selected.traitsBySpellId[SPELLS.EMBRACE_OF_THE_ASPECTS.id];
          const cooldownAfterEmbrace = hasEmbrace ? 180 - (180 * 0.2) : 180;
          const hasCallOfTheWild = this.combatants.selected.hasWrists(ITEMS.CALL_OF_THE_WILD.id);
          return cooldownAfterEmbrace * (1 - (hasCallOfTheWild ? 0.35 : 0));
        },
        isOnGCD: false,
      },
      {
        spell: SPELLS.EXHILARATION,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 120,
        isOnGCD: false,
      },
      {
        spell: SPELLS.HARPOON,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
        cooldown: 20,
      },
      {
        spell: SPELLS.MUZZLE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 15,
        isOnGCD: false,
      },
      {
        spell: SPELLS.DISENGAGE_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 20,
        isOnGCD: false,
      },
      {
        spell: SPELLS.FREEZING_TRAP,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 24,
        enabled: !this.combatants.selected.hasTalent(SPELLS.STEEL_TRAP_TALENT.id),
        isOnGCD: true,
      },
      {
        spell: SPELLS.TAR_TRAP,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 24,
        enabled: !this.combatants.selected.hasTalent(SPELLS.CALTROPS_TALENT.id),
        isOnGCD: true,
      },
      {
        spell: SPELLS.FLARE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 20,
        isOnGCD: true,
      },
      {
        spell: SPELLS.WING_CLIP,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        enabled: !this.combatants.selected.hasTalent(SPELLS.RANGERS_NET_TALENT.id),
        isOnGCD: true,
      },
    ];
  }
}

export default Abilities;
