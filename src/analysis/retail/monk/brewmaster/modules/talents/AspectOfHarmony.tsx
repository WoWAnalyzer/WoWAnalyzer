import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import { formatDuration, formatNumber } from 'common/format';
import SpellLink from 'interface/SpellLink';
import { BadColor, GoodColor } from 'interface/guide';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import EventLinkNormalizer from 'parser/core/EventLinkNormalizer';
import Events, {
  AnyEvent,
  CastEvent,
  DamageEvent,
  EventType,
  GetRelatedEvent,
  GetRelatedEvents,
  HealEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { createChecklistItem, createSpellUse } from 'parser/core/MajorCooldowns/MajorCooldown';
import { Options } from 'parser/core/Module';
import { SpellUse } from 'parser/core/SpellUsage/core';
import { encodeEventTargetString } from 'parser/shared/modules/Enemies';
import StatTracker from 'parser/shared/modules/StatTracker';
import {
  QualitativePerformance,
  evaluateQualitativePerformanceByThreshold,
} from 'parser/ui/QualitativePerformance';

export default class AspectOfHarmony extends Analyzer.withDependencies({ stats: StatTracker }) {
  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(talents.ASPECT_OF_HARMONY_TALENT);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.accumulateVitality);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.accumulateVitality);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(talents.PURIFYING_BREW_TALENT),
      this.onPurifyCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(talents.CELESTIAL_BREW_TALENT),
      this.onSpend,
    );

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.trackMaxHp);
    this.addEventListener(Events.heal.to(SELECTED_PLAYER), this.trackMaxHp);

    if (this.selectedCombatant.hasTalent(talents.WAY_OF_A_THOUSAND_STRIKES_TALENT)) {
      this.vitalityMultiplierOverrides[SPELLS.BLACKOUT_KICK_BRM.id] =
        AOH_VITALITY_DAMAGE_MULTIPLIER * 1.3;
      this.vitalityMultiplierOverrides[SPELLS.TIGER_PALM.id] = AOH_VITALITY_DAMAGE_MULTIPLIER * 1.3;
      this.vitalityMultiplierOverrides[talents.RISING_SUN_KICK_TALENT.id] =
        AOH_VITALITY_DAMAGE_MULTIPLIER * 1.3;
    }
  }

  private lastKnownMaxHp: number | undefined = undefined;
  private trackMaxHp(event: DamageEvent | HealEvent): void {
    if (event.maxHitPoints) {
      this.lastKnownMaxHp = event.maxHitPoints;
    }
  }

  private vitalityMultiplierOverrides: Record<number, number> = {};

  private estimatedPendingVitality: Record<string, number> = {};

  private accumulateVitality(event: DamageEvent | HealEvent): void {
    if (
      this.selectedCombatant.hasBuff(SPELLS.ASPECT_OF_HARMONY_BUFF) ||
      SPELL_BLACKLIST.has(event.ability.guid)
    ) {
      return; // cannot accumulate vitality during spender buff or from the dot/hot
    }
    if (event.targetIsFriendly && event.type === EventType.Damage) {
      return; // self-damage (like Stagger) does not contribute
    }

    const resurgenceMult = this.selectedCombatant.hasBuff(SPELLS.PATH_OF_RESURGENCE_BUFF)
      ? RESURGENCE_BUFF_MULTIPLIER
      : 1;

    // const critMultiplier = event.hitType === HIT_TYPES.CRIT ? 0.5 : 1;
    const critMultiplier = 1;

    const multiplier =
      resurgenceMult *
      critMultiplier *
      (this.vitalityMultiplierOverrides[event.ability.guid] ??
        (event.type === EventType.Damage
          ? AOH_VITALITY_DAMAGE_MULTIPLIER
          : AOH_VITALITY_HEALING_MULTIPLIER));

    if (!this.estimatedPendingVitality[event.ability.guid]) {
      this.estimatedPendingVitality[event.ability.guid] = 0;
    }

    this.estimatedPendingVitality[event.ability.guid] +=
      multiplier *
      ('unmitigatedAmount' in event && event.unmitigatedAmount
        ? event.unmitigatedAmount
        : event.amount);
  }

  private onPurifyCast(event: CastEvent): void {
    if (!event.attackPower) {
      return; // just bail
    }
    let staggerMult = 1 / 3;
    if (this.selectedCombatant.hasBuff(SPELLS.HEAVY_STAGGER_DEBUFF, null, 100)) {
      staggerMult = 1;
    } else if (this.selectedCombatant.hasBuff(SPELLS.MODERATE_STAGGER_DEBUFF, null, 100)) {
      staggerMult = 2 / 3;
    }
    const estimate =
      event.attackPower * (1 + this.deps.stats.currentVersatilityPercentage) * staggerMult;
    if (!this.estimatedPendingVitality[event.ability.guid]) {
      this.estimatedPendingVitality[event.ability.guid] = 0;
    }
    this.estimatedPendingVitality[event.ability.guid] += estimate;
  }

  /**
   * Estimate the total damage, including ticks that were dropped (likely due to NPC death).
   */
  private estimateTotalDamage(dotEvents: DamageEvent[]): number {
    const tickCounts: Record<string, number> = {};
    const tickDamage: Record<string, number> = {};
    let totalDamage = 0;

    for (const event of dotEvents) {
      const key = encodeEventTargetString(event);
      if (!tickCounts[key]) {
        tickCounts[key] = 0;
        tickDamage[key] = 0;
      }

      tickCounts[key] += 1;
      tickDamage[key] = event.amount + (event.absorb ?? 0) + (event.overkill ?? 0);
      totalDamage += tickDamage[key];
    }

    const EXPECTED_TICK_COUNT = 8;

    let missingDamage = 0;
    for (const key of Object.keys(tickCounts)) {
      const missingTicks = EXPECTED_TICK_COUNT - tickCounts[key];
      if (missingTicks <= 0) {
        continue;
      }
      missingDamage += missingTicks * tickDamage[key];
    }

    return totalDamage + missingDamage;
  }

  private spends: HarmonySpend[] = [];

  get uses(): SpellUse[] {
    return this.spends.map((spend, index) => {
      const previousSpend = this.spends[index - 1];
      const nextSpend = this.spends[index + 1];
      const chained =
        previousSpend &&
        (!previousSpend.endTimestamp ||
          previousSpend.endTimestamp + AOH_DOT_DURATION > spend.event.timestamp);
      const nextChained =
        nextSpend &&
        (!spend.endTimestamp || spend.endTimestamp + AOH_DOT_DURATION > nextSpend.event.timestamp);

      return createSpellUse({ event: spend.event }, [
        spend.maxHp
          ? createChecklistItem(
              'aoh_cap',
              { event: spend.event },
              {
                performance: evaluateQualitativePerformanceByThreshold({
                  actual: spend.estimatedVitality - spend.maxHp,
                  isLessThanOrEqual: {
                    good: 0,
                    ok: 0.1 * spend.maxHp,
                  },
                }),
                summary:
                  spend.estimatedVitality > spend.maxHp ? (
                    <>Overcapped Vitality</>
                  ) : (
                    <>Did Not Overcap Vitality</>
                  ),
                details: (
                  <>
                    You generated an estimated {formatNumber(spend.estimatedVitality)} Vitality to
                    spend with <SpellLink spell={talents.CELESTIAL_BREW_TALENT} />, which is{' '}
                    {spend.estimatedVitality > spend.maxHp ? (
                      <strong>more than</strong>
                    ) : (
                      <>less than</>
                    )}{' '}
                    your max HP of {formatNumber(spend.maxHp)}. Damage/Healing from{' '}
                    <SpellLink spell={SPELLS.ASPECT_OF_HARMONY_DOT} /> is capped by your max HP.
                  </>
                ),
              },
            )
          : null,
        // TODO: it should be possible to reconcile spenders but the way the DoT "intensify" effect works requires more study
        !nextChained && !chained
          ? createChecklistItem(
              'aoh_missing_dmg',
              { event: spend.event },
              {
                performance:
                  spend.missingDamage < 0.15 * (spend.missingDamage + spend.damage)
                    ? QualitativePerformance.Good
                    : chained
                      ? QualitativePerformance.Ok
                      : QualitativePerformance.Fail,
                summary: (
                  <>
                    {formatNumber(spend.missingDamage)} damage lost due to enemies dying or becoming
                    immune
                  </>
                ),
                details: (
                  <>
                    You lost {formatNumber(spend.missingDamage)} damage from targets dying or
                    becoming immune. The <SpellLink spell={SPELLS.ASPECT_OF_HARMONY_DOT} /> DoT does
                    not redistribute damage when enemies die.{' '}
                    {chained && (
                      <>
                        This use was <em>chained</em> from a previous usage so the amount lost may
                        be incorrect.
                      </>
                    )}
                  </>
                ),
              },
            )
          : null,
        createChecklistItem(
          'aoh_chain',
          { event: spend.event },
          {
            performance: chained ? QualitativePerformance.Ok : QualitativePerformance.Good,
            summary: chained ? <>Chained spenders</> : <>Did Not Chain Spenders</>,
            details: (
              <>
                {chained ? (
                  <>
                    You cast <SpellLink spell={talents.CELESTIAL_BREW_TALENT} /> while the DoT was
                    still active.
                  </>
                ) : (
                  <>
                    You did not chain casts of <SpellLink spell={talents.CELESTIAL_BREW_TALENT} />.
                  </>
                )}{' '}
                Casting <SpellLink spell={talents.CELESTIAL_BREW_TALENT} /> while{' '}
                <SpellLink spell={SPELLS.ASPECT_OF_HARMONY_DOT} /> is still active does not extend
                the DoT, but <em>does</em> add damage to it. This can reduce the benefit you gain
                from the <strong>20% damage buff</strong> on{' '}
                <SpellLink spell={talents.COALESCENCE_TALENT} /> (and may break estimation).
              </>
            ),
          },
        ),
      ]);
    });
  }

  private onSpend(event: CastEvent): void {
    // most of this information is to validate the model in the debug annotation. for the guide stuff we really only care about the pending value being more than your max hp to yell at you about overcapping.
    const actualDamageEvents = GetRelatedEvents<DamageEvent>(event, ASPECT_OF_HARMONY_DAMAGE);
    const actualHealingEvents = GetRelatedEvents<HealEvent>(event, ASPECT_OF_HARMONY_HEALING);
    const buffRemove = GetRelatedEvent<RemoveBuffEvent>(event, ASPECT_OF_HARMONY_BUFF_REMOVE);

    const actualDamage = actualDamageEvents.reduce((total, event) => total + event.amount, 0);
    const actualHealing = actualHealingEvents.reduce((total, event) => total + event.amount, 0);

    const estimatedTotal = this.estimateTotalDamage(actualDamageEvents);
    const rawPendingEstimate = Object.values(this.estimatedPendingVitality).reduce(
      (a, b) => a + b,
      0,
    );

    const estimatedPendingDamage = Math.min(this.lastKnownMaxHp ?? Infinity, rawPendingEstimate);

    const errorPct = (estimatedPendingDamage - estimatedTotal) / estimatedTotal;

    this.spends.push({
      event,
      damage: actualDamage,
      missingDamage: Math.max(0, estimatedTotal - actualDamage),
      healing: actualHealing,
      maxHp: this.lastKnownMaxHp,
      estimatedVitality: rawPendingEstimate,
      endTimestamp: buffRemove?.timestamp,
    });
    console.log(this.spends.at(-1));

    this.addDebugAnnotation(event, {
      color: Math.abs(errorPct) < 0.15 ? GoodColor : BadColor,
      summary: `Harmony trigger (est error ${errorPct})`,
      details: (
        <div>
          <dl>
            <dt>Actual Damage</dt>
            <dd>
              {actualDamage} (est: {estimatedTotal})
            </dd>
            <dt>Actual Healing</dt>
            <dd>{actualHealing}</dd>
            <dt>Estimated Vitality</dt>
            <dd>{estimatedPendingDamage}</dd>
            <dt>First DoT Tick</dt>
            <dd>
              {formatDuration(
                (actualDamageEvents[0]?.timestamp ?? 0) - this.owner.fight.start_time,
              )}
            </dd>
            <dt>Last DoT Tick</dt>
            <dd>
              {formatDuration(
                (actualDamageEvents.at(-1)?.timestamp ?? 0) - this.owner.fight.start_time,
              )}
            </dd>
          </dl>
          <table>
            <thead>
              <tr>
                <th>Ability</th>
                <th>Vitality</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(this.estimatedPendingVitality).map(([id, vitality]) => (
                <tr key={id}>
                  <td>
                    <SpellLink spell={Number(id)} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {Intl.NumberFormat().format(Math.round(vitality))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    });

    this.estimatedPendingVitality = {};
  }
}

const AOH_VITALITY_DAMAGE_MULTIPLIER = 0.15;
const AOH_VITALITY_HEALING_MULTIPLIER = 0.07;
const RESURGENCE_BUFF_MULTIPLIER = 1.25;

export class AspectOfHarmonyLinkNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, [
      {
        linkRelation: ASPECT_OF_HARMONY_SOURCE,
        reverseLinkRelation: ASPECT_OF_HARMONY_DAMAGE,
        linkingEventId: SPELLS.ASPECT_OF_HARMONY_DOT.id,
        linkingEventType: EventType.Damage,
        referencedEventId: talents.CELESTIAL_BREW_TALENT.id,
        referencedEventType: EventType.Cast,
        backwardBufferMs: AOH_MAX_DURATION,
        anyTarget: true,
        maximumLinks: 1,
      },
      {
        linkRelation: ASPECT_OF_HARMONY_SOURCE,
        reverseLinkRelation: ASPECT_OF_HARMONY_HEALING,
        linkingEventId: SPELLS.ASPECT_OF_HARMONY_HOT.id,
        linkingEventType: EventType.Heal,
        referencedEventId: talents.CELESTIAL_BREW_TALENT.id,
        referencedEventType: EventType.Cast,
        backwardBufferMs: AOH_MAX_DURATION,
        anyTarget: true,
        maximumLinks: 1,
      },
      {
        linkRelation: ASPECT_OF_HARMONY_BUFF_SOURCE,
        reverseLinkRelation: ASPECT_OF_HARMONY_BUFF_REMOVE,
        linkingEventId: SPELLS.ASPECT_OF_HARMONY_BUFF.id,
        linkingEventType: EventType.RemoveBuff,
        referencedEventId: talents.CELESTIAL_BREW_TALENT.id,
        referencedEventType: EventType.Cast,
        backwardBufferMs: AOH_MAX_DURATION,
        anyTarget: true, // CB has no target
        maximumLinks: 1,
      },
    ]);
  }
}

const ASPECT_OF_HARMONY_DAMAGE = 'aoh-damage';
const ASPECT_OF_HARMONY_HEALING = 'aoh-heal';
const ASPECT_OF_HARMONY_SOURCE = 'aoh-source';
const ASPECT_OF_HARMONY_BUFF_SOURCE = 'aoh-buff-source';
const ASPECT_OF_HARMONY_BUFF_REMOVE = 'aoh-buff-remove';
const AOH_SPENDER_DURATION = 10_000;
const AOH_DOT_DURATION = 8_000;
const AOH_MAX_DURATION = AOH_SPENDER_DURATION + AOH_DOT_DURATION;

const SPELL_BLACKLIST = new Set<number>([
  SPELLS.ASPECT_OF_HARMONY_DOT.id,
  SPELLS.ASPECT_OF_HARMONY_HOT.id,
  SPELLS.TOUCH_OF_DEATH.id,
  // Trinkets / Embellishments
  472030, // Blaze of Glory
  450721, // Ire of Devotion
  449217, // Authority of the Depths
]);

interface HarmonySpend {
  event: AnyEvent;
  damage: number;
  healing: number;
  maxHp: number | undefined;
  estimatedVitality: number;
  missingDamage: number;
  endTimestamp: number | undefined;
}
