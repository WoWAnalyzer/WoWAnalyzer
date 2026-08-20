import talents from 'common/TALENTS/deathknight';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import CooldownExpandable, {
  CooldownExpandableItem,
} from 'interface/guide/components/CooldownExpandable';
import SpellLink from 'interface/SpellLink';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, ResourceChangeEvent } from 'parser/core/Events';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PerformanceMark } from 'interface/guide';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';

interface ErwCast {
  timestamp: number;
  wastedRp: number;
  gainedRp: number;
}

export default class EmpowerRuneWeapon extends Analyzer {
  erwTracker: ErwCast[] = [];

  currentCast: ErwCast | undefined;
  pendingRp: ErwCast | undefined;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(talents.EMPOWER_RUNE_WEAPON_TALENT);

    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(talents.EMPOWER_RUNE_WEAPON_TALENT),
      this.onResourceGain,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(talents.EMPOWER_RUNE_WEAPON_TALENT),
      this.onErwCast,
    );
  }

  onErwCast(event: CastEvent) {
    const pending =
      this.pendingRp && Math.abs(event.timestamp - this.pendingRp.timestamp) <= 1000
        ? this.pendingRp
        : undefined;
    this.currentCast = {
      timestamp: event.timestamp,
      wastedRp: pending?.wastedRp ?? 0,
      gainedRp: pending?.gainedRp ?? 0,
    };
    this.pendingRp = undefined;
    this.erwTracker.push(this.currentCast);
  }

  onResourceGain(event: ResourceChangeEvent) {
    // Patch 11.2 redesigned ERW as an instant cast. Its resource events follow
    // the cast instead of being spread across an aura duration.
    if (event.resourceChangeType !== RESOURCE_TYPES.RUNIC_POWER.id) {
      return;
    }
    if (
      this.currentCast &&
      event.timestamp >= this.currentCast.timestamp &&
      event.timestamp - this.currentCast.timestamp <= 1000
    ) {
      this.currentCast.gainedRp += event.resourceChange - event.waste;
      this.currentCast.wastedRp += event.waste;
    } else {
      this.pendingRp = {
        timestamp: event.timestamp,
        gainedRp: event.resourceChange - event.waste,
        wastedRp: event.waste,
      };
    }
  }

  get guideCastBreakdown() {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={talents.EMPOWER_RUNE_WEAPON_TALENT} />
        </strong>{' '}
        is an off-gcd <SpellLink spell={talents.KILLING_MACHINE_TALENT} /> and Runic Power
        generator. It helps us reduce the number of no-KM{' '}
        <SpellLink spell={talents.OBLITERATE_TALENT} />s we cast in a fight, as well as providing a
        burst of Runic Power. Avoid sitting at two charges, and avoid wasting the Runic Power it
        grants.
      </p>
    );

    const data = (
      <div>
        <strong>Per-Cast Breakdown</strong>
        <small> - click to expand</small>
        {this.erwTracker.map((cast, idx) => {
          const header = (
            <>
              @ {this.owner.formatTimestamp(cast.timestamp)} &mdash;{' '}
              <SpellLink spell={talents.EMPOWER_RUNE_WEAPON_TALENT} />
            </>
          );
          const checklistItems: CooldownExpandableItem[] = [];
          const runicPowerPerf = cast.wastedRp
            ? QualitativePerformance.Fail
            : QualitativePerformance.Good;
          checklistItems.push({
            label: 'Runic Power Gained',
            result: <PerformanceMark perf={runicPowerPerf} />,
            details: <>{cast.gainedRp}</>,
          });

          let overallPerf = QualitativePerformance.Good;
          if (cast.wastedRp > 0) {
            overallPerf = QualitativePerformance.Ok;
          }
          return (
            <CooldownExpandable
              header={header}
              checklistItems={checklistItems}
              perf={overallPerf}
              key={idx}
            />
          );
        })}
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }
}
