import type { JSX } from 'react';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import { SpellLink } from 'interface';
import { PerformanceMark } from 'interface/guide';
import CastOverview from 'interface/guide/components/CastOverview';
import CastSummary, { CastEvaluation } from 'interface/guide/components/CastSummary';
import GuideSection from 'interface/guide/components/GuideSection';
import { TipBox } from 'interface/guide/components';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, GetRelatedEvent } from 'parser/core/Events';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import BeaconTargets from '../beacons/BeaconTargets';
import { INFUSION_OF_LIGHT_CONSUME } from '../../normalizers/EventLinks/EventLinkConstants';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../guide/Guide';

/**
 * What you do with the Infusion of Light procs you spend on Flash of Light.
 *
 * Hard casting one -- spending a global on it without a proc -- is the lowest priority
 * thing available, whatever else is talented. On top of that, Moment of Compassion's bonus
 * multiplies with the beacon transfer, so a proc is worth the most on whoever holds Beacon
 * of the Savior.
 */
class FlashOfLightUsage extends Analyzer {
  static dependencies = {
    beaconTargets: BeaconTargets,
  };

  protected beaconTargets!: BeaconTargets;

  casts = 0;
  hardCasts = 0;
  castsOnSavior = 0;
  castEvaluations: CastEvaluation[] = [];

  /**
   * The target preference only exists if you have both the bonus and a Beacon of the Savior
   * to aim it at. Without either, a proc spent anywhere is all there is to ask for.
   */
  private gradesOnBeacon =
    this.selectedCombatant.hasTalent(TALENTS.MOMENT_OF_COMPASSION_TALENT) &&
    this.selectedCombatant.hasTalent(TALENTS.BEACON_OF_THE_SAVIOR_1_HOLY_TALENT);

  constructor(options: Options) {
    super(options);
    // Without the talent there are no procs to spend, so every cast would read as a hard
    // cast and the whole thing would grade as failed for doing the only thing available.
    this.active = this.selectedCombatant.hasTalent(TALENTS.INFUSION_OF_LIGHT_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FLASH_OF_LIGHT),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    this.casts += 1;

    // The normalizer links the buff removal to the cast that spent it, so this is the
    // cast actually consuming a charge rather than one that merely had the buff up.
    const usedProc = GetRelatedEvent(event, INFUSION_OF_LIGHT_CONSUME) !== undefined;
    const onSavior =
      event.targetID !== undefined &&
      this.beaconTargets.hasBeaconId(event.targetID, SPELLS.BEACON_OF_THE_SAVIOR_BUFF.id);

    if (!usedProc) {
      this.hardCasts += 1;
    }
    if (onSavior) {
      this.castsOnSavior += 1;
    }

    this.castEvaluations.push(this.evaluateCast(event, usedProc, onSavior));
  }

  private evaluateCast(event: CastEvent, usedProc: boolean, onSavior: boolean): CastEvaluation {
    if (!usedProc) {
      return {
        timestamp: event.timestamp,
        performance: QualitativePerformance.Fail,
        reason: 'Hard cast without an Infusion of Light proc',
      };
    }

    if (!this.gradesOnBeacon) {
      return {
        timestamp: event.timestamp,
        performance: QualitativePerformance.Perfect,
        reason: 'Spent an Infusion of Light proc',
      };
    }

    if (onSavior) {
      return {
        timestamp: event.timestamp,
        performance: QualitativePerformance.Perfect,
        reason: 'Spent a proc on your Beacon of the Savior target',
      };
    }

    return {
      timestamp: event.timestamp,
      performance: QualitativePerformance.Ok,
      reason: 'Spent a proc on a target without Beacon of the Savior',
    };
  }

  get hardCastPercentage() {
    return this.casts === 0 ? 0 : this.hardCasts / this.casts;
  }

  /** Procs spent on someone who did not hold Beacon of the Savior. */
  get procsOffBeacon() {
    return Math.max(0, this.casts - this.hardCasts - this.castsOnSavior);
  }

  get offBeaconPercentage() {
    const procsSpent = this.casts - this.hardCasts;
    return procsSpent === 0 ? 0 : this.procsOffBeacon / procsSpent;
  }

  private get explanation() {
    return (
      <>
        <p>
          Never hard cast <SpellLink spell={SPELLS.FLASH_OF_LIGHT} />. Without an{' '}
          <SpellLink spell={TALENTS.INFUSION_OF_LIGHT_TALENT} /> proc it is the lowest priority
          thing you can spend a global on.
        </p>
        {this.gradesOnBeacon && (
          <p>
            With <SpellLink spell={TALENTS.MOMENT_OF_COMPASSION_TALENT} /> talented, aim your procs
            at whoever holds <SpellLink spell={TALENTS.BEACON_OF_THE_SAVIOR_1_HOLY_TALENT} />. Its
            bonus multiplies with the beacon transfer rather than adding to it, so the same cast is
            worth considerably more there. A proc spent on anyone else is a real loss, even though
            healing someone to save them is still the right call -- treat this as a strong
            preference rather than a rule.
          </p>
        )}
        {this.legend}
      </>
    );
  }

  private get legend() {
    return (
      <TipBox hideIcon>
        <div>
          <PerformanceMark perf={QualitativePerformance.Perfect} /> Perfect - spent a proc
          {this.gradesOnBeacon ? ' on your Beacon of the Savior target' : ''}
        </div>
        {this.gradesOnBeacon && (
          <div>
            <PerformanceMark perf={QualitativePerformance.Ok} /> Ok - spent a proc on a target
            without Beacon of the Savior
          </div>
        )}
        <div>
          <PerformanceMark perf={QualitativePerformance.Fail} /> Fail - hard cast, no proc spent
        </div>
      </TipBox>
    );
  }

  private get stats() {
    const stats = [
      {
        value: `${this.casts}`,
        label: 'Casts',
        tooltip: (
          <>
            Every <SpellLink spell={SPELLS.FLASH_OF_LIGHT} /> you cast.
          </>
        ),
      },
      {
        value: `${this.hardCasts}`,
        label: 'Hard Casts',
        tooltip: (
          <>
            {formatPercentage(this.hardCastPercentage, 0)}% of your casts were made without an{' '}
            <SpellLink spell={TALENTS.INFUSION_OF_LIGHT_TALENT} /> proc.
          </>
        ),
      },
    ];

    if (this.gradesOnBeacon) {
      stats.push({
        value: `${this.procsOffBeacon}`,
        label: 'Procs Off Beacon',
        tooltip: (
          <>
            {formatPercentage(this.offBeaconPercentage, 0)}% of the procs you spent went to someone
            without <SpellLink spell={TALENTS.BEACON_OF_THE_SAVIOR_1_HOLY_TALENT} />, missing the{' '}
            <SpellLink spell={TALENTS.MOMENT_OF_COMPASSION_TALENT} /> multiplier.{' '}
            {this.castsOnSavior} landed on the beacon.
          </>
        ),
      });
    }

    return stats;
  }

  get guideSubsection(): JSX.Element {
    return (
      <GuideSection
        explanation={this.explanation}
        explanationPercent={GUIDE_CORE_EXPLANATION_PERCENT}
      >
        <CastOverview
          spell={SPELLS.FLASH_OF_LIGHT}
          title="Flash of Light Overview"
          stats={this.stats}
        />
        <CastSummary spell={SPELLS.FLASH_OF_LIGHT} casts={this.castEvaluations} showBreakdown />
      </GuideSection>
    );
  }
}

export default FlashOfLightUsage;
