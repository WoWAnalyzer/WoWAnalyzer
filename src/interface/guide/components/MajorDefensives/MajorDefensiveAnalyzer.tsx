import styled from '@emotion/styled';
import { formatDuration, formatNumber } from 'common/format';
import Spell from 'common/SPELLS/Spell';
import MAGIC_SCHOOLS, { color } from 'game/MAGIC_SCHOOLS';
import SpellLink from 'interface/SpellLink';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import EventFilter from 'parser/core/EventFilter';
import Events, {
  AbilityEvent,
  HasSource,
  HasTarget,
  AnyEvent,
  DamageEvent,
  FightEndEvent,
  ResourceActor,
  EventType,
} from 'parser/core/Events';
import { PerformanceUsageRow } from 'parser/core/SpellUsage/core';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { ReactNode } from 'react';
import { BoxRowEntry } from '../PerformanceBoxRow';
import { MitigationSegment, MitigationSegments } from './MitigationSegments';
import { PerformanceMark } from 'interface/guide';
import { encodeTargetString } from 'parser/shared/modules/Enemies';
import { CooldownDetailsProps } from './AllCooldownUsagesList';

/**
 * Trigger settings for a `MajorDefensive`. You probably want to use `buff` or `debuff`
 * instead of using this yourself, but if you have a weirdo defensive that doesn't use
 * buffs/debuffs then you may need this.
 */
type DefensiveTrigger<Apply extends EventType, Remove extends EventType> = {
  applyTrigger: EventFilter<Apply>;
  removeTrigger: EventFilter<Remove>;
  trackOn: ResourceActor;
  isMatchingApply: (event: AbilityEvent<any>) => boolean;
};

/**
 * Construct the trigger settings for a `MajorDefensiveBuff`.
 *
 * The spell passed should be the one that is actually applied to the player,
 * not the one that is cast. Yes, those two spells are sometimes different.
 */
export const buff = (
  buffSpell: Spell,
): DefensiveTrigger<EventType.ApplyBuff, EventType.RemoveBuff> => ({
  applyTrigger: Events.applybuff.spell(buffSpell).by(SELECTED_PLAYER),
  removeTrigger: Events.removebuff.spell(buffSpell).by(SELECTED_PLAYER),
  trackOn: ResourceActor.Source,
  isMatchingApply: (event) =>
    event.type === EventType.ApplyBuff && event.ability.guid === buffSpell.id,
});

/**
 * Construct the trigger settings for a `MajorDefensiveDebuff`.
 *
 * The spell passed should be the one that is actually applied to the target,
 * not the one that is cast. Yes, those two spells are sometimes different.
 */
export const debuff = (
  buffSpell: Spell,
): DefensiveTrigger<EventType.ApplyDebuff, EventType.RemoveDebuff> => ({
  applyTrigger: Events.applydebuff.spell(buffSpell).by(SELECTED_PLAYER),
  removeTrigger: Events.removedebuff.spell(buffSpell).by(SELECTED_PLAYER),
  trackOn: ResourceActor.Target,
  isMatchingApply: (event) =>
    event.type === EventType.ApplyDebuff && event.ability.guid === buffSpell.id,
});

/**
 * A mitigated event. Typically the `event` field will be a `DamageEvent`, but
 * sometimes it makes sense to use other things (like `AbsorbedEvent` or `HealEvent`).
 */
export type MitigatedEvent = {
  event: AnyEvent;
  mitigatedAmount: number;
};

/**
 * A single mitigation window. May be buff/debuff (or other?). Holds the total
 * amount of damage mitigated, along with the events that were mitigated.
 *
 * For convenience, the types default to `any` so you can use it as just `Mitigation`
 * since it pops up a lot and you *almost never* need to know the start/end types
 * (typically, you only need the timestamps).
 */
export type Mitigation<Apply extends EventType = any, Remove extends EventType = any> = {
  start: AnyEvent<Apply>;
  end: AnyEvent<Remove> | FightEndEvent;
  mitigated: MitigatedEvent[];
  amount: number;
  /**
   * For effects that have a maximum mitigation amount (like absorbs), this represents the total possible amount mitigated. If there is no max (like most DR effects), this should be omitted.
   */
  maxAmount?: number;
};

type InProgressMitigation<Apply extends EventType, Remove extends EventType> = Pick<
  Mitigation<Apply, Remove>,
  'start' | 'mitigated' | 'maxAmount'
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

/**
 * Set the default sizes for `MitigationRow`.
 *
 * You probably aren't looking for this unless you're rendering a `MitigationRow` yourself.
 */
