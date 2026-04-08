import Analyzer, { Options } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import TALENTS from 'common/TALENTS/rogue';
import SPELLS from 'common/SPELLS';

class Preparation extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.PREPARATION_TALENT);

    this.addEventListener(Events.cast.spell(SPELLS.PREPARATION), (event) => {
      this.spellUsable.endCooldown(SPELLS.BLADE_FLURRY.id, event.timestamp);
      this.spellUsable.endCooldown(SPELLS.BETWEEN_THE_EYES.id, event.timestamp);
      this.spellUsable.endCooldown(TALENTS.BLADE_RUSH_TALENT.id, event.timestamp);
      this.spellUsable.endCooldown(TALENTS.KILLING_SPREE_TALENT.id, event.timestamp);
      this.spellUsable.endCooldown(TALENTS.ADRENALINE_RUSH_TALENT.id, event.timestamp);
    });
  }
}

export default Preparation;
