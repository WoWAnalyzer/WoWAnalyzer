import styled from '@emotion/styled';
import { formatDuration, formatNumber } from 'common/format';
import Spell from 'common/SPELLS/Spell';
import { isTalent } from 'common/TALENTS/types';
import MAGIC_SCHOOLS, { color } from 'game/MAGIC_SCHOOLS';
import { SpellLink, Tooltip } from 'interface';
import { PerformanceMark, useAnalyzers } from 'interface/guide';
import { CooldownExpandableItem } from 'interface/guide/components/CooldownExpandable';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AnyEvent,
  BuffEvent,
  DamageEvent,
  EventType,
  FightEndEvent,
  ResourceActor,
} from 'parser/core/Events';
import BoringValue from 'parser/ui/BoringValueText';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { ReactNode, useMemo } from 'react';
import Enemies from 'parser/shared/modules/Enemies';
import { shouldIgnore } from 'parser/shared/modules/hit-tracking/utilities';
import { isDefined } from 'common/typeGuards';

export type MitigatedEvent = {
  event: AnyEvent;
  mitigatedAmount: number;
};

export type MajorDefensiveOptions = {
  triggerSpell: Spell;
  appliedSpell?: Spell;
  isBuff?: boolean;
};

export type Mitigation = {
  start: BuffEvent<EventType.ApplyBuff | EventType.ApplyDebuff>;
  end: BuffEvent<EventType.RemoveBuff | EventType.RemoveDebuff> | FightEndEvent;
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

/**
 * Represents a Major Defensive's spell information.
 */
export interface MajorDefensiveSpellData {
  triggerSpell: Spell;
  appliedSpell?: Spell;
  bufferMs?: number;
  isBuff: boolean;
}

export class MajorDefensive extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  isBuff: boolean;
  protected mitigationData: Mitigation[] = [];
  protected triggerSpell: Spell;
  protected appliedSpell: Spell;
  protected lastApply?: BuffEvent<EventType.ApplyBuff | EventType.ApplyDebuff>;
  protected currentMitigation?: MitigatedEvent[];
  protected enemies!: Enemies;

  constructor(
    { triggerSpell, appliedSpell, isBuff = true }: MajorDefensiveOptions,
    options: Options,
  ) {
    super(options);
    this.active =
      !isTalent(triggerSpell) ||
      (isTalent(triggerSpell) && this.selectedCombatant.hasTalent(triggerSpell));
    this.isBuff = isBuff;
    this.triggerSpell = triggerSpell;
    this.appliedSpell = appliedSpell ?? triggerSpell;
    this.addEventListener(Events.fightend, this.onRemove);
    this.addEventListener(
      Events.applybuff.spell(this.appliedSpell).by(SELECTED_PLAYER),
      this.onApply,
    );
    this.addEventListener(
      Events.removebuff.spell(this.appliedSpell).by(SELECTED_PLAYER),
      this.onRemove,
    );
    this.addEventListener(
      Events.applydebuff.spell(this.appliedSpell).by(SELECTED_PLAYER),
      this.onApply,
    );
    this.addEventListener(
      Events.removedebuff.spell(this.appliedSpell).by(SELECTED_PLAYER),
      this.onRemove,
    );
  }

  get spell() {
    return this.triggerSpell;
  }

  description(): ReactNode {
    return <>TODO</>;
  }

  appliesToEvent(buffEvent: BuffEvent<EventType.ApplyBuff | EventType.ApplyDebuff>): boolean {
    return buffEvent.ability.guid === this.appliedSpell.id;
  }

  get mitigations() {
    return this.mitigationData;
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

  isDefensiveActive(event: AnyEvent, shouldCheckEnemyBuff: boolean = false): boolean {
    if (!shouldCheckEnemyBuff) {
      return this.lastApply !== undefined;
    }
    if (event.type === EventType.Damage && shouldIgnore(this.enemies, event)) {
      return true;
    }
    const enemy = this.enemies.getSourceEntity(event);
    if (!enemy) {
      return true;
    }

    return this.lastApply !== undefined && enemy.hasBuff(this.appliedSpell.id, event.timestamp);
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
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible" tooltip={tooltip}>
        <BoringValue
          label={
            <>
              <SpellLink id={this.spell} /> Damage Mitigated
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

  protected recordMitigation(mitigation: MitigatedEvent) {
    this.currentMitigation?.push(mitigation);
  }

  protected onApply(event: BuffEvent<EventType.ApplyBuff | EventType.ApplyDebuff>) {
    this.lastApply = event;
    this.currentMitigation = [];
  }

  protected onRemove(
    event: BuffEvent<EventType.RemoveBuff | EventType.RemoveDebuff> | FightEndEvent,
  ) {
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
}

export const isMajorDefensive = (analyzer: Analyzer): analyzer is MajorDefensive =>
  analyzer instanceof MajorDefensive;

export const useMaxMitigationValue = <T extends typeof Analyzer>(moduleTypes: T[]) => {
  const analyzers = useAnalyzers(moduleTypes);

  return useMemo(
    () =>
      Math.max.apply(
        null,
        analyzers
          ?.filter(isDefined)
          ?.map((analyzer) =>
            Math.max.apply(
              null,
              analyzer instanceof MajorDefensive
                ? analyzer.mitigations.map((mit) => mit.amount)
                : [0],
            ),
          ),
      ),
    [analyzers],
  );
};

export const buffId = ({ triggerSpell, appliedSpell }: MajorDefensiveSpellData): number =>
  appliedSpell?.id ?? triggerSpell.id;
