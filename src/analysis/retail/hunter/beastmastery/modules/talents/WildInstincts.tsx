import { formatNumber } from 'common/format';
import TALENTS from 'common/TALENTS/hunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HasRelatedEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { WILD_INSTINCTS_TRIGGER } from 'analysis/retail/hunter/beastmastery/normalizers/EventLinkConstants';

/**
 * When your primary pet uses Stomp, apply Barbed Shot to a target hit by that Stomp.
 * This Barbed Shot will not cause an extra Stomp.
 */

class WildInstincts extends Analyzer {
  casts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.WILD_INSTINCTS_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.BARBED_SHOT_TALENT),
      this.onBarbedShotCast,
    );
  }

  onBarbedShotCast(event: CastEvent) {
    if (HasRelatedEvent(event, WILD_INSTINCTS_TRIGGER)) {
      this.casts++;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(3)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={TALENTS.WILD_INSTINCTS_TALENT}>
          {formatNumber(this.casts)}
          <small>casts</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default WildInstincts;
