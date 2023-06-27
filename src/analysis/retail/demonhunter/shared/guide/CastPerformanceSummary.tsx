import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Spell from 'common/SPELLS/Spell';

import { formatPercentage } from 'common/format';
import SpellLink from 'interface/SpellLink';

const perfectMessage = 'perfect';
const goodMessage = 'good';
const okMessage = 'ok';
const badMessage = 'bad';

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
      <>
        <strong>{formattedPercentage}%</strong> of your <SpellLink spell={spell} /> casts were{' '}
        {performanceMessage}.
      </>
    </p>
  );
};

export default CastPerformanceSummary;
