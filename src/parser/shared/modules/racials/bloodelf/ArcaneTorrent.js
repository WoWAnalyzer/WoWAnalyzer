import SPELLS from 'common/SPELLS';
import RACES from 'game/RACES';
import SPECS from 'game/SPECS';
import Analyzer from 'parser/core/Analyzer';
import Abilities from 'parser/shared/modules/Abilities';

class ArcaneTorrent extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  castEfficiency = 0.8;
  extraSuggestion = null;

  constructor(options) {
    super(options);
    this.active = this.selectedCombatant.race && this.selectedCombatant.race === RACES.BloodElf;
    
    if (!this.active) {
      return;
    }

    const specID = this.selectedCombatant._combatantInfo.specID;
    const isRogue = (specID === SPECS.ASSASSINATION_ROGUE.id || specID === SPECS.OUTLAW_ROGUE.id || specID === SPECS.SUBTLETY_ROGUE.id);

    this.castEfficiency = (options.castEfficiency === undefined) ? this.castEfficiency : options.castEfficiency;

    this.abilities.add({
      spell: [SPELLS.ARCANE_TORRENT_MANA1, SPELLS.ARCANE_TORRENT_MANA2, SPELLS.ARCANE_TORRENT_MANA3, SPELLS.ARCANE_TORRENT_RAGE, SPELLS.ARCANE_TORRENT_ENERGY, SPELLS.ARCANE_TORRENT_RUNIC_POWER, SPELLS.ARCANE_TORRENT_MONK, SPELLS.ARCANE_TORRENT_FOCUS, SPELLS.ARCANE_TORRENT_FURY],
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      cooldown: 90,
      gcd: {
        base: isRogue? 1000 : 1500,
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
