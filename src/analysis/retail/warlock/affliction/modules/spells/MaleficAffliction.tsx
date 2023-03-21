import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import { TooltipElement } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import UptimeIcon from 'interface/icons/Uptime';
import TalentSpellText from 'parser/ui/TalentSpellText';

export default class MaleficAffliction extends Analyzer {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.MALEFIC_AFFLICTION_TALENT);
  }

  get uptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.MALEFIC_AFFLICTION_BUFF.id) /
      this.owner.fightDuration
    );
  }

  get stackUptimesPercentages() {
    const uptimePercentages: { [key: string]: number } = {};
    Object.entries(
      this.selectedCombatant.getStackBuffUptimes(SPELLS.MALEFIC_AFFLICTION_BUFF.id),
    ).forEach(([stackCount, uptime]) =>
      Number(stackCount) > 0
        ? (uptimePercentages[stackCount] = uptime / this.owner.fightDuration)
        : {},
    );
    return uptimePercentages;
  }

  statistic() {
    const stackUptimes = this.stackUptimesPercentages;
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            {formatPercentage(this.uptime)} uptime
            <br />
          </>
        }
      >
        <TalentSpellText talent={TALENTS.MALEFIC_AFFLICTION_TALENT}>
          <UptimeIcon /> {formatPercentage(this.uptime)} %
          <TooltipElement
            content={
              <>
                1 stack: {formatPercentage(stackUptimes[1])} %<br />2 stacks:{' '}
                {formatPercentage(stackUptimes[2])} % <br />3 stacks:{' '}
                {formatPercentage(stackUptimes[3])} %
              </>
            }
          >
            <small>uptime</small>
          </TooltipElement>
        </TalentSpellText>
      </Statistic>
    );
  }
}
