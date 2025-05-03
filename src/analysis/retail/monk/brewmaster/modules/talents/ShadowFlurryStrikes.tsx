import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import { formatNth } from 'common/format';
import SpellLink from 'interface/SpellLink';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AnyEvent,
  ApplyBuffEvent,
  CastEvent,
  DamageEvent,
  FightEndEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { createChecklistItem } from 'parser/core/MajorCooldowns/MajorCooldown';
import { ChecklistUsageInfo, SpellUse } from 'parser/core/SpellUsage/core';
import {
  QualitativePerformance,
  evaluateQualitativePerformanceByThreshold,
} from 'parser/ui/QualitativePerformance';
import EnergyTracker from '../core/EnergyTracker';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ResourceLink from 'interface/ResourceLink';

interface ShadowBuffData {
  apply: AnyEvent;
  remove?: AnyEvent;
  flurryHits: number;
  bobUsed: boolean;
  offset: number;
}
const RECENT_WINDOW = 10_000;
const SPEND_PER_TRIGGER = 240;
const HITS_PER_TRIGGER = 10;

export default class ShadowFlurryStrikes extends Analyzer.withDependencies({ EnergyTracker }) {
  private mostRecentFlurryStrike: DamageEvent | undefined;
  private recentFlurryStrikes = 0;

