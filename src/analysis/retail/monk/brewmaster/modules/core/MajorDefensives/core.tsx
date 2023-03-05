import styled from '@emotion/styled';
import { formatDuration, formatNumber } from 'common/format';
import Spell from 'common/SPELLS/Spell';
import { Talent } from 'common/TALENTS/types';
import MAGIC_SCHOOLS, { color } from 'game/MAGIC_SCHOOLS';
import SPECS from 'game/SPECS';
import { SpellLink, Tooltip } from 'interface';
import { PerformanceMark } from 'interface/guide';
import { CooldownExpandableItem } from 'interface/guide/components/CooldownExpandable';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AnyEvent,
  ApplyBuffEvent,
  DamageEvent,
  FightEndEvent,
  RemoveBuffEvent,
  ResourceActor,
} from 'parser/core/Events';
import BoringValue from 'parser/ui/BoringValueText';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { ReactNode } from 'react';

export type MitigatedEvent = {
  event: AnyEvent;
  mitigatedAmount: number;
};

export type DefensiveOptions = {
  talent: Talent;
  buffSpell?: Spell;
};

export type Mitigation = {
  start: ApplyBuffEvent;
  end: RemoveBuffEvent | FightEndEvent;
  mitigated: MitigatedEvent[];
  amount: number;
};

export type MitigationSegment = {
  amount: number;
  color: string;
  tooltip: ReactNode;
};

export type MitigationChecklistItem = CooldownExpandableItem & {
  performance: QualitativePerformance;
};

export function absoluteMitigation(event: DamageEvent, mitPct: number): number {
  const actualAmount = event.amount + (event.absorbed ?? 0) + (event.overkill ?? 0);
  const priorAmount = actualAmount * (1 / (1 - mitPct));
  return priorAmount - actualAmount;
}

const MitigationTooltipBody = 'div';
const MitigationSegmentContainer = styled.div`
  width: 100%;
  height: 1em;
  text-align: left;
  line-height: 1em;
  background-color: rgba(255, 255, 255, 0.2);
`;
const MitigationRowContainer = styled.div`
  display: grid;
  grid-template-columns: 2em 2em 100px;
  gap: 1em;
  align-items: center;

  line-height: 1em;
  text-align: right;

  padding-bottom: 0.5em;
`;

