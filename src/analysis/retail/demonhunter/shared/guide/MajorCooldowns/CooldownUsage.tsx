import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { BadColor, OkColor, PerformanceMark, SubSection, useAnalyzer } from 'interface/guide';
import styled from '@emotion/styled';
import { Highlight } from 'analysis/retail/monk/brewmaster/modules/spells/Shuffle/GuideSection';
import { ComponentPropsWithoutRef, Fragment, useCallback, useState } from 'react';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import ExplanationRow from 'interface/guide/components/ExplanationRow';
import Explanation from 'interface/guide/components/Explanation';
import { TooltipElement } from 'interface';
import { PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';

import { CooldownCast, CooldownUse, MajorCooldown, PerformanceUsageRow } from './core';

const MissingCastBoxEntry = {
  value: QualitativePerformance.Fail,
  tooltip: (
    <PerformanceUsageRow>
      <PerformanceMark perf={QualitativePerformance.Fail} /> Potential cast went unused
    </PerformanceUsageRow>
  ),
};

const PossibleMissingCastBoxEntry = {
  value: QualitativePerformance.Ok,
  tooltip: (
    <PerformanceUsageRow>
      <PerformanceMark perf={QualitativePerformance.Ok} /> Potential cast went unused, but may have
      been intentionally saved to handle a mechanic.
    </PerformanceUsageRow>
  ),
};

const NoData = styled.div`
  color: #999;
`;

const CooldownUsageDetailsContainer = styled.div`
  display: grid;
  grid-template-rows: max-content max-content max-content 1fr;

  & .performance-block.selected {
    height: 1em;
  }
`;

const CooldownDetailsContainer = styled.div`
  display: grid;
  margin-top: 1rem;
  grid-template-areas: 'talent source';
  grid-template-columns: 10% auto;
  grid-template-rows: 1fr;

  gap: 1rem;
  height: 100%;
  align-items: center;

  ${NoData} {
    justify-self: center;
    align-self: center;
    grid-column: 1 / -1;
  }

  > *:nth-child(odd) {
    justify-self: center;
  }
`;

const CooldownDetails = ({ cooldownUse }: { cooldownUse?: CooldownUse }) => {
  if (!cooldownUse) {
    return (
      <CooldownDetailsContainer>
        <NoData>Click on a box in the cast breakdown to view details.</NoData>
      </CooldownDetailsContainer>
    );
  }

  if (cooldownUse.checklistItems.length === 0) {
    return (
      <CooldownDetailsContainer>
        <NoData>
          There were no checks for this cast. This is either a bug or means this was a good cast.
        </NoData>
      </CooldownDetailsContainer>
    );
  }

  return (
    <CooldownDetailsContainer>
      <strong>Perf.</strong>
      <strong>Explanation</strong>
      {cooldownUse.checklistItems.map((checklistItem) => (
        <Fragment key={checklistItem.check}>
          <PerformanceMark perf={checklistItem.performance} />
          {checklistItem.details}
        </Fragment>
      ))}
    </CooldownDetailsContainer>
  );
};

type CooldownUsageProps<Cast extends CooldownCast> = Omit<
  ComponentPropsWithoutRef<typeof SubSection>,
  'children'
> & {
  analyzer: MajorCooldown<Cast>;
};
const CooldownUsage = <Cast extends CooldownCast>({
  analyzer,
  ...others
}: CooldownUsageProps<Cast>) => {
  const [selectedUse, setSelectedUse] = useState<number | undefined>();
  const castEfficiency = useAnalyzer(CastEfficiency)?.getCastEfficiencyForSpell(analyzer.spell);
  const possibleUses = castEfficiency?.maxCasts ?? 0;
  const performance = analyzer.cooldownPerformance();
  const actualCasts = performance.length;

  if (actualCasts === 0 && possibleUses > 1) {
    // if they didn't cast it and could have multiple times, we call all possible uses bad
    //
    // the possibleUses > 1 check excludes this from happening on very short fights (such as early wipes)
    for (let i = 0; i < possibleUses; i += 1) {
      performance.push(MissingCastBoxEntry);
    }
  } else {
    // if they cast it at least once, have some forgiveness. up to half (rounded up)
    // of possible casts get a yellow color. any beyond that are red.
    for (let i = possibleUses; i > actualCasts; i -= 1) {
      if (i > possibleUses / 2) {
        performance.push(PossibleMissingCastBoxEntry);
      } else {
        performance.push(MissingCastBoxEntry);
      }
    }
  }

  const uses = analyzer.uses;

  const onClickBox = useCallback(
    (index) => {
      if (index >= uses.length) {
        setSelectedUse(undefined);
      } else {
        setSelectedUse(index);
      }
    },
    [uses.length],
  );

  return (
    <SubSection style={{ paddingBottom: 20 }} {...others}>
      <ExplanationRow>
        <Explanation>{analyzer.description()}</Explanation>
        <CooldownUsageDetailsContainer>
          <div>
            <strong>Cast Breakdown</strong>{' '}
            <small>
              - These boxes represent each cast, colored by how good the usage was. Missed casts are
              also shown in{' '}
              <TooltipElement content="Used for casts that may have been skipped in order to save for crucial moments.">
                <Highlight color={OkColor} textColor="black">
                  yellow
                </Highlight>
              </TooltipElement>{' '}
              or{' '}
              <TooltipElement content="Used for casts that could have been used without impacting your other usage.">
                <Highlight color={BadColor} textColor="white">
                  red
                </Highlight>
              </TooltipElement>
              .
            </small>
          </div>
          <PerformanceBoxRow
            values={performance.map((p, ix) =>
              ix === selectedUse ? { ...p, className: 'selected' } : p,
            )}
            onClickBox={onClickBox}
          />
          <CooldownDetails
            cooldownUse={selectedUse !== undefined ? uses[selectedUse] : undefined}
          />
        </CooldownUsageDetailsContainer>
      </ExplanationRow>
    </SubSection>
  );
};

export default CooldownUsage;
