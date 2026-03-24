import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { SpellLink } from 'interface';
import { TALENTS_DRUID } from 'common/TALENTS';
import HIT_TYPES from 'game/HIT_TYPES';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import Events, { CastEvent } from 'parser/core/Events';
import { getDamageHits } from 'analysis/retail/druid/feral/normalizers/CastLinkNormalizer';
import SPELLS from 'common/SPELLS';
import EnergyTracker from 'analysis/retail/druid/feral/modules/core/energy/EnergyTracker';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { formatNumber } from 'common/format';
import CooldownExpandable from 'interface/guide/components/CooldownExpandable';
import { PerformanceMark } from 'interface/guide';

/**
 * **Chomp**
 * Spec Talent
 * Chomp's the target for X damage. Crits do 3x Damage.
 * Only useable When falling below 30% energy and 2 seconds after.
 * 20 Second cooldown
 */
export default class Chomp extends Analyzer {
  // Todo: We probably want to lineup spellcooldown with the energy values required.
  // So we can display missed oppurtuines to cast it.
  // Those are more impactfully bad than sending the CD without TF
  // For a first round, this should be fine
  static dependencies = {
    energyTracker: EnergyTracker,
  };

  protected energyTracker!: EnergyTracker;
  chompCasts: ChompCast[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.CHOMP_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_DRUID.CHOMP_TALENT),
      this.onChompCast,
    );
  }

  onChompCast(event: CastEvent) {
    const damageEvents = getDamageHits(event);
    const damage = damageEvents.reduce((total, e) => total + (e.amount || 0), 0);

    this.chompCasts.push({
      timestamp: event.timestamp,
      tigersFuryActive: this.selectedCombatant.hasBuff(SPELLS.TIGERS_FURY.id),
      damage,
      isCrit: damageEvents.some((e) => e.hitType === HIT_TYPES.CRIT),
    });
  }

  get totalDamage(): number {
    return this.chompCasts.reduce((sum, cast) => sum + cast.damage, 0);
  }

  get castsWithTigersFury(): number {
    return this.chompCasts.filter((c) => c.tigersFuryActive).length;
  }

  get critRate(): number {
    return this.chompCasts.filter((c) => c.isCrit).length / this.chompCasts.length;
  }

  get guideCastBreakdown() {
    const explanation = (
      <>
        <p>
          <strong>
            <SpellLink spell={TALENTS_DRUID.CHOMP_TALENT} />
          </strong>{' '}
          is a high-damage filler available when your energy drops below 30%. Use it as soon as the
          condition is met and the cooldown is ready. Using it during{' '}
          <SpellLink spell={SPELLS.TIGERS_FURY} /> is ideal, but don't hold it to align.
        </p>
      </>
    );

    const data = (
      <div>
        <strong>Per-Cast Breakdown</strong>
        <small> - click to expand</small>
        {this.chompCasts.map((cast, idx) => {
          const tfPerf = cast.tigersFuryActive
            ? QualitativePerformance.Perfect
            : QualitativePerformance.Good;

          const header = (
            <span>
              @ {this.owner.formatTimestamp(cast.timestamp)} — {formatNumber(cast.damage)} damage
              {cast.isCrit ? ' (Crit) ' : ' '}
              <SpellLink spell={TALENTS_DRUID.CHOMP_TALENT} />
            </span>
          );

          const checklistItems = [
            {
              label: "Tiger's Fury active",
              result: <PerformanceMark perf={tfPerf} />,
              details: <>{cast.tigersFuryActive ? 'Yes' : 'No'}</>,
            },
          ];

          return (
            <CooldownExpandable
              header={header}
              checklistItems={checklistItems}
              perf={tfPerf}
              key={idx}
            />
          );
        })}
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }
}

interface ChompCast {
  timestamp: number;
  tigersFuryActive: boolean;
  damage: number;
  isCrit: boolean;
}
