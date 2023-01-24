import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import CoreHitCountAoE, { SpellAoeTracker } from 'parser/core/HitCountAoE';
import Events, { CastEvent } from 'parser/core/Events';
import { ReactNode } from 'react';
import { GoodColor, PerfectColor, SubSection, VeryBadColor } from 'interface/guide';
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

    this.fanOfKnivesTracker = this.registerAoeTracker(this.newAoeTracker(SPELLS.FAN_OF_KNIVES));
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
        label: 'Hit 2+ Targets',
        value: this.fanOfKnivesTracker.multiHitCasts,
      },
      {
        color: GoodColor,
        label: 'Hit 1 Target',
        value: this.fanOfKnivesTracker.oneHitCasts,
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
                <SpellLink id={SPELLS.FAN_OF_KNIVES} />{' '}
              </strong>{' '}
              should only be used on multiple targets.
            </div>
            {this.fanOfKnivesChart}
          </RoundedPanel>
          {hasCrimsonTempest && (
            <RoundedPanel>
              <div>
                <strong>
                  <SpellLink id={TALENTS.CRIMSON_TEMPEST_TALENT} />{' '}
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
          <li>
            <strong>{tracker.multiHitCasts}</strong> hit multiple targets
          </li>
        </ul>
      </>
    );
  }

  private onFanOfKnivesCast(event: CastEvent) {
    this.onAoeCast(event, this.fanOfKnivesTracker);
  }

  private onCrimsonTempestCast(event: CastEvent) {
    if (this.crimsonTempestTracker) {
      this.onAoeCast(event, this.crimsonTempestTracker);
    }
  }
}

type FanOfKnivesAoETracker = SpellAoeTracker;
type CrimsonTempestAoETracker = SpellAoeTracker;