  private shadowBuffs: ShadowBuffData[] = [];
  private activeShadowBuff: ShadowBuffData | undefined;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.WOTW_SHADOW_BUFF),
      this.onApply,
    );
    this.addEventListener(
      Events.refreshbuff.to(SELECTED_PLAYER).spell(SPELLS.WOTW_SHADOW_BUFF),
      this.onApply,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.WOTW_SHADOW_BUFF),
      this.onRemove,
    );
    this.addEventListener(Events.fightend, this.onRemove);

    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([SPELLS.FLURRY_STRIKES_DAMAGE_1, SPELLS.FLURRY_STRIKES_DAMAGE_2]),
      this.onFlurryStrikeDamage,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(talents.BLACK_OX_BREW_TALENT),
      this.onBoBCast,
    );
  }

  private onApply(event: ApplyBuffEvent | RefreshBuffEvent): void {
    const newBuff: ShadowBuffData = {
      apply: event,
      flurryHits: 0,
      bobUsed: false,
      offset: this.recentFlurryStrikes,
    };
    this.shadowBuffs.push(newBuff);
    if (this.activeShadowBuff) {
      this.activeShadowBuff.remove = event;
    }
    this.activeShadowBuff = newBuff;
  }

  private onRemove(event: RemoveBuffEvent | FightEndEvent): void {
    if (this.activeShadowBuff) {
      this.activeShadowBuff.remove = event;
    }
    this.activeShadowBuff = undefined;
  }

  private onFlurryStrikeDamage(event: DamageEvent): void {
    if (this.activeShadowBuff) {
      this.activeShadowBuff.flurryHits += 1;
    }

    if (
      this.mostRecentFlurryStrike &&
      event.timestamp - this.mostRecentFlurryStrike.timestamp < RECENT_WINDOW
    ) {
      this.recentFlurryStrikes += 1;
    } else {
      this.recentFlurryStrikes = 1;
    }

    this.mostRecentFlurryStrike = event;
  }

  private onBoBCast(_event: CastEvent): void {
    if (this.activeShadowBuff) {
      this.activeShadowBuff.bobUsed = true;
    }
  }

  get uses(): SpellUse[] {
    return this.shadowBuffs.map((buff): SpellUse => {
      const performance = evaluateQualitativePerformanceByThreshold({
        actual: buff.flurryHits,
        isGreaterThanOrEqual: {
          perfect: 2.5 * HITS_PER_TRIGGER,
          good: 2 * HITS_PER_TRIGGER,
          ok: HITS_PER_TRIGGER,
        },
      });
      const energySegment = this.deps.EnergyTracker.generateSegmentData(
        buff.apply.timestamp,
        buff.remove?.timestamp ?? this.owner.fight.end_time,
      );
      // check if the player left range for flurry strikes during this. the 75% is arbitrary to deal with triggering flurry strikes around the end of the buff window
      const disconnectWarning =
        buff.flurryHits <
        Math.floor(energySegment.spent / SPEND_PER_TRIGGER) * HITS_PER_TRIGGER * 0.75;
      return {
        event: buff.apply,
        performance,
        performanceExplanation: `${performance}`,
        checklistItems: [
          createChecklistItem(
            'flurrystrike_hits',
            { event: buff.apply },
            {
              performance: disconnectWarning ? QualitativePerformance.Fail : performance,
              summary: (
                <div>
                  {buff.flurryHits} <SpellLink spell={talents.FLURRY_STRIKES_TALENT} /> hits
                </div>
              ),
              details: (
                <>
                  You had <strong>{buff.flurryHits} hits</strong> within the buff. You should always
                  fit at least 1 full <SpellLink spell={talents.FLURRY_STRIKES_TALENT} /> (
                  {HITS_PER_TRIGGER} hits) into a Shadow buff. Getting 2 is good. It is possible to
                  get 3, but pursuing a 3rd trigger can result in a damage loss.
                  {disconnectWarning && (
                    <div>
                      <strong>You had fewer hits than expected for the Energy spent.</strong> This
                      can happen if you trigger <SpellLink spell={talents.FLURRY_STRIKES_TALENT} />{' '}
                      without being in range of a target, or leave range during the trigger.
                    </div>
                  )}
                </>
              ),
            },
          ),
          createChecklistItem(
            'flurrystrike_energy',
            { event: buff.apply },
            {
              performance: evaluateQualitativePerformanceByThreshold({
                actual: energySegment.spent,
                isGreaterThanOrEqual: {
                  perfect: 3 * SPEND_PER_TRIGGER,
                  good: 2 * SPEND_PER_TRIGGER,
                  ok: SPEND_PER_TRIGGER,
                },
              }),
              summary: (
                <div>
                  {energySegment.spent} <ResourceLink id={RESOURCE_TYPES.ENERGY.id} /> spent
                </div>
              ),
              details: (
                <>
                  You spent {energySegment.spent} <ResourceLink id={RESOURCE_TYPES.ENERGY.id} />{' '}
                  during <SpellLink spell={SPELLS.WOTW_SHADOW_BUFF} />. You get 1{' '}
                  <SpellLink spell={talents.FLURRY_STRIKES_TALENT} /> trigger per{' '}
                  <strong>{SPEND_PER_TRIGGER}</strong> Energy.
                </>
              ),
            },
          ),
          createChecklistItem(
            'flurrystrike_bob',
            { event: buff.apply },
            {
              performance: buff.bobUsed ? QualitativePerformance.Good : QualitativePerformance.Ok,
              summary: (
                <div>
                  <SpellLink spell={talents.BLACK_OX_BREW_TALENT} /> {buff.bobUsed ? '' : 'not'}{' '}
                  used
                </div>
              ),
              details: buff.bobUsed ? (
                <>
                  <SpellLink spell={talents.BLACK_OX_BREW_TALENT} /> was used during{' '}
                  <SpellLink spell={SPELLS.WOTW_SHADOW_BUFF} />, giving additional energy to use for{' '}
                  <SpellLink spell={talents.FLURRY_STRIKES_TALENT} />. It is not worth holding{' '}
                  <SpellLink spell={talents.BLACK_OX_BREW_TALENT}>BoB</SpellLink> for this, but if
                  it lines up it is helpful to get more triggers.
                </>
              ) : (
                <>
                  <SpellLink spell={talents.BLACK_OX_BREW_TALENT} /> was not used during{' '}
                  <SpellLink spell={SPELLS.WOTW_SHADOW_BUFF} />. It is not worth holding{' '}
                  <SpellLink spell={talents.BLACK_OX_BREW_TALENT}>BoB</SpellLink> for this, but if
                  it lines up it is helpful to get more triggers.
                </>
              ),
            },
          ),
          createChecklistItem(
            'flurrystrike_offset',
            { event: buff.apply },
            {
              performance:
                buff.offset <= 3 ? QualitativePerformance.Good : QualitativePerformance.Ok,
              summary: (
                <div>
                  <SpellLink spell={SPELLS.WOTW_SHADOW_BUFF} /> triggered on the{' '}
                  {formatNth(buff.offset)} hit
                </div>
              ),
              details: (
                <>
                  <SpellLink spell={SPELLS.WOTW_SHADOW_BUFF} /> triggered on hit {buff.offset} / 10.
                  This statistic is purely informative for players that are trying to use{' '}
                  <em>offsetting</em>.
                </>
              ),
            },
          ),
        ].filter((v): v is ChecklistUsageInfo => Boolean(v)),
      };
    });
  }
}
