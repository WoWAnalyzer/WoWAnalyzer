import SPELLS from 'common/SPELLS/warrior';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TALENTS from 'common/TALENTS/warrior';

const BUFF_DURATION = 30000;

class VoilentOutBurstWaste extends Analyzer {
  totalBuffsGained = 0;
  wastedBuffs = 0;
  buffApplication = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.VIOLENT_OUTBURST_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.VIOLENT_OUTBURST_BUFF),
      this.gainBuff,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.VIOLENT_OUTBURST_BUFF),
      this.refreshBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.VIOLENT_OUTBURST_BUFF),
      this.removeBuff,
    );
  }

  gainBuff(event: ApplyBuffEvent) {
    this.totalBuffsGained += 1;
    this.buffApplication = event.timestamp;
  }

  refreshBuff(event: RefreshBuffEvent) {
    this.totalBuffsGained += 1;
    this.wastedBuffs += 1;
    this.buffApplication = event.timestamp;
  }

  removeBuff(event: RemoveBuffEvent) {
    if (this.buffApplication + BUFF_DURATION < event.timestamp) {
      this.wastedBuffs += 1;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringValueText
          label={
            <>
              <SpellIcon spell={TALENTS.VIOLENT_OUTBURST_TALENT} /> Unused Buffs
            </>
          }
        >
          <>
            {this.wastedBuffs} <small>unused</small>
          </>
        </BoringValueText>
      </Statistic>
    );
  }
}

export default VoilentOutBurstWaste;
