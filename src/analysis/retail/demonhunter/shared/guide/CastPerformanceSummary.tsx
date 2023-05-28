import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Spell from 'common/SPELLS/Spell';
import { t, Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SpellLink from 'interface/SpellLink';

const perfectMessage = t({ id: 'guide.performance.perfect', message: 'perfect' });
const goodMessage = t({ id: 'guide.performance.good', message: 'good' });
const okMessage = t({ id: 'guide.performance.ok', message: 'ok' });
const badMessage = t({ id: 'guide.performance.bad', message: 'bad' });

const performanceToMessage = (performance: QualitativePerformance) => {
  switch (performance) {
    case QualitativePerformance.Perfect:
      return perfectMessage;
    case QualitativePerformance.Good:
      return goodMessage;
    case QualitativePerformance.Ok:
      return okMessage;
    case QualitativePerformance.Fail:
      return badMessage;
  }
};

interface Props {
  casts: number;
  performance: QualitativePerformance;
  spell: number | Spell;
  totalCasts: number;
}
const CastPerformanceSummary = ({ casts, performance, spell, totalCasts }: Props) => {
  const percentage = casts / totalCasts;
  const formattedPercentage = formatPercentage(percentage, 1);
  const performanceMessage = performanceToMessage(performance);
  return (
    <p>
      <Trans id="guide.castPerformanceSummary">
        <strong>{formattedPercentage}%</strong> of your <SpellLink spell={spell} /> casts were{' '}
        {performanceMessage}.
      </Trans>
    </p>
  );
};

export default CastPerformanceSummary;
