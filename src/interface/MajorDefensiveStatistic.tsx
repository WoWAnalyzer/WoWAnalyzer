import { formatNumber } from 'common/format';
import BoringValue from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import MajorDefensive, {
  MitigationRow,
  MitigationRowContainer,
  MitigationTooltipBody,
} from './guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import { useFight } from './report/context/FightContext';
import SpellLink from './SpellLink';

export default function MajorDefensiveStatistic({
  analyzer,
  ...props
}: { analyzer: MajorDefensive<any, any> } & Omit<
  React.ComponentProps<typeof Statistic>,
  'children'
>): JSX.Element {
  const { fight } = useFight();
  const tooltip = (
    <MitigationTooltipBody>
      <MitigationRowContainer>
        <strong>Time</strong>
        <strong>Mit.</strong>
      </MitigationRowContainer>
      {analyzer.mitigations.map((mit) => (
        <MitigationRow
          mitigation={mit}
          segments={analyzer.mitigationSegments(mit)}
          fightStart={fight.start_time}
          maxValue={Math.max.apply(
            null,
            analyzer.mitigations.map((mit) => mit.amount),
          )}
          key={mit.start.timestamp}
        />
      ))}
    </MitigationTooltipBody>
  );
  return (
    <Statistic
      size="flexible"
      tooltip={analyzer.mitigations.length > 0 ? tooltip : undefined}
      {...props}
    >
      <BoringValue
        label={
          <>
            <SpellLink spell={analyzer.spell} /> Damage Mitigated
          </>
        }
      >
        <img alt="Damage Mitigated" src="/img/shield.png" className="icon" />{' '}
        {formatNumber(
          analyzer.mitigations
            .flatMap((mit) => mit.mitigated.map((event) => event.mitigatedAmount))
            .reduce((a, b) => a + b, 0),
        )}
      </BoringValue>
    </Statistic>
  );
}
