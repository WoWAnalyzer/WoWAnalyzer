import SPELLS from 'common/SPELLS';
import GameBranch from 'game/GameBranch';
import RACES from 'game/RACES';
import { wclGameVersionToBranch } from 'game/VERSIONS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

/**
 * A module that adds non-dps related racial casts to abilities.
 *
 * If a racial should be tracked and analyzed, making a separate module is better.
 */
class OtherRacials extends Analyzer.withDependencies({
  abilities: Abilities,
}) {
  classic = false;

  constructor(options: Options) {
    super(options);
    this.classic = wclGameVersionToBranch(options.owner.report.gameVersion) === GameBranch.Classic;

    switch (this.selectedCombatant.race) {
      case RACES.EarthenAlliance:
      case RACES.EarthenHorde:
        this.deps.abilities.add({
          spell: SPELLS.AZERITE_SURGE.id,
          category: SPELL_CATEGORY.COOLDOWNS,
          cooldown: 120,
          gcd: {
            static: 500,
          },
        });
        break;
      case RACES.Gnome:
        this.deps.abilities.add({
          spell: SPELLS.ESCAPE_ARTIST.id,
          category: SPELL_CATEGORY.UTILITY,
          cooldown: this.classic ? 90 : 60,
          gcd: null,
        });
        break;
      case RACES.Goblin:
        this.deps.abilities.add({
          spell: SPELLS.ROCKET_JUMP.id,
          category: SPELL_CATEGORY.UTILITY,
          cooldown: this.classic ? 120 : 90,
          gcd: {
            base: 1500,
          },
        });
        break;
      case RACES.HighmountainTauren:
        this.deps.abilities.add({
          spell: SPELLS.BULL_RUSH.id,
          category: SPELL_CATEGORY.UTILITY,
          cooldown: 120,
          gcd: {
            base: 1500,
          },
        });
        break;
      case RACES.Human:
        this.deps.abilities.add({
          spell: SPELLS.WILL_TO_SURVIVE.id,
          category: SPELL_CATEGORY.UTILITY,
          cooldown: 180,
          gcd: null,
        });
        break;
      case RACES.KulTiran:
        this.deps.abilities.add({
          spell: SPELLS.HAYMAKER.id,
          category: SPELL_CATEGORY.UTILITY,
          cooldown: 2.5 * 60,
          gcd: {
            base: 1500,
          },
        });
        break;
      case RACES.NightElf:
        this.deps.abilities.add({
          spell: SPELLS.SHADOWMELD.id,
          category: SPELL_CATEGORY.UTILITY,
          cooldown: 120,
          gcd: null,
        });
        break;
      case RACES.Nightborne:
        this.deps.abilities.add({
          spell: SPELLS.ARCANE_PULSE.id,
          category: SPELL_CATEGORY.UTILITY,
          cooldown: 3 * 60,
          gcd: {
            base: 1000,
          },
        });
        break;
      case RACES.PandarenAlliance:
      case RACES.PandarenHorde:
      case RACES.PandarenNeutral:
        this.deps.abilities.add({
          spell: SPELLS.QUAKING_PALM.id,
          category: SPELL_CATEGORY.UTILITY,
          cooldown: 120,
          gcd: {
            base: 1000,
          },
        });
        break;
      case RACES.Tauren:
        this.deps.abilities.add({
          spell: SPELLS.WAR_STOMP.id,
          category: SPELL_CATEGORY.UTILITY,
          cooldown: this.classic ? 120 : 90,
          gcd: null,
        });
        break;
      case RACES.Undead:
        this.deps.abilities.add({
          spell: SPELLS.WILL_OF_THE_FORSAKEN.id,
          category: SPELL_CATEGORY.UTILITY,
          cooldown: 180,
          gcd: null,
        });
        this.deps.abilities.add({
          spell: SPELLS.CANNIBALIZE.id,
          category: SPELL_CATEGORY.UTILITY,
          cooldown: 120,
          gcd: {
            base: 1500,
          },
        });
        break;
      case RACES.VoidElf:
        this.deps.abilities.add({
          spell: SPELLS.SPATIAL_RIFT_INITIAL.id,
          category: SPELL_CATEGORY.UTILITY,
          cooldown: 0,
          gcd: {
            base: 1000,
          },
        });
        break;
      case RACES.Worgen:
        this.deps.abilities.add({
          spell: SPELLS.DARKFLIGHT.id,
          category: SPELL_CATEGORY.UTILITY,
          cooldown: 120,
          gcd: null,
        });
        break;
      case RACES.ZandalariTroll:
        this.deps.abilities.add({
          spell: SPELLS.PTERRORDAX_SWOOP.id,
          category: SPELL_CATEGORY.UTILITY,
          cooldown: 60 * 15,
          gcd: null,
        });
        this.deps.abilities.add({
          spell: SPELLS.REGENERATIN.id,
          category: SPELL_CATEGORY.UTILITY,
          cooldown: 60 * 2.5,
          gcd: {
            base: 1500,
          },
        });
        break;
    }
  }
}

export default OtherRacials;
