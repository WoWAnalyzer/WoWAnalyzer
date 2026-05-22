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
  FEROCIOUS_BITE_ENERGY,
  getFerociousBiteMaxDrain,
  MAX_CPS,
} from 'analysis/retail/druid/feral/constants';
import getResourceSpent from 'parser/core/getResourceSpent';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { BadColor, GoodColor, OkColor } from 'interface/guide';
import { getHits } from 'analysis/retail/druid/feral/normalizers/CastLinkNormalizer';
import HIT_TYPES from 'game/HIT_TYPES';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';
import CastSummaryAndBreakdown from 'interface/guide/components/CastSummaryAndBreakdown';
import { getAdditionalEnergyUsed } from 'analysis/retail/druid/feral/normalizers/FerociousBiteDrainLinkNormalizer';
import { isConvoking } from 'analysis/retail/druid/shared/spells/ConvokeSpirits';
import Enemies from 'parser/shared/modules/Enemies';

const MIN_ACCEPTABLE_TIME_LEFT_ON_RIP_MS = 5000;

/**
 * Tracks Ferocious Bite usage for analysis, including some legendary and talent interactions.
 */
class FerociousBite extends Analyzer {
  static dependencies = {
    rip: RipUptimeAndSnapshots,
    enemies: Enemies,
  };

  protected rip!: RipUptimeAndSnapshots;
  protected enemies!: Enemies;

