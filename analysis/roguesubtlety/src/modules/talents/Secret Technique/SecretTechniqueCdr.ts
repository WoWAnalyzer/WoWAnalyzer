import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { SpendResourceEvent } from 'parser/core/Events';

/**
 * Secret Technique
 * Cooldown is reduced by by 1 sec for every combo point you spend.
 */
class SecretTechniqueCdr extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SECRET_TECHNIQUE_TALENT.id);
    this.addEventListener(Events.SpendResource.by(SELECTED_PLAYER), this.onSpendResource);
  }

  onSpendResource(event: SpendResourceEvent) {
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
