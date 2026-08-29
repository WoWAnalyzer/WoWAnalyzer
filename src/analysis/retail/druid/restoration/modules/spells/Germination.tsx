import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import { TALENTS_DRUID } from 'common/TALENTS';
import { Options } from 'parser/core/Module';
import Events from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import { SpellIcon, SpellLink } from 'interface';

/**
 * **Germination**
 * Spec Talent Tier 12
 *
 * You can apply Rejuvenation twice to the same target.
 */
export default class Germination extends Analyzer {
  totalRejuvs = 0;
  germs = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.GERMINATION_TALENT);
    this.addEventListener(
      Events.applybuff
        .by(SELECTED_PLAYER)
        .spell([SPELLS.REJUVENATION, SPELLS.REJUVENATION_GERMINATION]),
      this.onApplyAnyRejuv,
    );
    this.addEventListener(
      Events.refreshbuff
        .by(SELECTED_PLAYER)
        .spell([SPELLS.REJUVENATION, SPELLS.REJUVENATION_GERMINATION]),
      this.onApplyAnyRejuv,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.REJUVENATION_GERMINATION),
      this.onApplyGerm,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.REJUVENATION_GERMINATION),
      this.onApplyGerm,
    );
  }

  onApplyAnyRejuv() {
    this.totalRejuvs += 1;
  }

  onApplyGerm() {
    this.germs += 1;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(6)} // number based on talent row
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <p>
              Out of <strong>{this.totalRejuvs}</strong> total{' '}
              <SpellLink spell={SPELLS.REJUVENATION} /> applications, <strong>{this.germs}</strong>{' '}
              were the 2nd on target (<SpellLink spell={SPELLS.REJUVENATION_GERMINATION} />)
            </p>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.GERMINATION_TALENT}>
          <SpellIcon spell={SPELLS.REJUVENATION_GERMINATION} /> {this.germs} /{' '}
          <SpellIcon spell={SPELLS.REJUVENATION} /> {this.totalRejuvs}
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
