import SPELLS from 'common/SPELLS';
import RACES from 'game/RACES';
import Analyzer from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';

class ArcaneTorrent extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  gcd = 1500;
  castEfficiency = 0.8;
  extraSuggestion = null;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.race === RACES.BloodElf;
    if (!this.active) {
      return;
    }

    this.gcd = options.gcd === undefined ? this.gcd : options.gcd;
    this.castEfficiency =
      options.castEfficiency === undefined
        ? this.castEfficiency
        : options.castEfficiency;

    options.abilities.add({
      spell: [
        SPELLS.ARCANE_TORRENT_MANA1,
        SPELLS.ARCANE_TORRENT_MANA2,
        SPELLS.ARCANE_TORRENT_MANA3,
        SPELLS.ARCANE_TORRENT_RAGE,
        SPELLS.ARCANE_TORRENT_ENERGY,
        SPELLS.ARCANE_TORRENT_RUNIC_POWER,
        SPELLS.ARCANE_TORRENT_MONK,
        SPELLS.ARCANE_TORRENT_FOCUS,
        SPELLS.ARCANE_TORRENT_FURY,
      ],
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
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
