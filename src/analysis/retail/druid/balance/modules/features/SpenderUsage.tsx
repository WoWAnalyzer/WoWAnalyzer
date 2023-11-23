import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import GradiatedPerformanceBar from 'interface/guide/components/GradiatedPerformanceBar';
import { encodeEventTargetString } from 'parser/shared/modules/Enemies';
import { currentEclipse } from 'analysis/retail/druid/balance/constants';

const MIN_STARFALL_TARGETS = 3;

export default class SpenderUsage extends Analyzer {
  totalStarsurges: number = 0;
  noEclipseStarsurges: number = 0;

  totalStarfalls: number = 0;
  lowTargetStarfalls: number = 0;
  noEclipseStarfalls: number = 0;

  // populate with targetIDs recently hit
  lastStarfallCast: CastEvent | undefined = undefined;
  recentlyHitStarfallTargets: Set<string> = new Set<string>();

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.STARSURGE_MOONKIN),
      this.onStarsurge,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.STARFALL_CAST),
      this.onStarfall,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.STARFALL),
      this.onStarfallDamage,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onStarsurge(event: CastEvent) {
    if (currentEclipse(this.selectedCombatant) === 'none') {
      this.noEclipseStarsurges += 1;
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = `You should only cast Starsurge during Eclipse!`;
    }
    this.totalStarsurges += 1;
  }

  onStarfall(event: CastEvent) {
    if (currentEclipse(this.selectedCombatant) === 'none') {
      this.noEclipseStarfalls += 1;
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = `You should only cast Starfall during Eclipse!`;
    }
    this.totalStarfalls += 1;

    this._tallyLastStarfall();
    this.lastStarfallCast = event;
  }

  onStarfallDamage(event: DamageEvent) {
    const targetString = encodeEventTargetString(event);
    if (targetString) {
      this.recentlyHitStarfallTargets.add(targetString);
    }
  }

  onFightEnd() {
    this._tallyLastStarfall();
  }

  // check all unique targets hit since last starfall cast, use to check for 'too few targets' case
  _tallyLastStarfall() {
    if (this.recentlyHitStarfallTargets.size < MIN_STARFALL_TARGETS && this.lastStarfallCast) {
      this.lowTargetStarfalls += 1;
      this.lastStarfallCast.meta = this.lastStarfallCast.meta || {};
      this.lastStarfallCast.meta.isInefficientCast = true;
      this.lastStarfallCast.meta.inefficientCastReason = `This Starfall hit too few targets!`;

      this.recentlyHitStarfallTargets.clear();
      this.lastStarfallCast = undefined;
    }
  }

  get goodStarsurges() {
    return this.totalStarsurges - this.noEclipseStarsurges;
  }

  get goodStarfalls() {
    return this.totalStarfalls - this.lowTargetStarfalls - this.noEclipseStarfalls;
  }

  get percentGoodStarsurges() {
    return this.totalStarsurges === 0
      ? 1
      : (this.totalStarsurges - this.noEclipseStarsurges) / this.totalStarsurges;
  }

  get percentGoodStarfalls() {
    return this.totalStarfalls === 0
      ? 1
      : (this.totalStarfalls - this.lowTargetStarfalls - this.noEclipseStarfalls) /
          this.totalStarfalls;
  }

  get guideSubsection() {
    const explanation = (
      <>
        <p>
          <strong>Spender spells</strong> are{' '}
          <strong>
            <SpellLink spell={SPELLS.STARSURGE_MOONKIN} />
          </strong>{' '}
          and{' '}
          <strong>
            <SpellLink spell={SPELLS.STARFALL} />
          </strong>
          .
        </p>
        <p>
          They spend Astral Power to do big damage. Use{' '}
          <SpellLink spell={SPELLS.STARSURGE_MOONKIN} /> against 1 target, and{' '}
          <SpellLink spell={SPELLS.STARFALL} /> against multiple targets.
        </p>
        <p>
          Never use spenders outside of <SpellLink spell={SPELLS.ECLIPSE} />.
        </p>
      </>
    );

    const goodStarsurgeData = {
      count: this.goodStarsurges,
      label: 'Good Starsurges',
    };
    const noEclipseStarsurgeData = {
      count: this.noEclipseStarsurges,
      label: 'No-Eclipse Starsurges',
    };

    const goodStarfallData = {
      count: this.goodStarfalls,
      label: 'Good Starfalls',
    };
    const lowTargetStarfallData = {
      count: this.lowTargetStarfalls,
      label: 'Low Target Starfalls',
    };
    const noEclipseStarfallData = {
      count: this.noEclipseStarsurges,
      label: 'No-Eclipse Starfalls',
    };

    const data = (
      <div>
        <div>
          <strong>Starsurge cast breakdown</strong>
          <small>
            {' '}
            - Green is a good cast, Red is without Eclipse active. Mouseover for more details.
          </small>
          {this.totalStarsurges === 0 ? (
            <h4>No Starsurges cast this encounter!</h4>
          ) : (
            <GradiatedPerformanceBar good={goodStarsurgeData} bad={noEclipseStarsurgeData} />
          )}
        </div>
        <br />
        <div>
          <strong>Starfall cast breakdown</strong>
          <small>
            {' '}
            - Green is a good cast, Yellow hit too few targets, Red is without Eclipse active.
            Mouseover for more details.
          </small>
          {this.totalStarfalls === 0 ? (
            <h4>No Starfalls cast this encounter!</h4>
          ) : (
            <GradiatedPerformanceBar
              good={goodStarfallData}
              ok={lowTargetStarfallData}
              bad={noEclipseStarfallData}
            />
          )}
        </div>
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }
}
