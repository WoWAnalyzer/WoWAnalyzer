import SPELLS from 'common/SPELLS/classic/deathknight';
import MISC_SPELLS from 'common/SPELLS/classic/misc';
import { evilEyeCdMultiplier } from 'analysis/classic/deathknight/shared/EvilEyeOfGalakras';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

// In MoP all three DK presences reduce the global cooldown to 1 second.
const GCD_1S = { base: 1000 } as const;

class Abilities extends CoreAbilities {
  spellbook() {
    // Evil Eye of Galakras reduces the CD of 6 Unholy spells by an ilvl-dependent %.
    const eyeMult = evilEyeCdMultiplier(this.selectedCombatant.gear);

    return [
      // ---- Rotational ----
      {
        spell: SPELLS.SCOURGE_STRIKE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: GCD_1S,
      },
      {
        spell: SPELLS.FESTERING_STRIKE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: GCD_1S,
      },
      {
        spell: SPELLS.DEATH_COIL_DK.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: GCD_1S,
      },
      {
        spell: SPELLS.DARK_TRANSFORMATION.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: GCD_1S,
        cooldown: 30,
      },
      {
        spell: SPELLS.PLAGUE_STRIKE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: GCD_1S,
      },
      {
        spell: SPELLS.ICY_TOUCH.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: GCD_1S,
      },
      {
        spell: SPELLS.OUTBREAK.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: GCD_1S,
        cooldown: 60 * eyeMult,
      },
      // ---- Rotational AoE ----
      {
        spell: SPELLS.DEATH_AND_DECAY.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: GCD_1S,
        cooldown: 30,
      },
      {
        spell: SPELLS.BLOOD_BOIL.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: GCD_1S,
      },
      {
        spell: SPELLS.PESTILENCE.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: GCD_1S,
      },
      // ---- Cooldowns ----
      {
        spell: SPELLS.SUMMON_GARGOYLE.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: GCD_1S,
        cooldown: 180 * eyeMult,
      },
      {
        spell: SPELLS.ARMY_OF_THE_DEAD.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: GCD_1S,
        cooldown: 600 * eyeMult,
      },
      {
        spell: SPELLS.UNHOLY_FRENZY.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: null,
        cooldown: 180 * eyeMult,
        buffSpellIds: [SPELLS.UNHOLY_FRENZY.id],
      },
      {
        spell: SPELLS.EMPOWER_RUNE_WEAPON.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: null,
        cooldown: 300 * eyeMult,
      },
      {
        spell: SPELLS.BLOOD_TAP.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: null,
      },
      {
        spell: SPELLS.PLAGUE_LEECH.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: GCD_1S,
        cooldown: 25,
        enabled: this.selectedCombatant.hasClassicTalent(SPELLS.PLAGUE_LEECH.id),
      },
      {
        spell: SPELLS.SOUL_REAPER_UNHOLY.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: GCD_1S,
        cooldown: 6,
      },
      // ---- Defensive ----
      {
        spell: SPELLS.ANTI_MAGIC_SHELL.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: null,
        cooldown: 45 * eyeMult,
      },
      {
        spell: SPELLS.ICEBOUND_FORTITUDE.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: null,
        cooldown: 180 * eyeMult,
      },
      {
        spell: SPELLS.LICHBORNE.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: null,
        cooldown: 120,
      },
      {
        spell: SPELLS.DEATH_PACT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: null,
        cooldown: 120,
        enabled: this.selectedCombatant.hasClassicTalent(SPELLS.DEATH_PACT.id),
      },
      // ---- Utility ----
      {
        spell: SPELLS.MIND_FREEZE.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
        cooldown: 15,
      },
      {
        spell: SPELLS.CHAINS_OF_ICE.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: GCD_1S,
      },
      {
        spell: SPELLS.DEATH_GRIP.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
        cooldown: 25,
      },
      {
        spell: SPELLS.HORN_OF_WINTER.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: GCD_1S,
        // Glyph of the Loud Horn doubles this to 40s (in exchange for +10 RP
        // per cast) - see SPELLS.GLYPH_OF_THE_LOUD_HORN's own comment.
        cooldown: () =>
          this.selectedCombatant.hasGlyph(SPELLS.GLYPH_OF_THE_LOUD_HORN.glyphId!) ? 40 : 20,
      },
      {
        spell: SPELLS.RAISE_ALLY.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: GCD_1S,
      },
      {
        spell: SPELLS.BLOOD_PRESENCE.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
      },
      {
        spell: SPELLS.FROST_PRESENCE.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
      },
      {
        spell: SPELLS.UNHOLY_PRESENCE.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
      },
      // ---- Other ----
      {
        spell: SPELLS.DEATH_STRIKE.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: GCD_1S,
      },
      {
        spell: SPELLS.HOWLING_BLAST.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: GCD_1S,
      },
      // ---- Profession / universal items (no cost, not spec-specific) ----
      {
        spell: MISC_SPELLS.LIFEBLOOD.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: null,
        cooldown: 120,
      },
      {
        spell: MISC_SPELLS.GOBLIN_GLIDER.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: null,
        cooldown: 180,
      },
    ];
  }
}

export default Abilities;
