import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import CoreHitCountAoE, { SpellAoeTracker } from 'parser/core/HitCountAoE';
import Events, { CastEvent } from 'parser/core/Events';
import { ReactNode } from 'react';
import { BadColor, GoodColor, PerfectColor, SubSection, VeryBadColor } from 'interface/guide';
import SPELLS from 'common/SPELLS/rogue';
import TALENTS from 'common/TALENTS/rogue';
import { getHitCount } from '../../normalizers/CastLinkNormalizer';
import DonutChart from 'parser/ui/DonutChart';
import { SpellLink } from 'interface';
import { RoundedPanel, SideBySidePanels } from 'interface/guide/components/GuideDivs';

export default class HitCountAoE extends CoreHitCountAoE {
  private readonly fanOfKnivesTracker: FanOfKnivesAoETracker;
  private readonly crimsonTempestTracker?: CrimsonTempestAoETracker;

  constructor(options: Options) {
    super(options);

    this.fanOfKnivesTracker = this.registerAoeTracker({
      ...this.newAoeTracker(SPELLS.FAN_OF_KNIVES),
      twoHitCasts: 0,
    });
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FAN_OF_KNIVES),
      this.onFanOfKnivesCast,
    );

    if (this.selectedCombatant.hasTalent(TALENTS.CRIMSON_TEMPEST_TALENT)) {
      this.crimsonTempestTracker = this.registerAoeTracker(
        this.newAoeTracker(TALENTS.CRIMSON_TEMPEST_TALENT),
      );
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(TALENTS.CRIMSON_TEMPEST_TALENT),
        this.onCrimsonTempestCast,
      );
    }
  }

  getHitCountForCast(event: CastEvent): number {
    return getHitCount(event);
  }

  get fanOfKnivesChart() {
    if (this.fanOfKnivesTracker.casts === 0) {
      return <strong>You never used this spell!</strong>;
    }

    const items = [
      {
        color: PerfectColor,
        label: 'Hit 3+ Targets',
        value: this.fanOfKnivesTracker.multiHitCasts - this.fanOfKnivesTracker.twoHitCasts,
      },
      {
        color: BadColor,
        label: 'Hit 1-2 Targets',
        value: this.fanOfKnivesTracker.oneHitCasts + this.fanOfKnivesTracker.twoHitCasts,
      },
      {
        color: VeryBadColor,
        label: 'Hit 0 Targets',
        value: this.fanOfKnivesTracker.zeroHitCasts,
      },
    ];
    return <DonutChart items={items} />;
  }

  get crimsonTempestChart() {
    if (!this.crimsonTempestTracker || this.crimsonTempestTracker.casts === 0) {
      return <strong>You never used this spell!</strong>;
    }

    const items = [
      {
        color: PerfectColor,
        label: 'Hit 2+ Targets',
        value: this.crimsonTempestTracker.multiHitCasts,
      },
      {
        color: GoodColor,
        label: 'Hit 1 Target',
        value: this.crimsonTempestTracker.oneHitCasts,
      },
      {
        color: VeryBadColor,
        label: 'Hit 0 Targets',
        value: this.crimsonTempestTracker.zeroHitCasts,
      },
    ];
    return <DonutChart items={items} />;
  }

  get guideSubsection(): JSX.Element {
    const hasCrimsonTempest = this.selectedCombatant.hasTalent(TALENTS.CRIMSON_TEMPEST_TALENT);

    return (
      <SubSection>
        <p>
          <strong>AoE Abilities</strong> should only be used when you can hit more than one target.
        </p>
        <SideBySidePanels>
          <RoundedPanel>
            <div>
              <strong>
                <SpellLink spell={SPELLS.FAN_OF_KNIVES} />{' '}
              </strong>{' '}
              should only be used on three or more targets.
            </div>
            {this.fanOfKnivesChart}
          </RoundedPanel>
          {hasCrimsonTempest && (
            <RoundedPanel>
              <div>
                <strong>
                  <SpellLink spell={TALENTS.CRIMSON_TEMPEST_TALENT} />{' '}
                </strong>{' '}
                should only be used on multiple targets.
              </div>
              {this.crimsonTempestChart}
            </RoundedPanel>
          )}
        </SideBySidePanels>
      </SubSection>
    );
  }

  protected statisticTooltip(): ReactNode {
    // intentially returning undefined so that we don't render a tooltip
    return undefined;
  }

  protected statisticTrackerTooltip(tracker: SpellAoeTracker): ReactNode {
    return (
      <>
        You cast {tracker.spell.name} <strong>{tracker.casts}</strong> times.
        <ul>
          <li>
            <strong>{tracker.zeroHitCasts}</strong> hit nothing
          </li>
          <li>
            <strong>{tracker.oneHitCasts}</strong> hit one target
          </li>
          {isFanOfKnivesAoETracker(tracker) ? (
            <>
              <li>
                <strong>{tracker.twoHitCasts}</strong> hit two targets
              </li>
              <li>
                <strong>{tracker.multiHitCasts - tracker.twoHitCasts}</strong> hit three-plus
                targets
              </li>
            </>
          ) : (
            <li>
              <strong>{tracker.multiHitCasts}</strong> hit multiple targets
            </li>
          )}
        </ul>
      </>
    );
  }

  private onFanOfKnivesCast(event: CastEvent) {
    this.onAoeCast(event, this.fanOfKnivesTracker);
    const hits = this.getHitCountForCast(event);
    if (hits === 2) {
      this.fanOfKnivesTracker.twoHitCasts += 1;
    }
  }

  private onCrimsonTempestCast(event: CastEvent) {
    if (this.crimsonTempestTracker) {
      this.onAoeCast(event, this.crimsonTempestTracker);
    }
  }
}

type FanOfKnivesAoETracker = SpellAoeTracker & {
  twoHitCasts: number;
};
const isFanOfKnivesAoETracker = (tracker: SpellAoeTracker): tracker is FanOfKnivesAoETracker =>
  'twoHitCasts' in tracker && typeof tracker.twoHitCasts === 'number';

type CrimsonTempestAoETracker = SpellAoeTracker;
