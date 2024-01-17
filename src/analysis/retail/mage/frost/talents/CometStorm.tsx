import { COMET_STORM_AOE_MIN_TARGETS, SHATTER_DEBUFFS } from 'analysis/retail/mage/shared';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS, { TALENTS_MAGE } from 'common/TALENTS/mage';
import { SpellIcon, SpellLink } from 'interface';
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
import styled from '@emotion/styled';

const SequenceContainer = styled.div`
  display: inline-flex;
  flex-direction: row;
  flex-wrap: nowrap;
  height: 24px;

  & svg {
    transform: rotate(-90deg);
    height: 18px;
    margin-top: calc(24px / 2 - 18px / 2);
  }

  & img.icon {
    height: 24px;
  }
`;

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
    let message = `Fail ${count}`;
    if (enemies.length === 1) {
      if (cometStormDetails.shatteredHits >= 7) {
        performance = QualitativePerformance.Perfect;
        message = `Perfect: ${count}`;
      } else if (cometStormDetails.shatteredHits >= 6) {
        performance = QualitativePerformance.Good;
        message = `Good: ${count}`;
      } else if (cometStormDetails.shatteredHits >= 4) {
        performance = QualitativePerformance.Ok;
        message = `Ok: ${count}`;
      }
    }
    if (enemies.length >= COMET_STORM_AOE_MIN_TARGETS) {
      performance = QualitativePerformance.Perfect;
      message = `Perfect: ${count}`;
    }

    const tooltip = <>{message}</>;
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
    const cometStorm = <SpellLink spell={TALENTS_MAGE.COMET_STORM_TALENT} />;
    const coldestSnap = <SpellLink spell={TALENTS_MAGE.COLDEST_SNAP_TALENT} />;
    const wintersChill = <SpellLink spell={SPELLS.WINTERS_CHILL} />;
    const flurry = <SpellLink spell={TALENTS.FLURRY_TALENT} />;
    const glacialSpike = <SpellLink spell={TALENTS_MAGE.GLACIAL_SPIKE_TALENT} />;
    const rayOfFrost = <SpellLink spell={TALENTS_MAGE.RAY_OF_FROST_TALENT} />;
    const coneOfCold = <SpellLink spell={SPELLS.CONE_OF_COLD} />;

    const flurryIcon = <SpellIcon spell={TALENTS.FLURRY_TALENT} />;
    const cometStormIcon = <SpellIcon spell={TALENTS_MAGE.COMET_STORM_TALENT} />;
    const iceLanceIcon = <SpellIcon spell={SPELLS.ICE_LANCE_DAMAGE} />;
    const rayOfFrostIcon = <SpellIcon spell={TALENTS_MAGE.RAY_OF_FROST_TALENT} />;
    const glacialSpikeIcon = <SpellIcon spell={TALENTS_MAGE.GLACIAL_SPIKE_TALENT} />;
    const wintersChillIcon = <SpellIcon spell={SPELLS.WINTERS_CHILL} />;
    const coneOfColdIcon = <SpellIcon spell={SPELLS.CONE_OF_COLD} />;

    const explanation = (
      <>
        <p>
          <b>{cometStorm}</b> is another important spell. You want to keep it on cd as much as you
          can.
          <p>This spell has different modes of use for single and multitarget.</p>
          <p>
            <b>Single Target</b>
            <br />
            You should ensure that all the comets benefit from {wintersChill}.<br />
            The easiest way to acomplish this is to cast {cometStorm} just after {flurry}, while the
            enemy has 2 stacks of {wintersChill}.<br />
            <SequenceContainer>
              &emsp; {flurryIcon} &#129106; {cometStormIcon}
            </SequenceContainer>
            <br />
            <small>
              If you know that the second {wintersChill}'s stack will be used on a long cast (
              {rayOfFrost} or {glacialSpike}), you can use {cometStorm} before the long cast too.
              <br />
              <SequenceContainer>
                &emsp; {flurryIcon} &#129106; [2{wintersChillIcon}] &#129106; {iceLanceIcon}
                &#129106; [1{wintersChillIcon}] &#129106; {cometStormIcon} &#129106; (
                {rayOfFrostIcon}
                or {glacialSpikeIcon})
              </SequenceContainer>
              <br />
            </small>
          </p>
          <p>
            <b>2 targets</b> or <b>3+ targets without {coldestSnap}</b>
            <br />
            Should be casted as soon as possible.
          </p>
          <p>
            <b>3+ targets with {coldestSnap}</b>
            <br />
            If {coneOfCold} is available, you should cast it before and after {coneOfCold}. Te
            comets of the first cast will land after {coneOfCold}, and therefore both
            {cometStorm} casts will benefit from {wintersChill}.<br />
            <SequenceContainer>
              &emsp; {cometStormIcon} &#129106; {coneOfColdIcon} &#129106; {cometStormIcon}
            </SequenceContainer>
            <br />
            If {coneOfCold} is less than 10 seconds CD, you should wait for the combo. Otherwise
            just cast it.
          </p>
        </p>
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
        spellId={TALENTS_MAGE.COMET_STORM_TALENT.id}
        gapHighlightMode={GapHighlight.FullCooldown}
        minimizeIcons
        slimLines
        useThresholds
      />
    );
  }
}

export default CometStorm;
