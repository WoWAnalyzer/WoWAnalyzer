import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

export class BlessingOfTheSeasons extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.BLESSING_OF_SUMMER_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applybuff.spell(SPELLS.BLESSING_OF_AUTUMN_TALENT).to(SELECTED_PLAYER),
      this.onApplyAutumn,
    );
    this.addEventListener(
      Events.removebuff.spell(SPELLS.BLESSING_OF_AUTUMN_TALENT).to(SELECTED_PLAYER),
      this.onRemoveAutumn,
    );
  }

  onApplyAutumn() {
    this.spellUsable.applyCooldownRateChange('ALL', 1.3);
  }

  onRemoveAutumn() {
    this.spellUsable.removeCooldownRateChange('ALL', 1.3);
  }
}
