import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ComboPointTracker from 'analysis/retail/druid/feral/modules/core/combopoints/ComboPointTracker';
import { TALENTS_DRUID } from 'common/TALENTS';
import Events, { CastEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import Enemies from 'parser/shared/modules/Enemies';
import { SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';
import { PassFailCheckmark, PerformanceMark } from 'interface/guide';
import EnergyTracker from 'analysis/retail/druid/feral/modules/core/energy/EnergyTracker';

/**
 * **Feral Frenzy**
 * Spec Talent
 *
 * Unleash a furious frenzy, clawing your target 5 times for X Physical damage and
 * an additional X Bleed damage over 6 sec. Awards 5 combo points.
 */
export default class FeralFrenzy extends Analyzer {
  static dependencies = {
    comboPointTracker: ComboPointTracker,
    energyTracker: EnergyTracker,
    enemies: Enemies,
  };

  protected comboPointTracker!: ComboPointTracker;
  protected energyTracker!: EnergyTracker;
  protected enemies!: Enemies;

  hasSwarm: boolean;

  /** Tracker for each Feral Frenzy cast */
  ffTrackers: FeralFrenzyCast[] = [];

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.FERAL_FRENZY_TALENT);
    this.hasSwarm = this.selectedCombatant.hasTalent(TALENTS_DRUID.ADAPTIVE_SWARM_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_DRUID.FERAL_FRENZY_TALENT),
      this.onCastFf,
    );
  }

  onCastFf(event: CastEvent) {
    const tfOnCast = this.selectedCombatant.hasBuff(SPELLS.TIGERS_FURY.id);
    const cpsOnCast = this.comboPointTracker.current;
    const energyOnCast = this.energyTracker.current;
    let swarmOnTarget = false;
    if (this.hasSwarm) {
      const target = this.enemies.getEntity(event);
      if (target && target.hasBuff(SPELLS.ADAPTIVE_SWARM_DAMAGE.id)) {
        swarmOnTarget = true;
      }
    }

    this.ffTrackers.push({
      timestamp: event.timestamp,
      tfOnCast,
      cpsOnCast,
      energyOnCast,
      swarmOnTarget,
    });
  }

  /** Guide fragment showing a breakdown of each Feral Frenzy cast */
  get guideCastBreakdown() {
    const explanation = (
      <>
        <p>
          <strong>
            <SpellLink spell={TALENTS_DRUID.FERAL_FRENZY_TALENT} />
          </strong>{' '}
          is a brief but extremely powerful bleed. It's best used soon after becoming available, but
          can be held a few seconds to line up with damage boosts. Always use with{' '}
          <SpellLink spell={SPELLS.TIGERS_FURY} /> active
          {this.hasSwarm && (
            <>
              {' '}
              and if possible with <SpellLink spell={SPELLS.ADAPTIVE_SWARM_DAMAGE} /> on the target
            </>
          )}
          . As it also gives 5 combo points, it's best used at low combo points in order not to
          waste them.
        </p>
      </>
    );

    const data = (
      <div>
        <strong>Per-Cast Breakdown</strong>
        <small> - click to expand</small>
        {this.ffTrackers.map((cast, ix) => {
          const header = (
            <>
              @ {this.owner.formatTimestamp(cast.timestamp)} &mdash;{' '}
              <SpellLink spell={TALENTS_DRUID.FERAL_FRENZY_TALENT} />
            </>
          );

          let cpsPerf = QualitativePerformance.Good;
          if (cast.cpsOnCast > 2) {
            cpsPerf = QualitativePerformance.Fail;
          } else if (cast.cpsOnCast > 0) {
            cpsPerf = QualitativePerformance.Ok;
          }

          let overallPerf = QualitativePerformance.Good;
          if (this.hasSwarm && !cast.swarmOnTarget) {
            overallPerf = QualitativePerformance.Ok;
          }
          if (cast.cpsOnCast > 2 || !cast.tfOnCast) {
            overallPerf = QualitativePerformance.Fail;
          }

          const checklistItems: CooldownExpandableItem[] = [];
          checklistItems.push({
            label: (
              <>
                <SpellLink spell={SPELLS.TIGERS_FURY} /> active
              </>
            ),
            result: <PassFailCheckmark pass={cast.tfOnCast} />,
          });
          checklistItems.push({
            label: 'Combo Points on cast',
            result: <PerformanceMark perf={cpsPerf} />,
            details: <>({cast.cpsOnCast} CPs)</>,
          });
          this.hasSwarm &&
            checklistItems.push({
              label: (
                <>
                  <SpellLink spell={SPELLS.ADAPTIVE_SWARM_DAMAGE} /> on target
                </>
              ),
              result: <PassFailCheckmark pass={cast.swarmOnTarget} />,
            });

          return (
            <CooldownExpandable
              header={header}
              checklistItems={checklistItems}
              perf={overallPerf}
              key={ix}
            />
          );
        })}
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }
}

interface FeralFrenzyCast {
  timestamp: number;
  tfOnCast: boolean;
  cpsOnCast: number;
  energyOnCast: number;
  swarmOnTarget: boolean;
}
