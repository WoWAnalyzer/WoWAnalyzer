import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import Analyzer from 'Parser/Core/Analyzer';

class DanceCooldownReduction extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  danceReduction;

  constructor(...args) {
    super(...args);
    this.danceReduction = this.selectedCombatant.hasTalent(SPELLS.ENVELOPING_SHADOWS_TALENT.id) ? 2500 : 1500;
  }

  on_byPlayer_spendresource(event) {
    const spent = event.resourceChange;
    if (event.resourceChangeType !== RESOURCE_TYPES.COMBO_POINTS.id) return;

    if (this.spellUsable.isOnCooldown(SPELLS.SHADOW_DANCE.id)) {
      this.spellUsable.reduceCooldown(SPELLS.SHADOW_DANCE.id, this.danceReduction * spent);
    }
  }
}

export default DanceCooldownReduction;
