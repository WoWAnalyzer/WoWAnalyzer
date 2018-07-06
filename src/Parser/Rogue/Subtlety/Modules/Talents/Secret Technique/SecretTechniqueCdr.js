import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import Analyzer from 'Parser/Core/Analyzer';

/**
 * Secret Technique
 * Cooldown is reduced by by 1 sec for every combo point you spend.
 */
class SecretTechniqueCdr extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SECRET_TECHNIQUE_TALENT.id);
  }

  on_byPlayer_spendresource(event) {
    const comboPointsSpent = event.resourceChange;
    if (event.resourceChangeType !== RESOURCE_TYPES.COMBO_POINTS.id) {
      return;
    }

    if (this.spellUsable.isOnCooldown(SPELLS.SECRET_TECHNIQUE_TALENT.id)) {
      this.spellUsable.reduceCooldown(SPELLS.SECRET_TECHNIQUE_TALENT.id, comboPointsSpent * 1000);
    }
  }
}

export default SecretTechniqueCdr;
