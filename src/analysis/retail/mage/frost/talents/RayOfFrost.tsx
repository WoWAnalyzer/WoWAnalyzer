import type { JSX } from 'react';
import { SHATTER_DEBUFFS } from 'analysis/retail/mage/shared';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, GetRelatedEvents } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/mage/frost/Guide';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { SpellSeq } from 'parser/ui/SpellSeq';
import { PerformanceMark } from 'interface/guide';

class RayOfFrost extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  rayOfFrost: { timestamp: number; hits: number; damage: DamageEvent[] }[] = [];
  castEntries: BoxRowEntry[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.RAY_OF_FROST_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.RAY_OF_FROST_TALENT),
      this.onRayCast,
    );
  }

  onRayCast(event: CastEvent) {
    const damage: DamageEvent[] | undefined = GetRelatedEvents(event, 'SpellDamage');

    const rayOfFrostDetails = {
      timestamp: event.timestamp,
      hits: damage.length,
      damage: damage,
    };
    this.rayOfFrost.push(rayOfFrostDetails);

    this.analyzeCastEntry(rayOfFrostDetails);
  }

  private analyzeCastEntry(rayOfFrostDetails: { timestamp: number; hits: number }) {
    let performance = QualitativePerformance.Fail;
    const count = `${rayOfFrostDetails.hits}/8 hits`;
    if (rayOfFrostDetails.hits === 8) {
      performance = QualitativePerformance.Perfect;
    } else if (rayOfFrostDetails.hits >= 7) {
      performance = QualitativePerformance.Good;
    }
    const tooltip = (
      <>
        <b>@ {this.owner.formatTimestamp(rayOfFrostDetails.timestamp)}</b>
        <p>
          <PerformanceMark perf={performance} /> {performance}: {count}
        </p>
      </>
    );
    this.castEntries.push({ value: performance, tooltip });
  }

  get badCasts() {
    return this.rayOfFrost.filter((r) => r.hits < 7).length;
  }

  get totalCasts() {
    return this.rayOfFrost.length;
  }

  get castUtilization() {
    return 1 - this.badCasts / this.totalCasts;
  }

  get rayOfFrostUtilizationThresholds() {
    return {
      actual: this.castUtilization,
      isLessThan: {
        minor: 0.9,
        average: 0.8,
        major: 0.7,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get guideSubsection(): JSX.Element {
    const rayOfFrost = <SpellLink spell={TALENTS.RAY_OF_FROST_TALENT} />;

    const cometStorm = <SpellLink spell={TALENTS.COMET_STORM_TALENT} />;
    const glacialAssault = <SpellLink spell={TALENTS.GLACIAL_ASSAULT_TALENT} />;

    const frostbolt = <SpellLink spell={SPELLS.FROSTBOLT} />;
    const icelance = <SpellLink spell={SPELLS.ICE_LANCE_DAMAGE} />;

    const icicles = <SpellLink spell={SPELLS.MASTERY_ICICLES} />;

    const glacialAssaultKnown = this.selectedCombatant.hasTalent(TALENTS.GLACIAL_ASSAULT_TALENT);

    const explanation = (
      <>
        <p>
          <b>{rayOfFrost}</b> is the most important long cooldown spell in Frost. You want to cast
          it as soon as possible, but there are some rules to follow in order to get the most out of
          it.
        </p>
        <ol>
          <li>
            Don't miss ticks. Stand still while casting. You have shimmer in case you need to avoid
            something
          </li>
          <li>
            It generates 8 stacks of freeze, try to cast it with less than 12 stacks on the target
            to avoid wasting stacks
          </li>
        </ol>
      </>
    );
    const data = (
      <div>
        <RoundedPanel>
          <strong>{rayOfFrost} cast efficiency</strong>
          <div className="flex-main chart" style={{ padding: 15 }}>
            {this.subStatistic()}
          </div>
          <strong>{rayOfFrost} cast details</strong>
          <PerformanceBoxRow values={this.castEntries} />
          <small>
            blue (perfect) / green (good) / red (fail) mouseover the rectangles to see more details
          </small>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(
      explanation,
      data,
      GUIDE_CORE_EXPLANATION_PERCENT,
      'Ray Of Frost',
    );
  }

  /** Guide subsection describing the proper usage of Ray of Frost */
  subStatistic() {
    return (
      <CastEfficiencyBar
        spell={TALENTS.RAY_OF_FROST_TALENT}
        gapHighlightMode={GapHighlight.FullCooldown}
        minimizeIcons
        slimLines
        useThresholds
      />
    );
  }
}

export default RayOfFrost;
