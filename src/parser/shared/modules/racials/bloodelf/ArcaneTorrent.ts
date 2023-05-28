import SPELLS from 'common/SPELLS';
import RACES from 'game/RACES';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class ArcaneTorrent extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  gcd = 1500;
  castEfficiency = 0.8;
  extraSuggestion = null;

  constructor(
    options: Options & {
      active?: boolean;
      gcd?: number;
      castEfficiency?: number;
      abilities: Abilities;
    },
  ) {
    super(options);
    this.active =
      this.selectedCombatant.race === RACES.BloodElf &&
      (options.active === undefined || options.active === true);
    if (!this.active) {
      return;
    }

    this.gcd = options.gcd === undefined ? this.gcd : options.gcd;
    this.castEfficiency =
      options.castEfficiency === undefined ? this.castEfficiency : options.castEfficiency;

    options.abilities.add({
      spell: [
        SPELLS.ARCANE_TORRENT_MANA1.id,
        SPELLS.ARCANE_TORRENT_MANA2.id,
        SPELLS.ARCANE_TORRENT_MANA3.id,
        SPELLS.ARCANE_TORRENT_RAGE.id,
        SPELLS.ARCANE_TORRENT_ENERGY.id,
        SPELLS.ARCANE_TORRENT_RUNIC_POWER.id,
        SPELLS.ARCANE_TORRENT_MONK.id,
        SPELLS.ARCANE_TORRENT_FOCUS.id,
        SPELLS.ARCANE_TORRENT_FURY.id,
      ],
      category: SPELL_CATEGORY.COOLDOWNS,
      cooldown: 120,
      gcd: {
        base: this.gcd,
      },
      timelineSortIndex: 35,
      castEfficiency: {
        suggestion: this.castEfficiency !== null,
        recommendedEfficiency: this.castEfficiency,
        extraSuggestion: this.extraSuggestion,
      },
    });
  }
}

export default ArcaneTorrent;
