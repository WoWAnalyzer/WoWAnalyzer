import { Fragment, useState } from 'react';
import { ControlledExpandable } from 'interface';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import GradiatedPerformanceBar, {
  GradiatedPerformanceBarInfo,
} from 'interface/guide/components/GradiatedPerformanceBar';
import { Trans } from '@lingui/macro';
import Spell from 'common/SPELLS/Spell';
import SpellLink from 'interface/SpellLink';
import { ClickToExpand, MouseoverForMoreDetails } from './CommonLinguiTranslations';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import CastPerformanceSummary from 'analysis/retail/demonhunter/shared/guide/CastPerformanceSummary';
import styled from '@emotion/styled';
import PerformanceBoxRowGrid from 'interface/guide/components/PerformanceBoxRowGrid';

const CastSummaryAndBreakdownContainer = styled.div`
  margin-bottom: 10px;
`;

const toGradiatedPerformanceBarProp = (
  count: number,
  label: string | undefined,
): number | GradiatedPerformanceBarInfo => {
  if (label) {
    return { count, label };
  }
  return count;
};

interface Props {
  spell: number | Spell;
  castEntries: BoxRowEntry[];
  perfectLabel?: string;
  perfectExtraExplanation?: string;
  includePerfectCastPercentage?: boolean;
  goodLabel?: string;
  goodExtraExplanation?: string;
  includeGoodCastPercentage?: boolean;
  okLabel?: string;
  okExtraExplanation?: string;
  includeOkCastPercentage?: boolean;
  badLabel?: string;
  badExtraExplanation?: string;
  includeBadCastPercentage?: boolean;
  onClickBox?: (index: number) => void;
}

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

  const perfectExplanation = !perfectExtraExplanation ? (
    <Trans id="guide.castSummaryAndBreakdown.header.perfectWithoutExtraExplanation">
      Blue is a perfect cast
    </Trans>
  ) : (
    <Trans id="guide.castSummaryAndBreakdown.header.perfectWithExtraExplanation">
      Blue is a perfect cast ({perfectExtraExplanation})
    </Trans>
  );
  const goodExplanation = !goodExtraExplanation ? (
    <Trans id="guide.castSummaryAndBreakdown.header.goodWithoutExtraExplanation">
      Green is a good cast
    </Trans>
  ) : (
    <Trans id="guide.castSummaryAndBreakdown.header.goodWithExtraExplanation">
      Green is a good cast ({goodExtraExplanation})
    </Trans>
  );
  const okExplanation = !okExtraExplanation ? (
    <Trans id="guide.castSummaryAndBreakdown.header.okWithoutExtraExplanation">
      Yellow is an ok cast
    </Trans>
  ) : (
    <Trans id="guide.castSummaryAndBreakdown.header.okWithExtraExplanation">
      Yellow is an ok cast ({okExtraExplanation})
    </Trans>
  );
  const badExplanation = !badExtraExplanation ? (
    <Trans id="guide.castSummaryAndBreakdown.header.badWithoutExtraExplanation">
      Red is a bad cast
    </Trans>
  ) : (
    <Trans id="guide.castSummaryAndBreakdown.header.badWithExtraExplanation">
      Red is a bad cast ({badExtraExplanation})
    </Trans>
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
        <SpellLink id={spell} />{' '}
        <Trans id="guide.castSummaryAndBreakdown.header.casts">casts</Trans>
      </strong>{' '}
      <small>
        - {performanceExplanation}. <MouseoverForMoreDetails /> <ClickToExpand />
      </small>
      <ControlledExpandable
        header={
          <GradiatedPerformanceBar
            perfect={toGradiatedPerformanceBarProp(perfect, perfectLabel)}
            good={toGradiatedPerformanceBarProp(good, goodLabel)}
            ok={toGradiatedPerformanceBarProp(ok, okLabel)}
            bad={toGradiatedPerformanceBarProp(bad, badLabel)}
          />
        }
        element="section"
        expanded={isExpanded}
        inverseExpanded={() => setIsExpanded(!isExpanded)}
      >
        <small>
          <MouseoverForMoreDetails />
        </small>
        <PerformanceBoxRowGrid onClickBox={onClickBox} values={castEntries} />
      </ControlledExpandable>
    </CastSummaryAndBreakdownContainer>
  );
};

export default CastSummaryAndBreakdown;