  /** Per-cast perf is computed lazily so post-cast info (target last-damage time) can be used */
  private rawCasts: RawFbCast[] = [];
  /** Last player damage timestamp per target. Bleed ticks count, so on a living target this stays
   *  fresh; enemy death events don't reach us (WCL filters to player-involved events). */
  private lastDamageByTarget = new Map<string, number>();

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(FB_SPELLS), this.onFbCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onAnyDamage);
  }

  onAnyDamage(event: DamageEvent) {
    if (event.targetIsFriendly) {
      return;
    }
    this.lastDamageByTarget.set(targetKey(event.targetID, event.targetInstance), event.timestamp);
  }

  onFbCast(event: CastEvent) {
    const cpsUsed = getResourceSpent(event, RESOURCE_TYPES.COMBO_POINTS);
    // free Apex Predator's Craving bites (cpsUsed===0 is more reliable than checking resourceCost)
    if (cpsUsed === 0) {
      return;
    }
    // Convoke-fired bites aren't a player decision
    if (isConvoking(this.selectedCombatant)) {
      return;
    }

    const damage = getHits(event)
      .filter((e): e is DamageEvent => e.type === EventType.Damage)
      .pop();
    if (damage && damage.hitType === HIT_TYPES.PARRY) {
      return; // parried FBs don't drain and don't cost CPs - shouldn't evaluate
    }

    let timeLeftOnRip = 0;
    // target is optional in cast event, but we know FB cast will always have it
    if (event.targetID !== undefined && event.targetIsFriendly !== undefined) {
      timeLeftOnRip = this.rip.getTimeRemaining(event as TargettedEvent<EventType>);
    }
    // cast event reports only the 25 base energy cost; the 0-25 drain is a linked event
    const energyUsed =
      getResourceSpent(event, RESOURCE_TYPES.ENERGY) + getAdditionalEnergyUsed(event);
    const maxTotalEnergy = FEROCIOUS_BITE_ENERGY + getFerociousBiteMaxDrain(this.selectedCombatant);

    // snapshot bleed presence at cast time — used by death-grace exemption later
    const enemy = this.enemies.getEntity(event);
    const hadBleed =
      !!enemy &&
      (enemy.hasBuff(SPELLS.RAKE_BLEED.id, event.timestamp) ||
        enemy.hasBuff(SPELLS.RIP.id, event.timestamp));

    this.rawCasts.push({
      event,
      cpsUsed,
      energyUsed,
      maxTotalEnergy,
      timeLeftOnRip,
      targetKey: targetKey(event.targetID, event.targetInstance),
      hadBleedAtCast: hadBleed,
    });
  }

  /** Lazily computed so we can use info that arrives after the FB cast (target's last damage) */
  get castEntries(): BoxRowEntry[] {
    return this.rawCasts.map((raw) => this.evaluateCast(raw));
  }

  private evaluateCast(raw: RawFbCast): BoxRowEntry {
    const {
      event,
      cpsUsed,
      energyUsed,
      maxTotalEnergy,
      timeLeftOnRip,
      targetKey: tk,
      hadBleedAtCast,
    } = raw;
    // 1 energy of slack for talent-multiplier rounding (e.g. Incarn's 0.75)
    const fullStrengthEnergy = energyUsed >= maxTotalEnergy - 1;
    const acceptableTimeLeftOnRip = timeLeftOnRip >= MIN_ACCEPTABLE_TIME_LEFT_ON_RIP_MS;
    // Verify the target actually died (not just that we switched away — a Rip refresh would still
    // tick on a living target). Bleeds tick independently, so if a bleed was up at cast time and
    // our last damage stops within the grace window, the bleed stopped → target died.
    const lastDmgTs = this.lastDamageByTarget.get(tk);
    const lastDmgDeltaMs = lastDmgTs !== undefined ? lastDmgTs - event.timestamp : Infinity;
    const targetDiesSoon = hadBleedAtCast && lastDmgDeltaMs <= MIN_ACCEPTABLE_TIME_LEFT_ON_RIP_MS;

    let value: QualitativePerformance = QualitativePerformance.Good;
    let perfExplanation: React.ReactNode = undefined;
    if (cpsUsed < MAX_CPS) {
      value = QualitativePerformance.Fail;
      perfExplanation = (
        <h5 style={{ color: BadColor }}>Bad because you used less than {MAX_CPS} CPs</h5>
      );
      addInefficientCastReason(event, `Used with only ${cpsUsed} CPs (need ${MAX_CPS})`);
    } else if (!fullStrengthEnergy) {
      value = QualitativePerformance.Fail;
      perfExplanation = (
        <h5 style={{ color: BadColor }}>
          Bad because you cast at {energyUsed} energy — Ferocious Bite scales with the extra energy
          drain, so always cast at {Math.round(maxTotalEnergy)}+ energy.
        </h5>
      );
      addInefficientCastReason(
        event,
        `Cast at ${energyUsed} energy (need ${Math.round(maxTotalEnergy)})`,
      );
    } else if (!acceptableTimeLeftOnRip && !targetDiesSoon) {
      value = QualitativePerformance.Ok;
      perfExplanation = (
        <h5 style={{ color: OkColor }}>
          Questionable because you cast when Rip was close to expiring
        </h5>
      );
    } else if (!acceptableTimeLeftOnRip && targetDiesSoon) {
      // surface the exemption positively so the user can see why no warning fired
      perfExplanation = (
        <h5 style={{ color: GoodColor }}>
          Good — target died {(lastDmgDeltaMs / 1000).toFixed(1)}s after this cast (our bleeds
          stopped ticking), so a Rip refresh wouldn't have paid off.
        </h5>
      );
    }

    const tooltip = (
      <>
        {perfExplanation}
        <div>
          @ <strong>{this.owner.formatTimestamp(event.timestamp)}</strong> targetting{' '}
          <strong>{this.owner.getTargetName(event)}</strong> using <strong>{cpsUsed} CPs</strong>{' '}
          and <strong>{energyUsed} energy</strong>
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

    return { value, tooltip };
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
        is your direct damage finisher. Use it when you've already applied Rip to enemies. Always
        cast at {MAX_CPS} CPs and 50 energy (40 energy during{' '}
        <SpellLink spell={TALENTS_DRUID.INCARNATION_AVATAR_OF_ASHAMANE_TALENT} />) — the extra
        energy drain scales Bite's damage, and at {MAX_CPS} CPs it also maximizes the chance and
        strength of <SpellLink spell={SPELLS.UNSEEN_SLASH_DAMAGE} /> /{' '}
        <SpellLink spell={SPELLS.UNSEEN_SWIPE_DAMAGE} /> procs from{' '}
        <SpellLink spell={TALENTS_DRUID.UNSEEN_PREDATOR_1_FERAL_TALENT} />.
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
          badExtraExplanation={<>low CPs or low energy</>}
        />
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }
}

export default FerociousBite;

interface RawFbCast {
  event: CastEvent;
  cpsUsed: number;
  energyUsed: number;
  maxTotalEnergy: number;
  timeLeftOnRip: number;
  targetKey: string;
  /** Rake/Rip presence on target at cast time, used by the death-grace exemption */
  hadBleedAtCast: boolean;
}

function targetKey(targetID: number | undefined, targetInstance: number | undefined): string {
  return `${targetID ?? -1}:${targetInstance ?? 0}`;
}
