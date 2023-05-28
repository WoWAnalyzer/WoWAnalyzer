import Analyzer from 'parser/core/Analyzer';
import Spell from 'common/SPELLS/Spell';
import { CastEvent } from 'parser/core/Events';
import { ReactNode } from 'react';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { SpellIcon, TooltipElement } from 'interface';

export default abstract class HitCountAoE extends Analyzer {
  allTrackers: SpellAoeTracker[] = [];

  abstract getHitCountForCast(event: CastEvent): number;

  protected abstract statisticTooltip(): ReactNode;

  protected abstract statisticTrackerTooltip(tracker: SpellAoeTracker): ReactNode;

  statistic() {
    return (
      <Statistic
        tooltip={this.statisticTooltip()}
        size="flexible"
        position={STATISTIC_ORDER.CORE(10)}
      >
        <div className="pad boring-text">
          <label>AoE Ability Usage</label>
          <div className="value">
            {this.allTrackers.map((tracker) => (
              <>
                <TooltipElement
                  key={tracker.spell.id}
                  content={this.statisticTrackerTooltip(tracker)}
                >
                  <SpellIcon id={tracker.spell} />{' '}
                  {(tracker.casts === 0 ? 0 : tracker.hits / tracker.casts).toFixed(1)}{' '}
                </TooltipElement>
                <small>avg targets hit</small>
                <br />
              </>
            ))}
          </div>
        </div>
      </Statistic>
    );
  }

  protected newAoeTracker(spell: Spell): SpellAoeTracker {
    return {
      spell,
      casts: 0,
      hits: 0,
      zeroHitCasts: 0,
      oneHitCasts: 0,
      multiHitCasts: 0,
    };
  }

  protected registerAoeTracker<Tracker extends SpellAoeTracker>(tracker: Tracker): Tracker {
    this.allTrackers.push(tracker);
    return tracker;
  }

  /** Handles common AoE cast stuff, and returns number of targets hit */
  protected onAoeCast(event: CastEvent, tracker: SpellAoeTracker): number {
    const hits = this.getHitCountForCast(event);

    tracker.casts += 1;
    tracker.hits += hits;
    if (hits === 0) {
      tracker.zeroHitCasts += 1;
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = 'This cast hit nothing!';
    } else if (hits === 1) {
      tracker.oneHitCasts += 1;
    } else {
      tracker.multiHitCasts += 1;
    }
    return hits;
  }
}

export type SpellAoeTracker = {
  spell: Spell;
  casts: number;
  hits: number;
  zeroHitCasts: number;
  oneHitCasts: number;
  multiHitCasts: number;
};
