import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TooltipElement } from 'interface';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { RemoveBuffEvent } from 'parser/core/Events';
import StatisticBox from 'parser/ui/StatisticBox';

class PowerWordShieldWasted extends Analyzer {
  wasted = 0;
  count = 0;
  totalCount = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.POWER_WORD_SHIELD),
      this.onRemoveBuff,
    );
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    if (event.absorb && event.absorb > 0) {
      this.wasted += event.absorb;
      this.count += 1;
    }
    this.totalCount += 1;
  }

  statistic() {
    const wasted = this.wasted || 0;
    const count = this.count || 0;
    const totalCount = this.totalCount || 0;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.POWER_WORD_SHIELD.id} />}
        value={`${formatNumber((wasted / this.owner.fightDuration) * 1000)} HPS`}
        label={
          <TooltipElement
            content={`The amount of shield absorb remaining on Power Word: Shield instances that have expired. There was a total of ${formatNumber(
              wasted,
            )} unused Power Word: Shield absorb from ${count} shields with absorb remaining (a total of ${totalCount} shields were applied).`}
          >
            Unused PW:S absorb
          </TooltipElement>
        }
      />
    );
  }
}

export default PowerWordShieldWasted;
