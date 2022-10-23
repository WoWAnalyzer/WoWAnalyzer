import SPELLS from 'common/SPELLS';
import { TooltipElement } from 'interface';
import { SpellIcon, SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { BuffEvent, CastEvent, TargettedEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { getHitCount, getHits } from '../../normalizers/CastLinkNormalizer';
import { TALENTS_DRUID } from 'common/TALENTS';
import { SubSection } from 'interface/guide';
import DonutChart from 'parser/ui/DonutChart';
import { VeryBadColor, BadColor, GoodColor, PerfectColor } from 'interface/guide';
import { proccedBloodtalons } from 'analysis/retail/druid/feral/normalizers/BloodtalonsLinkNormalizer';
import ThrashUptimeAndSnapshot from 'analysis/retail/druid/feral/modules/spells/ThrashUptimeAndSnapshot';
import { PANDEMIC_FRACTION } from 'analysis/retail/druid/feral/constants';
import Spell from 'common/SPELLS/Spell';
import { RoundedPanel, SideBySidePanels } from 'interface/guide/components/GuideDivs';

/**
 * Tracks the number of targets hit by Feral's AoE abilities.
 * Relies on CastLinkNormalizer linking casts to hits.
 */
class HitCountAoE extends Analyzer {
  static dependencies = {
    thrashUptime: ThrashUptimeAndSnapshot,
  };

  thrashUptime!: ThrashUptimeAndSnapshot;

  swipeTracker?: SwipeTracker;
  brsTracker?: BrsTracker;
  thrashTracker?: ThrashTracker;
  pwTracker?: PwTracker;
  allTrackers: SpellAoeTracker[] = [];

  hasBrs: boolean;
  hasPw: boolean;
  hasBt: boolean;

  constructor(options: Options) {
    super(options);

    this.hasBrs = this.selectedCombatant.hasTalent(TALENTS_DRUID.BRUTAL_SLASH_TALENT);
    this.hasPw = this.selectedCombatant.hasTalent(TALENTS_DRUID.PRIMAL_WRATH_TALENT);
    this.hasBt = this.selectedCombatant.hasTalent(TALENTS_DRUID.BLOODTALONS_TALENT);

    // fill the trackers relevant to talent setup
    if (this.hasBrs) {
      this.brsTracker = this._newAoeTracker(TALENTS_DRUID.BRUTAL_SLASH_TALENT);
      this.allTrackers.push(this.brsTracker);
    } else {
      this.swipeTracker = {
        ...this._newAoeTracker(SPELLS.SWIPE_CAT),
        oneHitsWithBt: 0,
        oneHitsWithoutBt: 0,
      };
      this.allTrackers.push(this.swipeTracker);
    }

    this.thrashTracker = {
      ...this._newAoeTracker(SPELLS.THRASH_FERAL),
      oneHitsButClip: 0,
      oneHitsNoClip: 0,
    };
    this.allTrackers.push(this.thrashTracker);

    if (this.hasPw) {
      this.pwTracker = this._newAoeTracker(TALENTS_DRUID.PRIMAL_WRATH_TALENT);
      this.allTrackers.push(this.pwTracker);
    }

    !this.hasBrs &&
      this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SWIPE_CAT), this.onSwipe);
    this.hasBrs &&
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(TALENTS_DRUID.BRUTAL_SLASH_TALENT),
        this.onBrutalSlash,
      );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.THRASH_FERAL),
      this.onThrash,
    );
    this.hasPw &&
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(TALENTS_DRUID.PRIMAL_WRATH_TALENT),
        this.onPrimalWrath,
      );
  }

  _newAoeTracker(spell: Spell): SpellAoeTracker {
    return {
      spell,
      casts: 0,
      hits: 0,
      zeroHitCasts: 0,
      oneHitCasts: 0,
      multiHitCasts: 0,
    };
  }

  onSwipe(event: CastEvent) {
    const hits = this._onAoeCast(event, this.swipeTracker!);
    if (hits === 1) {
      if (proccedBloodtalons(event)) {
        this.swipeTracker!.oneHitsWithBt += 1;
      } else {
        this.swipeTracker!.oneHitsWithoutBt += 1;
      }
    }
  }

  onBrutalSlash(event: CastEvent) {
    this._onAoeCast(event, this.brsTracker!);
  }

  onThrash(event: CastEvent) {
    const hits = this._onAoeCast(event, this.thrashTracker!);
    if (hits === 1) {
      const apply = getHits(event)[0] as BuffEvent<any>;
      const timeRemaining = this.thrashUptime.getTimeRemaining(apply as TargettedEvent<any>);
      if (timeRemaining > PANDEMIC_FRACTION * this.thrashUptime.getDotExpectedDuration()) {
        this.thrashTracker!.oneHitsButClip += 1;
      } else {
        this.thrashTracker!.oneHitsNoClip += 1;
      }
    }
  }

  onPrimalWrath(event: CastEvent) {
    this._onAoeCast(event, this.pwTracker!);
  }

  /** Handles common AoE cast stuff, and returns number of targets hit */
  _onAoeCast(event: CastEvent, tracker: SpellAoeTracker): number {
    const hits = getHitCount(event);

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

  get swipeChart() {
    if (this.swipeTracker!.casts === 0) {
      return <strong>You never used this spell!</strong>;
    }

    const items = [
      {
        color: PerfectColor,
        label: 'Hit 2+ Targets',
        value: this.swipeTracker!.multiHitCasts,
      },
      {
        color: GoodColor,
        label: (
          <>
            Hit 1 Target w/
            <SpellLink id={TALENTS_DRUID.BLOODTALONS_TALENT.id} />
          </>
        ),
        value: this.swipeTracker!.oneHitsWithBt,
      },
      {
        color: BadColor,
        label: 'Hit 1 Target',
        value: this.swipeTracker!.oneHitsWithoutBt,
      },
      {
        color: VeryBadColor,
        label: 'Hit 0 Targets',
        value: this.swipeTracker!.zeroHitCasts,
      },
    ];
    return <DonutChart items={items} />;
  }

  get brsChart() {
    if (this.brsTracker!.casts === 0) {
      return <strong>You never used this spell!</strong>;
    }

    const items = [
      {
        color: PerfectColor,
        label: 'Hit 2+ Targets',
        value: this.brsTracker!.multiHitCasts,
      },
      {
        color: GoodColor,
        label: 'Hit 1 Target',
        value: this.brsTracker!.oneHitCasts,
      },
      {
        color: VeryBadColor,
        label: 'Hit 0 Targets',
        value: this.brsTracker!.zeroHitCasts,
      },
    ];
    return <DonutChart items={items} />;
  }

  get thrashChart() {
    if (this.thrashTracker!.casts === 0) {
      return <strong>You never used this spell!</strong>;
    }

    const items = [
      {
        color: PerfectColor,
        label: 'Hit 2+ Targets',
        value: this.thrashTracker!.multiHitCasts,
      },
      {
        color: GoodColor,
        label: 'Hit 1 Target',
        value: this.thrashTracker!.oneHitsNoClip,
      },
      {
        color: BadColor,
        label: 'Hit 1 Target but Clipped',
        value: this.thrashTracker!.oneHitsButClip,
      },
      {
        color: VeryBadColor,
        label: 'Hit 0 Targets',
        value: this.thrashTracker!.zeroHitCasts,
      },
    ];
    return <DonutChart items={items} />;
  }

  get pwChart() {
    if (this.pwTracker!.casts === 0) {
      return <strong>You never used this spell!</strong>;
    }

    const items = [
      {
        color: PerfectColor,
        label: 'Hit 2+ Targets',
        value: this.pwTracker!.multiHitCasts,
      },
      {
        color: BadColor,
        label: 'Hit 1 Target',
        value: this.pwTracker!.oneHitCasts,
      },
      {
        color: VeryBadColor,
        label: 'Hit 0 Targets',
        value: this.pwTracker!.zeroHitCasts,
      },
    ];
    return <DonutChart items={items} />;
  }

  get guideSubsection(): JSX.Element {
    const hasBrs = this.selectedCombatant.hasTalent(TALENTS_DRUID.BRUTAL_SLASH_TALENT);
    const hasPw = this.selectedCombatant.hasTalent(TALENTS_DRUID.PRIMAL_WRATH_TALENT);
    const hasBt = this.selectedCombatant.hasTalent(TALENTS_DRUID.BLOODTALONS_TALENT);

    return (
      <SubSection>
        <p>
          <strong>AoE Abilities</strong> should usually only be used when you can hit more than one
          target, but some of them have applications on single target. The following charts count
          only hardcasts - procs from <SpellLink id={TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT.id} />{' '}
          are excluded.
        </p>
        <SideBySidePanels>
          {!hasBrs && (
            <RoundedPanel>
              <div>
                <strong>
                  <SpellLink id={SPELLS.SWIPE_CAT.id} />
                </strong>{' '}
                {hasBt ? (
                  <>
                    is acceptable on single-target to proc{' '}
                    <SpellLink id={TALENTS_DRUID.BLOODTALONS_TALENT.id} />
                  </>
                ) : (
                  <>should only be used on multiple targets</>
                )}
              </div>
              {this.swipeChart}
            </RoundedPanel>
          )}
          {hasBrs && (
            <RoundedPanel>
              <div>
                <strong>
                  <SpellLink id={TALENTS_DRUID.BRUTAL_SLASH_TALENT.id} />
                </strong>{' '}
                is better than <SpellLink id={SPELLS.SHRED.id} /> even on single-target
              </div>
              {this.brsChart}
            </RoundedPanel>
          )}
          <RoundedPanel>
            <div>
              <strong>
                <SpellLink id={SPELLS.THRASH_FERAL.id} />
              </strong>{' '}
              is a small gain over <SpellLink id={SPELLS.SHRED.id} /> on single-target when not
              clipping the DoT
            </div>
            {this.thrashChart}
          </RoundedPanel>
          {hasPw && (
            <RoundedPanel>
              <div>
                <strong>
                  <SpellLink id={TALENTS_DRUID.PRIMAL_WRATH_TALENT.id} />
                </strong>{' '}
                should only be used on multiple targets
              </div>
              {this.pwChart}
            </RoundedPanel>
          )}
        </SideBySidePanels>
      </SubSection>
    );
  }

  statistic() {
    return (
      <Statistic
        tooltip={
          <>
            These counts consider hardcasts only - numbers from Convoke the Spirits are not
            included.
          </>
        }
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
                  content={
                    <>
                      This statistic does not include casts from Convoke the Spirits. You cast{' '}
                      {tracker.spell.name} <strong>{tracker.casts}</strong> times.
                      <ul>
                        <li>
                          <strong>{tracker.zeroHitCasts}</strong> hit nothing
                        </li>
                        <li>
                          <strong>{tracker.oneHitCasts}</strong> hit one target
                        </li>
                        <li>
                          <strong>{tracker.multiHitCasts}</strong> hit multiple targets
                        </li>
                      </ul>
                    </>
                  }
                >
                  <SpellIcon id={tracker.spell.id} />{' '}
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
}

type SpellAoeTracker = {
  spell: Spell;
  casts: number;
  hits: number;
  zeroHitCasts: number;
  oneHitCasts: number;
  multiHitCasts: number;
};

type SwipeTracker = SpellAoeTracker & {
  oneHitsWithBt: number;
  oneHitsWithoutBt: number;
};

type BrsTracker = SpellAoeTracker;

type ThrashTracker = SpellAoeTracker & {
  oneHitsButClip: number;
  oneHitsNoClip: number;
};

type PwTracker = SpellAoeTracker;

export default HitCountAoE;
