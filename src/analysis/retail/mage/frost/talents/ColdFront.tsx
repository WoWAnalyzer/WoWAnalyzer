import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellIcon } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events from 'parser/core/Events';
import EventHistory from 'parser/shared/modules/EventHistory';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class ColdFront extends Analyzer {
  static dependencies = {
    eventHistory: EventHistory,
  };
  protected eventHistory!: EventHistory;

  bonusFrozenOrbs = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.COLD_FRONT_TALENT);
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.COLD_FRONT_BUFF),
      this.onBuffApplied,
    );
  }

  onBuffApplied() {
    const buffRemovedEvent = this.eventHistory.last(
      1,
      500,
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.COLD_FRONT_BUFF),
    );
    if (buffRemovedEvent) {
      this.bonusFrozenOrbs += 1;
    }
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
        tooltip="This shows the number of extra Frozen Orb casts that were gained by using the Cold Front legendary effect."
      >
        <BoringSpellValueText spellId={TALENTS.COLD_FRONT_TALENT.id}>
          <SpellIcon id={TALENTS.FROZEN_ORB_TALENT.id} /> {`${formatNumber(this.bonusFrozenOrbs)}`}{' '}
          <small>Extra Frozen Orbs</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ColdFront;
