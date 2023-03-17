import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import UptimeIcon from 'interface/icons/Uptime';
import { TooltipElement } from 'interface';

class WrathOfConsumption extends Analyzer {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.WRATH_OF_CONSUMPTION_TALENT);
  }

  get totalUptimePercent() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.WRATH_OF_CONSUMPTION_BUFF.id) /
      this.owner.fightDuration
    );
  }

  get stackUptimesPercentages() {
    const uptimePercentages: { [key: string]: number } = {};
    Object.entries(
      this.selectedCombatant.getStackBuffUptimes(SPELLS.WRATH_OF_CONSUMPTION_BUFF.id),
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
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
        <TalentSpellText talent={TALENTS.WRATH_OF_CONSUMPTION_TALENT}>
          <UptimeIcon /> {formatPercentage(this.totalUptimePercent, 0)} %{' '}
          <TooltipElement
            content={
              <>
                0 stacks: {formatPercentage(1 - this.totalUptimePercent)} %<br />1 stack:{' '}
                {formatPercentage(stackUptimes[1])} %<br />2 stacks:{' '}
                {formatPercentage(stackUptimes[2])} %<br />3 stacks:{' '}
                {formatPercentage(stackUptimes[3])} % <br />4 stacks:{' '}
                {formatPercentage(stackUptimes[4])} %<br />5 stacks:{' '}
                {formatPercentage(stackUptimes[5])} %
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

export default WrathOfConsumption;