// we use content-box sizing with a border because that makes the hitbox bigger, so it is easier to read the tooltips.
export const MitigationTooltipSegment = styled.div<{ color: string; width: number }>`
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

export const MitigationSegments = ({
  segments,
  maxValue,
  className,
}: {
  segments: MitigationSegment[];
  maxValue: number;
  className?: string;
}) => (
  <MitigationSegmentContainer className={className}>
    {segments.map((seg, ix) => (
      <Tooltip
        content={
          <>
            {seg.tooltip} - {formatNumber(seg.amount)}
          </>
        }
        key={ix}
      >
        <MitigationTooltipSegment color={seg.color} width={seg.amount / maxValue} />
      </Tooltip>
    ))}
  </MitigationSegmentContainer>
);

const MitigationRow = ({
  mitigation,
  segments,
  maxValue,
  fightStart,
}: {
  mitigation: Mitigation;
  segments: MitigationSegment[];
  maxValue: number;
  fightStart: number;
}) => {
  return (
    <MitigationRowContainer>
      <div>{formatDuration(mitigation.start.timestamp - fightStart)}</div>
      <div>{formatNumber(mitigation.amount)}</div>
      <MitigationSegments segments={segments} maxValue={maxValue} />
    </MitigationRowContainer>
  );
};

export class MajorDefensive extends Analyzer {
  private lastApply?: ApplyBuffEvent;
  private currentMitigation?: MitigatedEvent[];

  private mitigationData: Mitigation[] = [];

  private talent: Talent;
  private buff: Spell;
  private talentCategory: STATISTIC_CATEGORY;

  get spell() {
    return this.talent;
  }

  appliesToEvent(buffEvent: ApplyBuffEvent): boolean {
    return buffEvent.ability.guid === this.buff.id;
  }

  constructor({ talent, buffSpell }: DefensiveOptions, options: Options) {
    super(options);
    this.talentCategory =
      this.selectedCombatant.specId === SPECS.MISTWEAVER_MONK.id
        ? STATISTIC_CATEGORY.THEORYCRAFT
        : STATISTIC_CATEGORY.TALENTS;
    this.active = this.selectedCombatant.hasTalent(talent);
    this.talent = talent;
    this.buff = buffSpell ?? talent;

    this.addEventListener(Events.applybuff.spell(this.buff).by(SELECTED_PLAYER), this.onApply);
    this.addEventListener(Events.removebuff.spell(this.buff).by(SELECTED_PLAYER), this.onRemove);
    this.addEventListener(Events.fightend, this.onRemove);
  }

  protected recordMitigation(mitigation: MitigatedEvent) {
    this.currentMitigation?.push(mitigation);
  }

  private onApply(event: ApplyBuffEvent) {
    this.lastApply = event;
    this.currentMitigation = [];
  }

  private onRemove(event: RemoveBuffEvent | FightEndEvent) {
    if (!this.lastApply || !this.currentMitigation) {
      // no apply, nothing we can do. probably looking at a slice of a log
      return;
    }

    this.mitigationData.push({
      start: this.lastApply,
      end: event,
      mitigated: this.currentMitigation,
      amount: this.currentMitigation
        .map((event) => event.mitigatedAmount)
        .reduce((a, b) => a + b, 0),
    });
    this.lastApply = undefined;
    this.currentMitigation = undefined;
  }

  get mitigations() {
    return this.mitigationData;
  }

  get defensiveActive(): boolean {
    return this.lastApply !== undefined;
  }

  mitigationSegments(mit: Mitigation): MitigationSegment[] {
    return [
      {
        amount: mit.amount,
        color: color(MAGIC_SCHOOLS.ids.PHYSICAL),
        tooltip: (
          <>
            Base <SpellLink id={this.spell} />
          </>
        ),
      },
    ];
  }

  get firstSeenMaxHp(): number {
    return (
      this.owner.eventHistory.find(
        (event): event is AnyEvent & { maxHitPoints: number } =>
          'maxHitPoints' in event &&
          event.resourceActor === ResourceActor.Target &&
          event.targetID === this.selectedCombatant.id,
      )?.maxHitPoints ?? 1
    );
  }

  explainPerformance(mit: Mitigation): { perf: QualitativePerformance; explanation?: ReactNode } {
    if (this.firstSeenMaxHp <= mit.amount) {
      return {
        perf: QualitativePerformance.Perfect,
        explanation: 'Usage mitigated over 100% of your HP',
      };
    }

    if (this.firstSeenMaxHp / 4 > mit.amount) {
      return {
        perf: QualitativePerformance.Ok,
        explanation: 'Usage mitigated less than 25% of your HP',
      };
    }

    return { perf: QualitativePerformance.Good };
  }

  // TODO: make abstract
  description(): ReactNode {
    return <>TODO</>;
  }

  mitigationPerformance(maxValue: number): BoxRowEntry[] {
    return this.mitigationData.map((mit) => {
      const { perf, explanation } = this.explainPerformance(mit);
      return {
        value: perf,
        tooltip: (
          <>
            <PerformanceUsageRow>
              <PerformanceMark perf={perf} /> {explanation ?? 'Good Usage'}
            </PerformanceUsageRow>
            <MitigationTooltipBody>
              <MitigationRowContainer>
                <strong>Time</strong>
                <strong>Mit.</strong>
              </MitigationRowContainer>
              <MitigationRow
                mitigation={mit}
                segments={this.mitigationSegments(mit)}
                fightStart={this.owner.fight.start_time}
                maxValue={maxValue}
                key={mit.start.timestamp}
              />
            </MitigationTooltipBody>
          </>
        ),
      };
    });
  }

  statistic(): ReactNode {
    const tooltip = (
      <MitigationTooltipBody>
        <MitigationRowContainer>
          <strong>Time</strong>
          <strong>Mit.</strong>
        </MitigationRowContainer>
        {this.mitigationData.map((mit) => (
          <MitigationRow
            mitigation={mit}
            segments={this.mitigationSegments(mit)}
            fightStart={this.owner.fight.start_time}
            maxValue={Math.max.apply(
              null,
              this.mitigationData.map((mit) => mit.amount),
            )}
            key={mit.start.timestamp}
          />
        ))}
      </MitigationTooltipBody>
    );
    return (
      <Statistic category={this.talentCategory} size="flexible" tooltip={tooltip}>
        <BoringValue
          label={
            <>
              <SpellLink id={this.talent} /> Damage Mitigated
            </>
          }
        >
          <img alt="Damage Mitigated" src="/img/shield.png" className="icon" />{' '}
          {formatNumber(
            this.mitigationData
              .flatMap((mit) => mit.mitigated.map((event) => event.mitigatedAmount))
              .reduce((a, b) => a + b, 0),
          )}
        </BoringValue>
      </Statistic>
    );
  }
}
