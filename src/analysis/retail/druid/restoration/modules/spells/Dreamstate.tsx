import { TALENTS_DRUID } from 'common/TALENTS';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Events, { CastEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import { SpellIcon } from 'interface';
import BoringValue from 'parser/ui/BoringValueText';
import { formatNumber } from 'common/format';

const cdrPerTick = 3;

class Dreamstate extends Analyzer {
  tickCount = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.GROVE_TENDING_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.TRANQUILITY_HEAL),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    this.tickCount += 1;
  }

  get totalCDR() {
    return cdrPerTick * this.tickCount;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(6)} // number based on talent row
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Total Cooldown Reduction from all Tranquility casts:{' '}
            <strong>{this.totalCDR} seconds</strong>
          </>
        }
      >
        <BoringValue
          label={
            <>
              <SpellIcon id={TALENTS_DRUID.DREAMSTATE_TALENT.id} /> Dreamstate CDR per minute
            </>
          }
        >
          <>{formatNumber(this.owner.getPerMinute(this.totalCDR))} seconds</>
        </BoringValue>
      </Statistic>
    );
  }
}

export default Dreamstate;
