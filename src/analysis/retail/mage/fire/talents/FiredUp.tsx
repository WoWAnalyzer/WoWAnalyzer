import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, ApplyBuffStackEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

class FiredUp extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.FIRED_UP_2_FIRE_TALENT);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.FIRED_UP_BUFF),
      this.onFiredUpApplied,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.FIRED_UP_BUFF),
      this.onFiredUpApplied,
    );
  }

  onFiredUpApplied(event: ApplyBuffEvent | ApplyBuffStackEvent) {
    if (this.selectedCombatant.getTalentRank(TALENTS.FIRED_UP_2_FIRE_TALENT) === 1) {
      this.spellUsable.reduceCooldown(SPELLS.FIRE_BLAST.id, 2500, event.timestamp);
    } else if (this.selectedCombatant.getTalentRank(TALENTS.FIRED_UP_2_FIRE_TALENT) === 2) {
      this.spellUsable.reduceCooldown(SPELLS.FIRE_BLAST.id, 5000, event.timestamp);
    }
  }
}

export default FiredUp;
