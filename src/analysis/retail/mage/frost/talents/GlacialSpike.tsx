import { SHATTER_DEBUFFS } from 'analysis/retail/mage/shared';
import TALENTS from 'common/TALENTS/mage';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, FightEndEvent, GetRelatedEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/mage/frost/Guide';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PerformanceMark, qualitativePerformanceToColor } from 'interface/guide';
import { formatNumber, formatPercentage } from 'common/format';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { SpellIcon, SpellLink, TooltipElement } from 'interface';
import WintersChill from 'analysis/retail/mage/frost/core/WintersChill';
import SPELLS from 'common/SPELLS';

class GlacialSpike extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    wintersChill: WintersChill,
  };
  protected enemies!: Enemies;
  protected wintersChill!: WintersChill;
  castEntries: BoxRowEntry[] = [];

  glacialSpike: {
    timestamp: number;
    shattered: boolean;
    damage: DamageEvent | undefined;
    cleave: DamageEvent | undefined;
  }[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.GLACIAL_SPIKE_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.GLACIAL_SPIKE_TALENT),
      this.onGlacialSpikeCast,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onGlacialSpikeCast(event: CastEvent) {
    const damage: DamageEvent | undefined = GetRelatedEvent(event, 'SpellDamage');
    const enemy = damage && this.enemies.getEntity(damage);
    const cleave: DamageEvent | undefined = GetRelatedEvent(event, 'CleaveDamage');
    const glacialSpikeDetails = {
      timestamp: event.timestamp,
      shattered:
        (enemy && SHATTER_DEBUFFS.some((effect) => enemy.hasBuff(effect.id, damage.timestamp))) ||
        false,
      damage: damage,
      cleave: cleave,
    };
    this.glacialSpike.push(glacialSpikeDetails);
  }

  onFightEnd(event: FightEndEvent) {
    this.amendShatters();
    this.analyzeGlacialSpikes();
  }

  amendShatters() {
    this.glacialSpike.forEach((glacialSpike) => {
      if (glacialSpike.shattered !== this.wintersChill.wasShattered(glacialSpike.damage)) {
        glacialSpike.shattered = this.wintersChill.wasShattered(glacialSpike.damage);
      }
    });
  }

  analyzeGlacialSpikes() {
    this.glacialSpike.forEach((glacialSpike) => {
      let performance = QualitativePerformance.Fail;
      const number = glacialSpike.damage?.amount || 0;
      const count = `${formatNumber(number)}`;
      if (glacialSpike.shattered) {
        performance = QualitativePerformance.Good;
      }
      const tooltip = (
        <>
          <div>
            <b>@ {this.owner.formatTimestamp(glacialSpike.timestamp)}</b>
          </div>
          <div>
            <PerformanceMark perf={performance} /> {performance}: {count}
          </div>
        </>
      );
      this.castEntries.push({ value: performance, tooltip });
    });
  }

  get performance() {
    let performance = QualitativePerformance.Fail;
    if (this.shatterPercentage > 0.8) {
      performance = QualitativePerformance.Good;
    } else if (this.shatterPercentage > 0.7) {
      performance = QualitativePerformance.Ok;
    }
    return performance;
  }

  get shatterPercentage() {
    return this.shatteredCasts / this.totalCasts;
  }

  get shatteredCasts() {
    return this.glacialSpike.filter((gs) => gs.shattered).length;
  }

  get totalCasts() {
    return this.glacialSpike.length;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            You cast Glacial Spike {this.totalCasts} times, {this.shatteredCasts} casts of which
            were Shattered
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.GLACIAL_SPIKE_TALENT}>
          {this.shatteredCasts} <small>Shattered Casts</small>
          <br />
          {this.totalCasts - this.shatteredCasts} <small>Non-Shattered Casts</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  get guideSubsection(): JSX.Element {
    const glacialSpike = <SpellLink spell={TALENTS.GLACIAL_SPIKE_TALENT} />;
    const flurry = <SpellLink spell={TALENTS.FLURRY_TALENT} />;
    const wintersChill = <SpellLink spell={SPELLS.WINTERS_CHILL} />;

    const glacialSpikeIcon = (
      <SpellIcon spell={TALENTS.GLACIAL_SPIKE_TALENT} style={{ height: '28px' }} />
    );

    const explanation = (
      <p>
        You want to shatter {glacialSpike} as much as you can. Try to use {flurry} as indicated
        above to increase your chances of having a {wintersChill} charge available for{' '}
        {glacialSpike}.
      </p>
    );
    const tooltip = (
      <>
        {this.shatteredCasts}/{this.totalCasts} casts
      </>
    );
    const data = (
      <div>
        <RoundedPanel>
          <div style={{ color: qualitativePerformanceToColor(this.performance), fontSize: '20px' }}>
            {glacialSpikeIcon}{' '}
            <TooltipElement content={tooltip}>
              {formatPercentage(this.shatterPercentage, 0)} % <small>shattered</small>
            </TooltipElement>
          </div>
          <strong>{glacialSpike} cast details</strong>
          <PerformanceBoxRow values={this.castEntries} />
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(
      explanation,
      data,
      GUIDE_CORE_EXPLANATION_PERCENT,
      'Glacial Spike',
    );
  }
}

export default GlacialSpike;