export const MitigationRowContainer = styled.div`
  display: grid;
  grid-template-columns: 2em min-content 100px;
  gap: 1em;
  align-items: center;

  line-height: 1em;
  text-align: right;

  padding-bottom: 0.5em;
`;

/**
 * Row showing the duration and mitigation amount, along with the `MitigationSegments`.
 *
 * The `MitigationRowContainer` component is used to size things appropriately in most instances.
 */
export const MitigationRow = ({
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
 * An analyzer for a major defensive cooldown tracking the total amount of damage mitigated.
 *
 * While this works for short cooldowns, it is intended for use with longer cooldowns,
 * such as your typical 2+ minute damage reduction CDs.
 *
 * You probably want to extend `MajorDefensiveBuff` or `MajorDefensiveDebuff` to set
 * the type parameters automatically instead of using this directly.
 *
 * ## Usage
 *
 * A basic "Reduce damage taken by X%" cooldown can be implemented by doing the following:
 *
 * 1. Extend `MajorDefensiveBuff` or `MajorDefensiveDebuff` (or this class, if you need something custom).
 * 2. Call the constructor with (1) the spell to display (used for icons and tooltips),
 *    (2) the `DefensiveTrigger` (usually made by `buff` or `debuff`),
 *    and the `options` passed into your analyzer.
 * 3. Add an event listener for damage, and in the handler call `this.recordMitigation`
 *    if `this.defensiveActive(event)` is true. You can use the `absoluteMitigation` helper
 *    function to calculate the amount of damage mitigated.
 *
 * If you are working with a talented cooldown, remember that you need to check `hasTalent` yourself!
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
 *
 * If you are working on a debuff instead of a buff, look at Vengeance's Fiery Brand implementation.
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
  protected getBuffTarget(event: AnyEvent<Apply> | AnyEvent<Remove>): string | undefined {
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

  /**
   * Set the maximum amount that could be mitigated by a cast.
   */
  protected setMaxMitigation(event: AnyEvent, amount: number): void {
    const key = this.getKeyForMitigation(event);
    const current = key && this.currentMitigations.get(key);
    if (current) {
      current.maxAmount = amount;
    }
  }

  protected defensiveActive(event: AnyEvent): boolean {
    const key = this.getKeyForMitigation(event);

    if (!key) {
      return false;
    }

    return this.currentMitigations.has(key);
  }

  private onApply(event: AnyEvent<Apply>) {
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

  private onRemove(event: AnyEvent<Remove>) {
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

  get cooldownDetailsComponent():
    | ((props: CooldownDetailsProps) => JSX.Element | null)
    | undefined {
    return undefined;
  }

  get mitigations() {
    return this.mitigationData;
  }

  /**
   * Break down a `Mitigation` into one or more `MitigationSegment`s.
   *
   * The default implementation gives you a single segment capturing
   * the entire amount mitigated.
   *
   * If you want to do something more complicated (for example: showing
   * the extra mitigation gained from a talent), override this method.
   */
  mitigationSegments(mit: Mitigation<Apply, Remove>): MitigationSegment[] {
    return [
      {
        amount: mit.amount,
        color: color(MAGIC_SCHOOLS.ids.PHYSICAL),
        description: <SpellLink spell={this.spell} />,
      },
    ];
  }

  /**
   * Get the first seen max HP of the player.
   *
   * This is used to normalize performance data in
   * a relatively robust way across tiers.
   */
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

  // TODO: make abstract?
  /**
   * Description shown in `AllCooldownUsagesList`.
   */
  description(): ReactNode {
    return <>TODO</>;
  }

  maxMitigationDescription(): ReactNode {
    return <>Max Mitigation</>;
  }

  /**
   * Generate `BoxRowEntry`s for each use of the mitigation ability.
   *
   * If you want to filter or customize the entries, override this method.
   */
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
            <div>
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
            </div>
          </>
        ),
      };
    });
  }
}

// technically subclassing, but in practice this is the only way to do type aliases that set type parameters for classes

/**
 * `MajorDefensive` that has types pre-set for handling buffs.
 *
 * @see MajorDefensive for full documentation
 */
export class MajorDefensiveBuff extends MajorDefensive<EventType.ApplyBuff, EventType.RemoveBuff> {}

/**
 * `MajorDefensive` that has types pre-set for handling debuffs.
 *
 * @see MajorDefensive for full documentation
 */
export class MajorDefensiveDebuff extends MajorDefensive<
  EventType.ApplyDebuff,
  EventType.RemoveDebuff
> {}
