import { SHATTER_DEBUFFS } from 'analysis/retail/mage/shared';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MAGE } from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, { CastEvent, DamageEvent, GetRelatedEvents } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
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

  rayOfFrost: { hits: number; shatteredHits: number }[] = [];
  castEntries: BoxRowEntry[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MAGE.RAY_OF_FROST_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MAGE.RAY_OF_FROST_TALENT),
      this.onRayCast,
    );
  }

  onRayCast(event: CastEvent) {
    const damage: DamageEvent[] | undefined = GetRelatedEvents(event, 'SpellDamage');
    let shattered = 0;
    damage.forEach((d) => {
      const enemy = this.enemies.getEntity(d);
      if (SHATTER_DEBUFFS.some((effect) => enemy?.hasBuff(effect.id, d.timestamp))) {
        shattered += 1;
      }
    });

    const rayOfFrostDetails = {
      hits: damage.length,
      shatteredHits: shattered,
    };
    this.rayOfFrost.push(rayOfFrostDetails);

    this.analyzeCastEntry(rayOfFrostDetails);
  }

  private analyzeCastEntry(rayOfFrostDetails: { hits: number; shatteredHits: number }) {
    let performance = QualitativePerformance.Fail;
    const count = `${rayOfFrostDetails.hits}/5 hits & ${rayOfFrostDetails.shatteredHits}/5 shattered hits`;
    if (rayOfFrostDetails.hits === 5 && rayOfFrostDetails.shatteredHits === 5) {
      performance = QualitativePerformance.Perfect;
    } else if (rayOfFrostDetails.hits >= 4 && rayOfFrostDetails.shatteredHits >= 4) {
      performance = QualitativePerformance.Good;
    } else if (rayOfFrostDetails.hits >= 4 && rayOfFrostDetails.shatteredHits >= 2) {
      performance = QualitativePerformance.Ok;
    }
    const tooltip = (
      <>
        <PerformanceMark perf={performance} /> {performance}: {count}
      </>
    );
    this.castEntries.push({ value: performance, tooltip });
  }

  get badCasts() {
    return this.rayOfFrost.filter((r) => r.shatteredHits < 2 || r.hits < 4).length;
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

  suggestions(when: When) {
    when(this.rayOfFrostUtilizationThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You failed to get the most out of your{' '}
          <SpellLink spell={TALENTS_MAGE.RAY_OF_FROST_TALENT} /> casts {this.badCasts} times.
          Because the ticks from <SpellLink spell={TALENTS_MAGE.RAY_OF_FROST_TALENT} /> do not
          remove your stacks of <SpellLink spell={SPELLS.WINTERS_CHILL} />, you should always cast{' '}
          <SpellLink spell={TALENTS_MAGE.RAY_OF_FROST_TALENT} /> during{' '}
          <SpellLink spell={SPELLS.WINTERS_CHILL} />. However, because{' '}
          <SpellLink spell={SPELLS.WINTERS_CHILL} /> has such a short duration and therefore will
          likely naturally end before <SpellLink spell={TALENTS_MAGE.RAY_OF_FROST_TALENT} />{' '}
          finishes, you should spend your first stack of <SpellLink spell={SPELLS.WINTERS_CHILL} />{' '}
          and then cast <SpellLink spell={TALENTS_MAGE.RAY_OF_FROST_TALENT} /> instead of spending
          the 2nd stack.
        </>,
      )
        .icon(TALENTS_MAGE.RAY_OF_FROST_TALENT.icon)
        .actual(`${formatPercentage(actual)}% Utilization`)
        .recommended(`${formatPercentage(recommended)}% is recommended`),
    );
  }

  get guideSubsection(): JSX.Element {
    const rayOfFrost = <SpellLink spell={TALENTS_MAGE.RAY_OF_FROST_TALENT} />;

    const wintersChill = <SpellLink spell={SPELLS.WINTERS_CHILL} />;

    const cometStorm = <SpellLink spell={TALENTS_MAGE.COMET_STORM_TALENT} />;
    const glacialAssault = <SpellLink spell={TALENTS_MAGE.GLACIAL_ASSAULT_TALENT} />;

    const frostbolt = <SpellLink spell={SPELLS.FROSTBOLT} />;
    const icelance = <SpellLink spell={SPELLS.ICE_LANCE_DAMAGE} />;
    const glacialSpike = <SpellLink spell={TALENTS_MAGE.GLACIAL_SPIKE_TALENT} />;

    const icicles = <SpellLink spell={SPELLS.MASTERY_ICICLES} />;

    const glacialAssaultKnown = this.selectedCombatant.hasTalent(
      TALENTS_MAGE.GLACIAL_ASSAULT_TALENT,
    );
    const explanation = (
      <>
        <p>
          <b>{rayOfFrost}</b> is one of the higher damage per cast spell. You want to cast it as
          soon as possible, but there are some rules to follow in order to get the most out of it.
        </p>
        <ol>
          <li>Don't miss ticks</li>
          {glacialAssaultKnown && (
            <li>
              Use it after {cometStorm} (to benefit from {glacialAssault})
            </li>
          )}
          <li>
            Use it in 2nd {wintersChill}'s stack <small>This is to optimaze {wintersChill}</small>
          </li>
        </ol>
        <p>
          To met <b>all the conditions</b> your {rayOfFrost} rotation should look like this:
          <SpellSeq
            spells={[
              SPELLS.FROSTBOLT,
              TALENTS_MAGE.FLURRY_TALENT,
              TALENTS_MAGE.COMET_STORM_TALENT,
              SPELLS.ICE_LANCE_DAMAGE,
              TALENTS_MAGE.RAY_OF_FROST_TALENT,
            ]}
          />
        </p>
        <small>
          (note that {frostbolt} and {icelance} could be replaced with {glacialSpike} if you have
          enough {icicles}).
        </small>
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
            blue (perfect) / green (good) / yellow (ok) / red (fail) mouseover the rectangles to see
            more details
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
        spellId={TALENTS_MAGE.RAY_OF_FROST_TALENT.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        minimizeIcons
        slimLines
        useThresholds
      />
    );
  }
}

export default RayOfFrost;
