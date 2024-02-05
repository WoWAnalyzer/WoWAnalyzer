import { COMET_STORM_AOE_MIN_TARGETS, SHATTER_DEBUFFS } from 'analysis/retail/mage/shared';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import { highlightInefficientCast } from 'interface/report/Results/Timeline/Casts';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, { CastEvent, DamageEvent, GetRelatedEvents } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/mage/frost/Guide';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { GapHighlight } from 'parser/ui/CooldownBar';
import { PerformanceMark } from 'interface/guide';
import { SpellSeq } from 'parser/ui/SpellSeq';

const MIN_SHATTERED_PROJECTILES_PER_CAST = 4;

class CometStorm extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  cometStorm: { cast: CastEvent; enemiesHit: number[]; shatteredHits: number }[] = [];
  castEntries: BoxRowEntry[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.COMET_STORM_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.COMET_STORM_TALENT),
      this.onCometCast,
    );
  }

  onCometCast(event: CastEvent) {
    const damage: DamageEvent[] | undefined = GetRelatedEvents(event, 'SpellDamage');
    let shattered = 0;
    const enemies: number[] = [];
    damage.forEach((d) => {
      const enemy = this.enemies.getEntity(d);
      if (enemy && !enemies.includes(enemy.guid)) {
        enemies.push(enemy.guid);
      }
      if (enemy && SHATTER_DEBUFFS.some((effect) => enemy.hasBuff(effect.id, d.timestamp))) {
        shattered += 1;
      }
    });

    const cometStormDetails = {
      cast: event,
      enemiesHit: enemies,
      shatteredHits: shattered,
    };
    this.cometStorm.push(cometStormDetails);

    let performance = QualitativePerformance.Fail;
    const count = `${cometStormDetails.shatteredHits} shattered hits / ${cometStormDetails.enemiesHit.length} enemies hitted`;
    if (enemies.length === 1) {
      if (cometStormDetails.shatteredHits >= 7) {
        performance = QualitativePerformance.Perfect;
      } else if (cometStormDetails.shatteredHits >= 6) {
        performance = QualitativePerformance.Good;
      } else if (cometStormDetails.shatteredHits >= 4) {
        performance = QualitativePerformance.Ok;
      }
    }
    if (enemies.length >= COMET_STORM_AOE_MIN_TARGETS) {
      performance = QualitativePerformance.Perfect;
    }

    const tooltip = (
      <>
        <b>@ {this.owner.formatTimestamp(event.timestamp)}</b>
        <p>
          <PerformanceMark perf={performance} /> {performance}: {count}
        </p>
      </>
    );
    this.castEntries.push({ value: performance, tooltip });
  }

  badCasts = () => {
    const badCasts = this.cometStorm.filter(
      (cs) =>
        cs.enemiesHit.length < COMET_STORM_AOE_MIN_TARGETS &&
        cs.shatteredHits < MIN_SHATTERED_PROJECTILES_PER_CAST,
    );

    const tooltip = `This Comet Storm was not shattered and did not hit multiple enemies.`;
    badCasts.forEach((e) => e.cast && highlightInefficientCast(e.cast, tooltip));

    return badCasts.length;
  };

  get totalCasts() {
    return this.cometStorm.length;
  }

  get castUtilization() {
    return 1 - this.badCasts() / this.totalCasts;
  }

  get cometStormUtilizationThresholds() {
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
    when(this.cometStormUtilizationThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You failed to get the most out of your <SpellLink spell={TALENTS.COMET_STORM_TALENT} />{' '}
          casts {this.badCasts} times. Because the projectiles from{' '}
          <SpellLink spell={TALENTS.COMET_STORM_TALENT} /> no longer remove your stacks of{' '}
          <SpellLink spell={SPELLS.WINTERS_CHILL} />, you should always cast{' '}
          <SpellLink spell={TALENTS.COMET_STORM_TALENT} /> immediately after casting{' '}
          <SpellLink spell={TALENTS.FLURRY_TALENT} /> and applying{' '}
          <SpellLink spell={SPELLS.WINTERS_CHILL} />. This way there is time for most/all of the
          comets to hit the target before <SpellLink spell={SPELLS.WINTERS_CHILL} /> expires.
          Alternatively, if <SpellLink spell={TALENTS.COMET_STORM_TALENT} /> will hit at least{' '}
          {COMET_STORM_AOE_MIN_TARGETS} targets, then it is acceptable to use it without{' '}
          <SpellLink spell={TALENTS.SHATTER_TALENT} />/<SpellLink spell={SPELLS.WINTERS_CHILL} />
        </>,
      )
        .icon(TALENTS.COMET_STORM_TALENT.icon)
        .actual(`${formatPercentage(actual)}% Utilization`)
        .recommended(`${formatPercentage(recommended)}% is recommended`),
    );
  }

  get guideSubsection(): JSX.Element {
    const coldestSnapKnown = this.selectedCombatant.hasTalent(TALENTS.COLDEST_SNAP_TALENT);

    const cometStorm = <SpellLink spell={TALENTS.COMET_STORM_TALENT} />;
    const wintersChill = <SpellLink spell={SPELLS.WINTERS_CHILL} />;
    const glacialSpike = <SpellLink spell={TALENTS.GLACIAL_SPIKE_TALENT} />;
    const rayOfFrost = <SpellLink spell={TALENTS.RAY_OF_FROST_TALENT} />;
    const coneOfCold = <SpellLink spell={SPELLS.CONE_OF_COLD} />;

    const multitargetExplanation = (
      <>
        {!coldestSnapKnown && (
          <>
            <li>
              <b>Multitarget</b>
            </li>
            Should be casted as soon as possible.
          </>
        )}
        {coldestSnapKnown && (
          <>
            <li>
              <b>Multitarget (3+)</b>
            </li>
            <p>If {coneOfCold} is available, you should do the combo: </p>
            <SpellSeq
              spells={[TALENTS.COMET_STORM_TALENT, SPELLS.CONE_OF_COLD, TALENTS.COMET_STORM_TALENT]}
            />
            <p>
              If {coneOfCold} is less than 10 seconds cooldown, you should wait for the combo.
              Otherwise, just cast it.
            </p>
          </>
        )}
      </>
    );

    const explanation = (
      <>
        <p>
          <b>{cometStorm}</b> is another important spell. You want to keep it on cooldown as much as
          you can.
        </p>
        <p>This spell has different modes of use for single and multitarget.</p>
        <ul>
          <li>
            <b>Single Target</b>
          </li>
          <p>Most of the time on 2 stacks of {wintersChill}, to shatter all 7 comets. </p>
          <SpellSeq spells={[TALENTS.FLURRY_TALENT, TALENTS.COMET_STORM_TALENT]} />
          <p>
            On 1 stack of {wintersChill}, before a long cast ({rayOfFrost} or {glacialSpike})
          </p>
          <SpellSeq
            spells={[
              TALENTS.FLURRY_TALENT,
              SPELLS.ICE_LANCE_DAMAGE,
              TALENTS.COMET_STORM_TALENT,
              TALENTS.GLACIAL_SPIKE_TALENT,
            ]}
          />
          {multitargetExplanation}
        </ul>
      </>
    );

    const data = (
      <div>
        <RoundedPanel>
          <strong>{cometStorm} cast efficiency</strong>
          <div className="flex-main chart" style={{ padding: 15 }}>
            {this.subStatistic()}
          </div>
          <strong>{cometStorm} cast details</strong>
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
      'Comet Storm',
    );
  }

  /** Guide subsection describing the proper usage of Comet Storm */
  subStatistic() {
    return (
      <CastEfficiencyBar
        spellId={TALENTS.COMET_STORM_TALENT.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        minimizeIcons
        slimLines
        useThresholds
      />
    );
  }
}

export default CometStorm;
