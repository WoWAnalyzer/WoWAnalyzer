import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ComboPointTracker from 'analysis/retail/druid/feral/modules/core/combopoints/ComboPointTracker';
import { TALENTS_DRUID } from 'common/TALENTS';
import Events, { CastEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import Enemies from 'parser/shared/modules/Enemies';
import { SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { getLowestPerf, QualitativePerformance } from 'parser/ui/QualitativePerformance';
import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';
import { PassFailCheckmark, PerformanceMark } from 'interface/guide';
import EnergyTracker from 'analysis/retail/druid/feral/modules/core/energy/EnergyTracker';
import { getDamageHits } from 'analysis/retail/druid/feral/normalizers/CastLinkNormalizer';

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
  isFrantic = false;
  isFocused = false;

  /** Tracker for each Feral Frenzy cast */
  ffTrackers: FeralFrenzyCast[] = [];

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.FERAL_FRENZY_TALENT);
    this.isFrantic = this.selectedCombatant.hasTalent(TALENTS_DRUID.FRANTIC_FRENZY_TALENT);
    this.isFocused = this.selectedCombatant.hasTalent(TALENTS_DRUID.FOCUSED_FRENZY_TALENT);

    if (!this.isFrantic) {
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(TALENTS_DRUID.FERAL_FRENZY_TALENT),
        this.onCastFf,
      );
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_DRUID.FRANTIC_FRENZY_TALENT),
      this.onCastFf,
    );
  }

  onCastFf(event: CastEvent) {
    const tfOnCast = this.selectedCombatant.hasBuff(SPELLS.TIGERS_FURY.id);
    const cpsOnCast = this.comboPointTracker.current;
    const energyOnCast = this.energyTracker.current;
    const isFrantic = this.isFrantic;
    const damageEvents = getDamageHits(event);
    const hitCount = new Set(damageEvents.map((e) => e.targetID)).size;
    this.ffTrackers.push({
      timestamp: event.timestamp,
      tfOnCast,
      cpsOnCast,
      energyOnCast,
      isFrantic,
      hitCount,
    });
  }

  get talent() {
    if (this.isFrantic) {
      return TALENTS_DRUID.FRANTIC_FRENZY_TALENT;
    }
    return TALENTS_DRUID.FERAL_FRENZY_TALENT;
  }

  /** Guide fragment showing a breakdown of each Feral Frenzy cast */
  get guideCastBreakdown() {
    const talent = this.talent;

    const explanation = (
      <>
        <p>
          <strong>
            <SpellLink spell={talent} />
          </strong>{' '}
          is a brief but extremely powerful bleed. Use it on cooldown. As it gives 5 combo points,
          it's best used at 2 or fewer combo points in order not to waste them.
          {this.isFrantic &&
            ' Should be used within as large of packs as possible for you to gain the most benefit out of it.'}
          {this.isFocused && (
            <>
              {' '}
              With <SpellLink spell={TALENTS_DRUID.FOCUSED_FRENZY_TALENT} />, always use it during{' '}
              <SpellLink spell={SPELLS.TIGERS_FURY} />.
            </>
          )}
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
              @ {this.owner.formatTimestamp(cast.timestamp)} &mdash; <SpellLink spell={talent} />
            </>
          );

          let cpsPerf = QualitativePerformance.Good;
          if (cast.cpsOnCast > 4) {
            cpsPerf = QualitativePerformance.Fail;
          } else if (cast.cpsOnCast > 2) {
            cpsPerf = QualitativePerformance.Ok;
          }

          let overallPerf = QualitativePerformance.Good;
          overallPerf = getLowestPerf([overallPerf, cpsPerf]);

          const checklistItems: CooldownExpandableItem[] = [];

          if (this.isFocused) {
            checklistItems.push({
              label: (
                <>
                  <SpellLink spell={SPELLS.TIGERS_FURY} /> active
                </>
              ),
              result: <PassFailCheckmark pass={cast.tfOnCast} />,
            });
            if (!cast.tfOnCast) {
              overallPerf = QualitativePerformance.Fail;
            }
          }

          checklistItems.push({
            label: 'Combo Points on cast',
            result: <PerformanceMark perf={cpsPerf} />,
            details: (
              <>
                ({cast.cpsOnCast} CPs)
                {this.isFrantic && <> ({cast.hitCount} Targets hit)</>}
              </>
            ),
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
  isFrantic: boolean; // Feral Frenzy can be upgraded to Frantic Frenzy now
  hitCount: number; // The ability becomes AoE. This greatly changes the effeciency values.
}
