import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, EventType, TargettedEvent } from 'parser/core/Events';

import { TALENTS_DRUID } from 'common/TALENTS';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import RipUptimeAndSnapshots from 'analysis/retail/druid/feral/modules/spells/RipUptimeAndSnapshots';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { SpellLink } from 'interface';
import {
  FB_SPELLS,
  MIN_ACCEPTABLE_CPS,
  getAcceptableCps,
} from 'analysis/retail/druid/feral/constants';
import getResourceSpent from 'parser/core/getResourceSpent';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { BadColor, OkColor } from 'interface/guide';
import { getHits } from 'analysis/retail/druid/feral/normalizers/CastLinkNormalizer';
import HIT_TYPES from 'game/HIT_TYPES';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';
import CastSummaryAndBreakdown from 'interface/guide/components/CastSummaryAndBreakdown';

const MIN_ACCEPTABLE_TIME_LEFT_ON_RIP_MS = 5000;

/**
 * Tracks Ferocious Bite usage for analysis, including some legendary and talent interactions.
 */
class FerociousBite extends Analyzer {
  static dependencies = {
    rip: RipUptimeAndSnapshots,
  };

  protected rip!: RipUptimeAndSnapshots;

  castEntries: BoxRowEntry[] = [];

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(FB_SPELLS), this.onFbCast);
  }

  onFbCast(event: CastEvent) {
    if (event.resourceCost && event.resourceCost[RESOURCE_TYPES.ENERGY.id] === 0) {
      return; // free FBs (like from Apex Predator's Craving) don't drain but do full damage
    }

    const damage = getHits(event)
      .filter((e): e is DamageEvent => e.type === EventType.Damage)
      .pop();
    if (damage && damage.hitType === HIT_TYPES.PARRY) {
      return; // parried FBs don't drain and don't cost CPs - shouldn't evaluate
    }

    // fill out cast entry
    let timeLeftOnRip = 0;
    // target is optional in cast event, but we know FB cast will always have it
    if (event.targetID !== undefined && event.targetIsFriendly !== undefined) {
      timeLeftOnRip = this.rip.getTimeRemaining(event as TargettedEvent<EventType>);
    }
    const cpsUsed = getResourceSpent(event, RESOURCE_TYPES.COMBO_POINTS);
    const currAcceptableCps = getAcceptableCps(this.selectedCombatant, event.timestamp);
    const acceptableTimeLeftOnRip = timeLeftOnRip >= MIN_ACCEPTABLE_TIME_LEFT_ON_RIP_MS;

    let value: QualitativePerformance = QualitativePerformance.Good;
    let perfExplanation: React.ReactNode = undefined;
    if (cpsUsed < currAcceptableCps) {
      value = QualitativePerformance.Fail;
      perfExplanation = (
        <h5 style={{ color: BadColor }}>Bad because you used less than {currAcceptableCps} CPs</h5>
      );
      addInefficientCastReason(
        event,
        `Used with only ${cpsUsed} CPs (need at least ${currAcceptableCps})`,
      );
    } else if (!acceptableTimeLeftOnRip) {
      value = QualitativePerformance.Ok;
      perfExplanation = (
        <h5 style={{ color: OkColor }}>
          Questionable because you cast when Rip was close to expiring
        </h5>
      );
    }

    const tooltip = (
      <>
        {perfExplanation}
        <div>
          @ <strong>{this.owner.formatTimestamp(event.timestamp)}</strong> targetting{' '}
          <strong>{this.owner.getTargetName(event)}</strong> using <strong>{cpsUsed} CPs</strong>
        </div>
        <div>
          {timeLeftOnRip === 0 ? (
            <strong>No Rip on target!</strong>
          ) : (
            <>
              Time remaining on Rip: <strong>{(timeLeftOnRip / 1000).toFixed(1)}s</strong>
            </>
          )}
        </div>
      </>
    );

    this.castEntries.push({
      value,
      tooltip,
    });
  }

  get guideSubsection(): JSX.Element {
    const hasConvokeOrApex =
      this.selectedCombatant.hasTalent(TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS_DRUID.APEX_PREDATORS_CRAVING_TALENT);
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={SPELLS.FEROCIOUS_BITE} />
        </strong>{' '}
        is your direct damage finisher. Use it when you've already applied Rip to enemies. Use Bite
        with at least {MIN_ACCEPTABLE_CPS} CPs, or {MIN_ACCEPTABLE_CPS + 1}+ during{' '}
        <SpellLink spell={SPELLS.BERSERK_CAT} />.
      </p>
    );

    const data = (
      <div>
        {hasConvokeOrApex && (
          <p>
            The below cast evaluations consider only CP spending Bites -{' '}
            <SpellLink spell={TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT} /> and{' '}
            <SpellLink spell={TALENTS_DRUID.APEX_PREDATORS_CRAVING_TALENT} /> procs aren't included.
          </p>
        )}
        <CastSummaryAndBreakdown
          spell={SPELLS.FEROCIOUS_BITE}
          castEntries={this.castEntries}
          okExtraExplanation={<>used on target with low duration Rip</>}
          badExtraExplanation={<>low CPs</>}
        />
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }
}

export default FerociousBite;
