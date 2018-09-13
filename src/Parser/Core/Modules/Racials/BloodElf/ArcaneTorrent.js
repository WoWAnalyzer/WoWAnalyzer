import SPELLS from 'common/SPELLS';
import RACES from 'game/RACES';
import SPECS from 'game/SPECS';
import Analyzer from 'Parser/Core/Analyzer';
import Abilities from 'Parser/Core/Modules/Abilities';

const CLASSES_NOT_BENEFITTING = [SPECS.FIRE_MAGE, SPECS.FROST_MAGE, SPECS.MARKSMANSHIP_HUNTER];

class ArcaneTorrent extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  constructor(...args) {
    super(...args);
    const spec = this.selectedCombatant.spec;
    this.active = this.selectedCombatant.race && this.selectedCombatant.race === RACES.BloodElf;
    if (!this.active || CLASSES_NOT_BENEFITTING.includes(spec)) {
      return;
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
      },
    });
  }
}

export default ArcaneTorrent;
