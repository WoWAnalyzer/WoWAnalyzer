import { Fragment, useState } from 'react';
import { ControlledExpandable } from 'interface';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import GradiatedPerformanceBar from 'interface/guide/components/GradiatedPerformanceBar';
import Spell from 'common/SPELLS/Spell';
import SpellLink from 'interface/SpellLink';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import CastPerformanceSummary from 'analysis/retail/demonhunter/shared/guide/CastPerformanceSummary';
import styled from '@emotion/styled';

const CastSummaryAndBreakdownContainer = styled.div`
  margin-bottom: 10px;
`;

interface Props {
  /** The spell ID or Spell object being represented, used in explanatory text */
  spell: number | Spell;
  /** A per-cast evaluation of the data to be displayed */
  castEntries: BoxRowEntry[];
  /** A label to include when mousing over the 'perfect' section of the Performance Bar */
  perfectLabel?: React.ReactNode;
  /** A brief explanation of what makes a cast 'perfect', included in explanatory text */
  perfectExtraExplanation?: React.ReactNode;
  /** If set, text with the percentage of perfect casts is shown before the Performance Bar */
  includePerfectCastPercentage?: boolean;
  /** A label to include when mousing over the 'good' section of the Performance Bar */
  goodLabel?: React.ReactNode;
  /** A brief explanation of what makes a cast 'good', included in explanatory text */
  goodExtraExplanation?: React.ReactNode;
  /** If set, text with the percentage of good casts is shown before the Performance Bar */
  includeGoodCastPercentage?: boolean;
  /** A label to include when mousing over the 'ok' section of the Performance Bar */
  okLabel?: React.ReactNode;
  /** A brief explanation of what makes a cast 'ok', included in explanatory text */
  okExtraExplanation?: React.ReactNode;
  /** If set, text with the percentage of ok casts is shown before the Performance Bar */
  includeOkCastPercentage?: boolean;
  /** A label to include when mousing over the 'bad' section of the Performance Bar */
  badLabel?: React.ReactNode;
  /** A brief explanation of what makes a cast 'bad', included in explanatory text */
  badExtraExplanation?: React.ReactNode;
  /** If set, text with the percentage of bad casts is shown before the Performance Bar */
  includeBadCastPercentage?: boolean;
  /** If set, explanatory text uses the word 'use' instead of 'cast'. Useful if data is evaluating
   *  procs instead of casts */
  usesInsteadOfCasts?: boolean;
  /** A callback to use when the Performance Box with the given index is clicked */
  onClickBox?: (index: number) => void;
}

/**
 * A {@link GradiatedPerformanceBar} that can be clicked to expand into a {@link PerformanceBoxRow}.
 */
const CastSummaryAndBreakdown = ({
  spell,
  castEntries,
  perfectLabel,
  perfectExtraExplanation,
  includePerfectCastPercentage,
  goodLabel,
  goodExtraExplanation,
  includeGoodCastPercentage,
  okLabel,
  okExtraExplanation,
  includeOkCastPercentage,
  badLabel,
  badExtraExplanation,
  includeBadCastPercentage,
  usesInsteadOfCasts,
  onClickBox,
}: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const perfect = castEntries.filter((it) => it.value === QualitativePerformance.Perfect).length;
  const good = castEntries.filter((it) => it.value === QualitativePerformance.Good).length;
  const ok = castEntries.filter((it) => it.value === QualitativePerformance.Ok).length;
  const bad = castEntries.filter((it) => it.value === QualitativePerformance.Fail).length;

  const hasPerfectCasts = perfect !== 0;
  const hasGoodCasts = good !== 0;
  const hasOkCasts = ok !== 0;
  const hasBadCasts = bad !== 0;

  const instanceWord = usesInsteadOfCasts ? 'use' : 'cast';

  const perfectExplanation = !perfectExtraExplanation ? (
    <>Blue is a perfect {instanceWord}</>
  ) : (
    <>
      Blue is a perfect {instanceWord} ({perfectExtraExplanation})
    </>
  );
  const goodExplanation = !goodExtraExplanation ? (
    <>Green is a good {instanceWord}</>
  ) : (
    <>
      Green is a good {instanceWord} ({goodExtraExplanation})
    </>
  );
  const okExplanation = !okExtraExplanation ? (
    <>Yellow is an ok {instanceWord}</>
  ) : (
    <>
      Yellow is an ok {instanceWord} ({okExtraExplanation})
    </>
  );
  const badExplanation = !badExtraExplanation ? (
    <>Red is a bad {instanceWord}</>
  ) : (
    <>
      Red is a bad {instanceWord} ({badExtraExplanation})
    </>
  );

  const performanceExplanation = [
    hasPerfectCasts ? perfectExplanation : null,
    hasGoodCasts ? goodExplanation : null,
    hasOkCasts ? okExplanation : null,
    hasBadCasts ? badExplanation : null,
  ]
    .filter((explanation): explanation is JSX.Element => explanation !== null)
    .map((explanation, idx) => (
      <Fragment key={idx}>
        {idx > 0 && ', '}
        {explanation}
      </Fragment>
    ));

  const perfectBarLabel = perfectLabel || `Perfect ${instanceWord}s`;
  const goodBarLabel = goodLabel || `Good ${instanceWord}s`;
  const okBarLabel = okLabel || `Ok ${instanceWord}s`;
  const badBarLabel = badLabel || `Bad ${instanceWord}s`;

  return (
    <CastSummaryAndBreakdownContainer>
      {includePerfectCastPercentage && (
        <CastPerformanceSummary
          casts={perfect}
          performance={QualitativePerformance.Perfect}
          spell={spell}
          totalCasts={castEntries.length}
        />
      )}
      {includeGoodCastPercentage && (
        <CastPerformanceSummary
          casts={good}
          performance={QualitativePerformance.Good}
          spell={spell}
          totalCasts={castEntries.length}
        />
      )}
      {includeOkCastPercentage && (
        <CastPerformanceSummary
          casts={ok}
          performance={QualitativePerformance.Ok}
          spell={spell}
          totalCasts={castEntries.length}
        />
      )}
      {includeBadCastPercentage && (
        <CastPerformanceSummary
          casts={bad}
          performance={QualitativePerformance.Fail}
          spell={spell}
          totalCasts={castEntries.length}
        />
      )}
      <strong>
        <SpellLink spell={spell} /> casts
      </strong>{' '}
      <small>
        - {performanceExplanation}. Mouseover for more details. Click to see per-{instanceWord}{' '}
        details.
      </small>
      <ControlledExpandable
        header={
          <GradiatedPerformanceBar
            perfect={{ count: perfect, label: perfectBarLabel }}
            good={{ count: good, label: goodBarLabel }}
            ok={{ count: ok, label: okBarLabel }}
            bad={{ count: bad, label: badBarLabel }}
          />
        }
        element="section"
        expanded={isExpanded}
        inverseExpanded={() => setIsExpanded(!isExpanded)}
      >
        <small>Mouseover for more details.</small>
        <PerformanceBoxRow onClickBox={onClickBox} values={castEntries} />
      </ControlledExpandable>
    </CastSummaryAndBreakdownContainer>
  );
};

export default CastSummaryAndBreakdown;
