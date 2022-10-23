import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, TargettedEvent } from 'parser/core/Events';

import { getAdditionalEnergyUsed } from '../../normalizers/FerociousBiteDrainLinkNormalizer';
import { TALENTS_DRUID } from 'common/TALENTS';
import { PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import Enemies from 'parser/shared/modules/Enemies';
import RipUptimeAndSnapshots from 'analysis/retail/druid/feral/modules/spells/RipUptimeAndSnapshots';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { SpellLink } from 'interface';
import { cdSpell, MAX_CPS } from 'analysis/retail/druid/feral/constants';
import getResourceSpent from 'parser/core/getResourceSpent';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';

const FB_BASE_COST = 25;
const MAX_FB_DRAIN = 25;

const MIN_ACCEPTABLE_TIME_LEFT_ON_RIP_MS = 5000;

/**
 * Tracks Ferocious Bite usage for analysis, including some legendary and talent interactions.
 */
class FerociousBite extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    rip: RipUptimeAndSnapshots,
  };

  protected enemies!: Enemies;
  protected rip!: RipUptimeAndSnapshots;

  hasSotf: boolean;

  castLog: FbCast[] = [];

  constructor(options: Options) {
    super(options);

    this.hasSotf = this.selectedCombatant.hasTalent(TALENTS_DRUID.SOUL_OF_THE_FOREST_FERAL_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FEROCIOUS_BITE),
      this.onFbCast,
    );
  }

  onFbCast(event: CastEvent) {
    if (event.resourceCost && event.resourceCost[RESOURCE_TYPES.ENERGY.id] === 0) {
      return; // free FBs (like from Apex Predator's Craving) don't drain but do full damage
    }

    const duringBerserkAndSotf =
      this.hasSotf &&
      (this.selectedCombatant.hasBuff(SPELLS.BERSERK.id) ||
        this.selectedCombatant.hasBuff(TALENTS_DRUID.INCARNATION_AVATAR_OF_ASHAMANE_TALENT.id));
    const extraEnergyUsed = getAdditionalEnergyUsed(event);

    if (!duringBerserkAndSotf && extraEnergyUsed < MAX_FB_DRAIN) {
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = `Used with low energy, causing only ${extraEnergyUsed}
        extra energy to be turned in to bonus damage. You should always cast Ferocious Bite with
        the full ${FB_BASE_COST + MAX_FB_DRAIN} energy available in order to maximize damage`;
    }

    let timeLeftOnRip = 0;
    // target is optional in cast event, but we know FB cast will always have it
    if (event.targetID !== undefined && event.targetIsFriendly !== undefined) {
      timeLeftOnRip = this.rip.getTimeRemaining(event as TargettedEvent<any>);
    }
    this.castLog.push({
      timestamp: event.timestamp,
      targetName: this.enemies.getEntity(event)?.name,
      cpsUsed: getResourceSpent(event, RESOURCE_TYPES.COMBO_POINTS),
      timeLeftOnRip,
      extraEnergyUsed,
      duringBerserkAndSotf,
    });
  }

  get guideSubsection(): JSX.Element {
    const castPerfBoxes = this.castLog.map((cast) => {
      const usedMaxExtraEnergy = cast.extraEnergyUsed === MAX_FB_DRAIN;
      const acceptableTimeLeftOnRip = cast.timeLeftOnRip >= MIN_ACCEPTABLE_TIME_LEFT_ON_RIP_MS;

      let value: QualitativePerformance = 'good';
      if (cast.cpsUsed < MAX_CPS) {
        value = 'fail';
      } else if (!usedMaxExtraEnergy && !cast.duringBerserkAndSotf) {
        value = 'fail';
      } else if (!acceptableTimeLeftOnRip) {
        value = 'ok';
      }

      const tooltip = (
        <>
          @ <strong>{this.owner.formatTimestamp(cast.timestamp)}</strong> targetting{' '}
          <strong>{cast.targetName || 'unknown'}</strong> using <strong>{cast.cpsUsed} CPs</strong>
          <br />
          Extra energy used: <strong>{cast.extraEnergyUsed}</strong>{' '}
          {cast.duringBerserkAndSotf && '(during Berserk)'}
          <br />
          {cast.extraEnergyUsed === 0 ? (
            <>
              <strong>No Rip on target!</strong>
            </>
          ) : (
            <>
              Time remaining on Rip: <strong>{(cast.timeLeftOnRip / 1000).toFixed(1)}s</strong>
            </>
          )}
        </>
      );

      return {
        value,
        tooltip,
      };
    });

    const hasConvokeOrApex =
      this.selectedCombatant.hasTalent(TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS_DRUID.APEX_PREDATORS_CRAVING_TALENT);
    const explanation = (
      <p>
        <strong>
          <SpellLink id={SPELLS.FEROCIOUS_BITE.id} />
        </strong>{' '}
        is your direct damage finisher. Use it when you've already applied Rip to enemies. Always
        use Bite at maximum CPs. Bite can consume up to {MAX_FB_DRAIN} extra energy to do increased
        damage - this boost is very efficient and you should always wait until{' '}
        {MAX_FB_DRAIN + FB_BASE_COST} energy to use Bite.{' '}
        {this.hasSotf && (
          <>
            One exception: because you have{' '}
            <SpellLink id={TALENTS_DRUID.SOUL_OF_THE_FOREST_FERAL_TALENT.id} />, it is acceptable to
            use low energy bites during <SpellLink id={cdSpell(this.selectedCombatant).id} /> in
            order to get extra finishers in.
          </>
        )}
      </p>
    );

    const data = (
      <div>
        {hasConvokeOrApex && (
          <>
            The below cast evaluations consider only CP spending Bites -{' '}
            <SpellLink id={TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT.id} /> and{' '}
            <SpellLink id={TALENTS_DRUID.APEX_PREDATORS_CRAVING_TALENT.id} /> procs aren't included.
            <br />
          </>
        )}
        <strong>Ferocious Bite casts</strong>
        <small>
          {' '}
          - Green is a good cast , Yellow is an questionable cast (used on target with low duration
          Rip), Red is a bad cast (&lt;25 extra energy + not during Berserk). Mouseover for more
          details.
        </small>
        <PerformanceBoxRow values={castPerfBoxes} />
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }
}

/** Tracking object for each Ferocious Bite cast */
type FbCast = {
  /** Cast's timestamp */
  timestamp: number;
  /** Name of cast's target */
  targetName?: string;
  /** Number of Combo Points consumed */
  cpsUsed: number;
  /** Time remaining on Rip on target (zero if no Rip) */
  timeLeftOnRip: number;
  /** Extra energy used by the cast */
  extraEnergyUsed: number;
  /** If cast happened when player has SotF and Berserk active */
  duringBerserkAndSotf: boolean;
};

export default FerociousBite;
