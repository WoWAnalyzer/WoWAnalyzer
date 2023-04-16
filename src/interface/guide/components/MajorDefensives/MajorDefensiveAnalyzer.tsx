import styled from '@emotion/styled';
import { formatDuration, formatNumber } from 'common/format';
import Spell from 'common/SPELLS/Spell';
import MAGIC_SCHOOLS, { color } from 'game/MAGIC_SCHOOLS';
import SpellLink from 'interface/SpellLink';
import Analyzer, { Options } from 'parser/core/Analyzer';
import EventFilter, { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, {
  AbilityEvent,
  HasSource,
  HasTarget,
  AnyEvent,
  DamageEvent,
  FightEndEvent,
  MappedEvent,
  ResourceActor,
  EventType,
} from 'parser/core/Events';
import { PerformanceUsageRow } from 'parser/core/SpellUsage/core';
import BoringValue from 'parser/ui/BoringValueText';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { ReactNode } from 'react';
import { BoxRowEntry } from '../PerformanceBoxRow';
import { MitigationSegment, MitigationSegments } from './MitigationSegments';
import { PerformanceMark } from 'interface/guide';
import { encodeTargetString } from 'parser/shared/modules/Enemies';

export type DefensiveTrigger<Apply extends EventType, Remove extends EventType> = {
  applyTrigger: EventFilter<Apply>;
  removeTrigger: EventFilter<Remove>;
  trackOn: ResourceActor;
  isMatchingApply: (event: AbilityEvent<any>) => boolean;
};

export const buff = (
  buffSpell: Spell,
): DefensiveTrigger<EventType.ApplyBuff, EventType.RemoveBuff> => ({
  applyTrigger: Events.applybuff.spell(buffSpell).by(SELECTED_PLAYER),
  removeTrigger: Events.removebuff.spell(buffSpell).by(SELECTED_PLAYER),
  trackOn: ResourceActor.Source,
  isMatchingApply: (event) =>
    event.type === EventType.ApplyBuff && event.ability.guid === buffSpell.id,
});

export const debuff = (
  buffSpell: Spell,
): DefensiveTrigger<EventType.ApplyDebuff, EventType.RemoveDebuff> => ({
  applyTrigger: Events.applydebuff.spell(buffSpell).by(SELECTED_PLAYER),
  removeTrigger: Events.removedebuff.spell(buffSpell).by(SELECTED_PLAYER),
  trackOn: ResourceActor.Target,
  isMatchingApply: (event) =>
    event.type === EventType.ApplyDebuff && event.ability.guid === buffSpell.id,
});

export type MitigatedEvent = {
  event: AnyEvent;
  mitigatedAmount: number;
};

export type Mitigation<Apply extends EventType = any, Remove extends EventType = any> = {
  start: MappedEvent<Apply>;
  end: MappedEvent<Remove> | FightEndEvent;
  mitigated: MitigatedEvent[];
  amount: number;
};

type InProgressMitigation<Apply extends EventType, Remove extends EventType> = Pick<
  Mitigation<Apply, Remove>,
  'start' | 'mitigated'
>;

/**
 * Calculate the absolute amount of damage reduced by a percentage DR effect.
 * For example: for a 50% DR cooldown, you'd call `absoluteMitigation(event, 0.5).
 */
export function absoluteMitigation(event: DamageEvent, mitPct: number): number {
  const actualAmount = event.amount + (event.absorbed ?? 0) + (event.overkill ?? 0);
  const priorAmount = actualAmount * (1 / (1 - mitPct));
  return priorAmount - actualAmount;
}

const MitigationTooltipBody = 'div';
const MitigationRowContainer = styled.div`
  display: grid;
  grid-template-columns: 2em 2em 100px;
  gap: 1em;
  align-items: center;

  line-height: 1em;
  text-align: right;

  padding-bottom: 0.5em;
`;

const MitigationRow = ({
  mitigation,
  segments,
  maxValue,
  fightStart,
}: {
  mitigation: Mitigation<any, any>;
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
 * An analyzer for a major defensive cooldown.
 *
 * While this works for short cooldowns, it is intended for use with longer cooldowns,
 * such as your typical 2+ minute damage reduction CDs.
 *
 * You probably want to extend `MajorDefensiveBuff` or `MajorDefensiveDebuff` to set
 * the type parameters automatically instead of using this directly.
 *
 * ## Example
 *
 * Brewmaster's Zen Meditation is one of the simplest defensive buff implementations and
 * would be a good place to start if you're dealing with something that isn't super
 * complicated (easy to detect start/end, reduces all damage by a fixed %).
 *
 * If you're searching for something a little more involved, Brewmaster's Fortifying Brew
 * module has multiple DR sources contributing (Fort Brew itself, plus the increased contribution
 * from Purifying Brew).
 */
export default class MajorDefensive<
  Apply extends EventType,
  Remove extends EventType,
> extends Analyzer {
  private currentMitigations: Map<string, InProgressMitigation<Apply, Remove>>;

  private mitigationData: Mitigation<Apply, Remove>[] = [];
  private readonly trackOn: ResourceActor;

  public readonly appliesToEvent: DefensiveTrigger<Apply, Remove>['isMatchingApply'];
  public readonly spell: Spell;

  constructor(
    displaySpell: Spell,
    { trackOn, applyTrigger, removeTrigger, isMatchingApply }: DefensiveTrigger<Apply, Remove>,
    options: Options,
  ) {
    super(options);

    this.appliesToEvent = isMatchingApply;
    this.spell = displaySpell;
    this.currentMitigations = new Map();
    this.trackOn = trackOn;

    this.addEventListener(applyTrigger, this.onApply);
    this.addEventListener(removeTrigger, this.onRemove);
    this.addEventListener(Events.fightend, this.onEnd);
  }

  /**
   * Get the map key for the buff/debuff target.
   */
  protected getBuffTarget(event: MappedEvent<Apply> | MappedEvent<Remove>): string | undefined {
    if (HasTarget(event)) {
      return encodeTargetString(event.targetID, event.targetInstance);
    } else {
      return undefined;
    }
  }

  /**
   * Get the map key for a mitigaton event. If this is a buff, we get the target. If it is a debuff, we get the source.
   * Basically the reverse of `getBuffTarget`.
   */
  protected getKeyForMitigation(event: AnyEvent): string | undefined {
    if (this.trackOn === ResourceActor.Source && HasTarget(event)) {
      return encodeTargetString(event.targetID, event.targetInstance);
    } else if (this.trackOn === ResourceActor.Target && HasSource(event)) {
      return encodeTargetString(event.sourceID, event.sourceInstance);
    } else {
      return undefined;
    }
  }

  protected recordMitigation(mitigation: MitigatedEvent) {
    const key = this.getKeyForMitigation(mitigation.event);
    key && this.currentMitigations.get(key)?.mitigated.push(mitigation);
  }

  protected defensiveActive(event: AnyEvent): boolean {
    const key = this.getKeyForMitigation(event);

    if (!key) {
      return false;
    }

    return this.currentMitigations.has(key);
  }

  private onApply(event: MappedEvent<Apply>) {
    const target = this.getBuffTarget(event);
    if (!target) {
      console.warn('Unable to determine target for Major Defensive analyzer', this.spell, event);
      return;
    }
    this.currentMitigations.set(target, {
      start: event,
      mitigated: [],
    });
  }

  private onRemove(event: MappedEvent<Remove>) {
    const target = this.getBuffTarget(event);
    const current = target && this.currentMitigations.get(target);
    if (!current) {
      // no apply, nothing we can do. probably looking at a slice of a log
      return;
    }

    this.mitigationData.push({
      ...current,
      end: event,
      amount: current.mitigated.map((event) => event.mitigatedAmount).reduce((a, b) => a + b, 0),
    });

    this.currentMitigations.delete(target);
  }

  private onEnd(event: FightEndEvent) {
    for (const current of this.currentMitigations.values()) {
      this.mitigationData.push({
        ...current,
        end: event,
        amount: current.mitigated.map((event) => event.mitigatedAmount).reduce((a, b) => a + b, 0),
      });
    }

    this.currentMitigations.clear();
  }

  get mitigations() {
    return this.mitigationData;
  }

  mitigationSegments(mit: Mitigation<Apply, Remove>): MitigationSegment[] {
    return [
      {
        amount: mit.amount,
        color: color(MAGIC_SCHOOLS.ids.PHYSICAL),
        description: <SpellLink spell={this.spell} />,
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

  explainPerformance(mit: Mitigation<Apply, Remove>): {
    perf: QualitativePerformance;
    explanation?: ReactNode;
  } {
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
      <Statistic category={STATISTIC_CATEGORY.THEORYCRAFT} size="flexible" tooltip={tooltip}>
        <BoringValue
          label={
            <>
              <SpellLink spell={this.spell} /> Damage Mitigated
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

export class MajorDefensiveBuff extends MajorDefensive<EventType.ApplyBuff, EventType.RemoveBuff> {}
export class MajorDefensiveDebuff extends MajorDefensive<
  EventType.ApplyDebuff,
  EventType.RemoveDebuff
> {}
