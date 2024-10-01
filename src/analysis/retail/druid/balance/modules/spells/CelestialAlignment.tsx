import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_DRUID } from 'common/TALENTS';
import { cdDuration, cdSpell } from 'analysis/retail/druid/balance/constants';
import SpellLink from 'interface/SpellLink';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import Spell from 'common/SPELLS/Spell';
import Events, { CastEvent } from 'parser/core/Events';
import AlwaysBeCasting from 'analysis/retail/druid/balance/modules/features/AlwaysBeCasting';
import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';
import { PerformanceMark } from 'interface/guide';
import { formatPercentage } from 'common/format';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

const PERFECT_INCARN_ACTIVE = 0.95;
const GOOD_INCARN_ACTIVE = 0.9;
const OK_INCARN_ACTIVE = 0.8;

const deps = {
  alwaysBeCasting: AlwaysBeCasting,
};

/**
 * **Celestial Alignment**
 * Spec Talent
 *
 * Celestial bodies align, maintaining both Eclipses and granting 10% haste for 15 sec.
 */
export default class CelestialAlignment extends Analyzer.withDependencies(deps) {
  /** Either CA or Incarnation depending on talent */
  cdSpell: Spell;
  /** The duration of current version of spell */
  cdDuration: number;
  /** Tracker for each CA cast */
  caTrackers: CaCast[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.CELESTIAL_ALIGNMENT_TALENT);

    this.cdSpell = cdSpell(this.selectedCombatant);
    this.cdDuration = cdDuration(this.selectedCombatant);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(this.cdSpell), this.onCdUse);
  }

  onCdUse(event: CastEvent) {
    this.caTrackers.push({
      startTimestamp: event.timestamp,
      endTimestamp: Math.min(event.timestamp + this.cdDuration, this.owner.fight.end_time),
      activeTimePercentage: undefined,
    });
  }

  _fillActiveTimePercentages() {
    this.caTrackers.forEach((cast) => {
      if (cast.activeTimePercentage === undefined) {
        cast.activeTimePercentage = this.deps.alwaysBeCasting.getActiveTimePercentageInWindow(
          cast.startTimestamp,
          cast.endTimestamp,
        );
      }
    });
  }

  get guideCastBreakdown(): JSX.Element {
    this._fillActiveTimePercentages();

    const explanation = (
      <p>
        <strong>
          <SpellLink spell={this.cdSpell} />
        </strong>{' '}
        is our primary damage cooldown. It's best used as soon as it's available, but can be held to
        ensure you'll have full target uptime during its duration (don't use it when it will be
        interrupted by a fight mechanic).
      </p>
    );

    const data = (
      <div>
        <strong>Per-Cast Breakdown</strong>
        <small> - click to expand</small>
        {this.caTrackers.map((cast, idx) => {
          const header = (
            <>
              @ {this.owner.formatTimestamp(cast.startTimestamp)} &mdash;{' '}
              <SpellLink spell={this.cdSpell} />
            </>
          );

          const activeTimePercentage = cast.activeTimePercentage ?? 0;
          let percentActivePerf;
          if (activeTimePercentage >= PERFECT_INCARN_ACTIVE) {
            percentActivePerf = QualitativePerformance.Perfect;
          } else if (activeTimePercentage >= GOOD_INCARN_ACTIVE) {
            percentActivePerf = QualitativePerformance.Good;
          } else if (activeTimePercentage >= OK_INCARN_ACTIVE) {
            percentActivePerf = QualitativePerformance.Ok;
          } else {
            percentActivePerf = QualitativePerformance.Fail;
          }

          const checklistItems: CooldownExpandableItem[] = [];
          checklistItems.push({
            label: <>Stay Active!</>,
            result: <PerformanceMark perf={percentActivePerf} />,
            details: <>({formatPercentage(cast.activeTimePercentage ?? 0, 0)}% active time)</>,
          });
          // TODO more checks?

          return (
            <CooldownExpandable
              header={header}
              checklistItems={checklistItems}
              perf={percentActivePerf}
              key={idx}
            />
          );
        })}
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }
}

interface CaCast {
  startTimestamp: number;
  endTimestamp: number;
  activeTimePercentage: number | undefined; // Fill in at end, only once for perf
  // TODO other things to track?
}
