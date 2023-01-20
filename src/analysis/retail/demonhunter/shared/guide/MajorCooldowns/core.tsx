import { ReactNode } from 'react';
import { CastEvent } from 'parser/core/Events';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { Talent } from 'common/TALENTS/types';
import styled from '@emotion/styled';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import { PerformanceMark } from 'interface/guide';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

export interface UsageInfo {
  performance: QualitativePerformance;
  summary: ReactNode;
  details: ReactNode;
}
export interface CheckedUsageInfo extends UsageInfo {
  check: string;
}
export interface CooldownUse {
  event: CastEvent;
  checklistItems: CheckedUsageInfo[];
  performance: QualitativePerformance;
  performanceExplanation?: ReactNode;
}

export interface CooldownCast {
  event: CastEvent;
}

const CooldownTooltipBody = 'div';
const CooldownRowContainer = styled.div`
  display: grid;
  grid-template-columns: 2em auto;
  gap: 1em;
  align-items: center;

  line-height: 1em;
  text-align: left;

  padding-bottom: 0.5em;
`;

// we use content-box sizing with a border because that makes the hitbox bigger, so it is easier to read the tooltips.
export const CooldownTooltipSegment = styled.div<{ color: string; width: number }>`
  background-color: ${(props) => props.color};
  width: calc(${(props) => Math.max(2, props.width * 100)}% - 1px);
  height: 100%;
  display: inline-block;
  box-sizing: content-box;
  border-left: 1px solid #000;
`;

export const PerformanceUsageRow = styled.div`
  padding-bottom: 0.5em;

  & > :first-child {
    margin-right: 0.5em;
  }
`;

const CooldownRow = ({ usageInfo }: { usageInfo: UsageInfo }) => (
  <CooldownRowContainer>
    <div>
      <PerformanceMark perf={usageInfo.performance} />
    </div>
    <div>{usageInfo.summary}</div>
  </CooldownRowContainer>
);

interface CooldownOptions {
  talent: Talent;
}
export abstract class MajorCooldown<Cast extends CooldownCast> extends Analyzer {
  private cooldownCasts: Cast[] = [];
  private cooldownUses: CooldownUse[] = [];
  private readonly talent: Talent;

  protected constructor({ talent }: CooldownOptions, options: Options) {
    super(options);
    this.talent = talent;
    this.active = this.selectedCombatant.hasTalent(this.talent);
  }

  get casts() {
    return this.cooldownCasts;
  }

  get uses() {
    return this.cooldownUses;
  }

  get spell() {
    return this.talent;
  }

  abstract description(): ReactNode;

  abstract explainPerformance(cast: Cast): CooldownUse;

  cooldownPerformance(): BoxRowEntry[] {
    return this.cooldownUses.map(({ performance, performanceExplanation, checklistItems }) => ({
      value: performance,
      tooltip: (
        <>
          <PerformanceUsageRow>
            <PerformanceMark perf={performance} /> {performanceExplanation ?? 'Good Usage'}
          </PerformanceUsageRow>
          {checklistItems.length > 0 ? (
            <CooldownTooltipBody>
              <CooldownRowContainer>
                <strong>Perf.</strong>
                <strong>Summary</strong>
              </CooldownRowContainer>
              {checklistItems.map((usageInfo) => (
                <CooldownRow usageInfo={usageInfo} key={usageInfo.check} />
              ))}
            </CooldownTooltipBody>
          ) : undefined}
        </>
      ),
    }));
  }

  protected recordCooldown(cast: Cast) {
    this.cooldownCasts.push(cast);
    this.cooldownUses.push(this.explainPerformance(cast));
  }
}
