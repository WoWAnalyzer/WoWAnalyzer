import TALENTS from 'common/TALENTS/rogue';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { SpendResourceEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

/**
 * Secret Technique
 * Cooldown is reduced by 1 sec for every combo point you spend.
 */
class SecretTechniqueCdr extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SECRET_TECHNIQUE_TALENT);
    this.addEventListener(Events.SpendResource.by(SELECTED_PLAYER), this.onSpendResource);
  }

  onSpendResource(event: SpendResourceEvent) {
    const comboPointsSpent = event.resourceChange;
    if (event.resourceChangeType !== RESOURCE_TYPES.COMBO_POINTS.id) {
      return;
    }

    if (this.spellUsable.isOnCooldown(TALENTS.SECRET_TECHNIQUE_TALENT.id)) {
      this.spellUsable.reduceCooldown(TALENTS.SECRET_TECHNIQUE_TALENT.id, comboPointsSpent * 1000);
    }
  }
}

export default SecretTechniqueCdr;
