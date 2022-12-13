import talents from 'common/TALENTS/monk';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

export default class Salsalabims extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(talents.SALSALABIMS_STRENGTH_TALENT);

    this.addEventListener(Events.cast.spell(talents.KEG_SMASH_TALENT), (event) =>
      this.spellUsable.endCooldown(talents.BREATH_OF_FIRE_TALENT.id, event.timestamp),
    );
  }
}
