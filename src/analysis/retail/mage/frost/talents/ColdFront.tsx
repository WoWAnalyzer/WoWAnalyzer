import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellIcon } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, { GetRelatedEvent, ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class ColdFront extends Analyzer {
  bonusFrozenOrbs = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.COLD_FRONT_TALENT);
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.COLD_FRONT_BUFF),
      this.onBuffApplied,
    );
  }

  onBuffApplied(event: ApplyBuffEvent) {
    const remove: RemoveBuffEvent | undefined = GetRelatedEvent(event, 'BuffRemove');
    if (remove) {
      this.bonusFrozenOrbs += 1;
    }
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip="This shows the number of extra Frozen Orb casts that were gained by using the Cold Front legendary effect."
      >
        <BoringSpellValueText spell={TALENTS.COLD_FRONT_TALENT}>
          <SpellIcon spell={TALENTS.FROZEN_ORB_TALENT} /> {`${formatNumber(this.bonusFrozenOrbs)}`}{' '}
          <small>Extra Frozen Orbs</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ColdFront;
