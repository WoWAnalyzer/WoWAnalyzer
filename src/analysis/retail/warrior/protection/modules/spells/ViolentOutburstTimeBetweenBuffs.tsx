import SPELLS from 'common/SPELLS/warrior';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent } from 'parser/core/Events';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TALENTS from 'common/TALENTS/warrior';

class ViolentOutburstTimeBetweenBuffs extends Analyzer {
  totalBuffsGained: number = 0;
  firstBuffGained: number = 0;
  lastBuffGained: number = 0;

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
  }

  gainBuff(event: ApplyBuffEvent) {
    if (this.totalBuffsGained === 0) {
      this.firstBuffGained = event.timestamp;
    } else {
      this.lastBuffGained = event.timestamp;
    }
    this.totalBuffsGained += 1;
  }

  get buffWindow() {
    return this.lastBuffGained - this.firstBuffGained;
  }

  get averageTimeBetweenSeconds() {
    if (this.totalBuffsGained === 0) {
      return 'Outburst was never gained';
    } else if (this.totalBuffsGained === 1) {
      return 'Outburst was only gained once';
    } else {
      return (this.buffWindow / 1000 / (this.totalBuffsGained - 1)).toFixed(2) + `s`;
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
              <SpellIcon id={TALENTS.VIOLENT_OUTBURST_TALENT.id} /> Average Time Between Outbursts
            </>
          }
        >
          <>
            {this.averageTimeBetweenSeconds} <small>Average Time Between</small>
          </>
        </BoringValueText>
      </Statistic>
    );
  }
}

export default ViolentOutburstTimeBetweenBuffs;
