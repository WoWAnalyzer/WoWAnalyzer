import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { AbsorbedEvent, HasRelatedEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import Combatants from 'parser/shared/modules/Combatants';
import { TALENTS_PRIEST } from 'common/TALENTS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import { POWER_WORD_SHIELD_ABSORB } from '../../../normalizers/CastLinkNormalizer';

class AssuredSafetyHoly extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  private totalAssuredSafetyAbsorb = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.ASSURED_SAFETY_TALENT);

    this.addEventListener(
      Events.absorbed.by(SELECTED_PLAYER).spell(SPELLS.POWER_WORD_SHIELD),
      this.handlePowerWordShield,
    );
  }

  handlePowerWordShield(event: AbsorbedEvent) {
    if (HasRelatedEvent(event, POWER_WORD_SHIELD_ABSORB)) {
      this.totalAssuredSafetyAbsorb += event.amount;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(99)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <BoringSpellValueText spell={TALENTS_PRIEST.ASSURED_SAFETY_TALENT}>
          <ItemPercentHealingDone amount={this.totalAssuredSafetyAbsorb} />
          <small>{' in absorbs'}</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default AssuredSafetyHoly;
