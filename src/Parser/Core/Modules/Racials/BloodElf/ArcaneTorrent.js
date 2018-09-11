import SPELLS from 'common/SPELLS';
import RACES from 'game/RACES';
import Analyzer from 'Parser/Core/Analyzer';
import Abilities from 'Parser/Core/Modules/Abilities';
import SPECS from 'game/SPECS';

const SPECS_NOT_BENEFITTING = [SPECS.FIRE_MAGE, SPECS.FROST_MAGE, SPECS.MARKSMANSHIP_HUNTER];

const SPEC_WITH_LOWER_CAST_EFFICIENCY = [SPECS.SURVIVAL_HUNTER];

class ArcaneTorrent extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  castEfficiency = 0;

  constructor(...args) {
    super(...args);
    const spec = this.selectedCombatant.spec;
    this.active = this.selectedCombatant.race && this.selectedCombatant.race === RACES.BloodElf;
    if (!this.active || SPECS_NOT_BENEFITTING.includes(spec)) {
      return;
    }
    if (SPEC_WITH_LOWER_CAST_EFFICIENCY.includes(spec)) {
      this.castEfficiency = 0.5;
    } else {
      this.castEfficiency = 0.8;
    }

    this.abilities.add({
      spell: [SPELLS.ARCANE_TORRENT_MANA1, SPELLS.ARCANE_TORRENT_MANA2, SPELLS.ARCANE_TORRENT_MANA3, SPELLS.ARCANE_TORRENT_RAGE, SPELLS.ARCANE_TORRENT_ENERGY, SPELLS.ARCANE_TORRENT_RUNIC_POWER, SPELLS.ARCANE_TORRENT_MONK, SPELLS.ARCANE_TORRENT_FOCUS, SPELLS.ARCANE_TORRENT_FURY],
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      cooldown: 90,
      gcd: {
        base: 1500,
      },
      timelineSortIndex: 35,
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: this.castEfficiency,
      },
    });
  }
}

export default ArcaneTorrent;
