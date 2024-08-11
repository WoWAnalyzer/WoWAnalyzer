import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  FightEndEvent,
  GetRelatedEvent,
} from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

const MAX_STACKS = 3;

class FeelTheBurn extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  protected abilityTracker!: AbilityTracker;

  combustionDurations: { start: number; end: number }[] = [];
  maxStackDurations: { start: number; end: number }[] = [];
  stackUptime: {
    buffStart: number;
    uptime: number;
    uptimePercent: number;
    analysis: BoxRowEntry;
  }[] = [];
  totalDuration = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.FEEL_THE_BURN_TALENT);
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.FEEL_THE_BURN_BUFF),
      this.onBuffStack,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS.COMBUSTION_TALENT),
      this.onCombustion,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onBuffStack(event: ApplyBuffStackEvent) {
    const buff = this.selectedCombatant.getBuff(SPELLS.FEEL_THE_BURN_BUFF.id);
    if (!buff || !buff.stacks || buff.stacks < MAX_STACKS) {
      return;
    }

    const buffRemove = GetRelatedEvent(event, 'BuffRemove');
    this.maxStackDurations.push({
      start: event.timestamp,
      end: buffRemove?.timestamp || this.owner.fight.end_time,
    });
  }

  onCombustion(event: ApplyBuffEvent) {
    const buffRemove = GetRelatedEvent(event, 'BuffRemove');
    this.combustionDurations.push({
      start: event.timestamp,
      end: buffRemove?.timestamp || this.owner.fight.end_time,
    });
  }

  onFightEnd(event: FightEndEvent) {
    this.analyzeStackDurations();
    this.stackUptime.sort((a, b) => a.buffStart - b.buffStart);
  }

  totalCombustionDuration = () => {
    let totalDuration = 0;
    this.combustionDurations.forEach((c) => (totalDuration += c.end - c.start));
    return totalDuration;
  };

  //prettier-ignore
  analyzeStackDurations = () => {
    this.maxStackDurations.forEach((s) => {
      //If Combustion started while Feel the Burn was at max stacks
      //Count duration from Combustion Start until Combustion End or Feel the Burn End, whichever is sooner.
      if (this.combustionDurations.filter(c => c.start >= s.start && c.start <= s.end)) {
        const combustions = this.combustionDurations.filter(c => c.start >= s.start && c.start <= s.end) || { start: 0, end: 0};
        combustions.forEach(c => {
          const uptime = Math.min(c.end, s.end) - c.start;
          const duration = c.end - c.start
          const uptimePercent = uptime / duration;
          if (duration < 7000) {
            //If it is an SKB Combustion by itself, then the duration is too short to reasonably be able to stack FTB.
            //So ignore any combustion buffs that are less than 7 seconds (an extra second is added incase the buff is slightly off)
            return;
          } else {
            this.stackUptime.push({
              buffStart: c.start,
              uptime,
              uptimePercent,
              analysis: {
                value: this.checkPerformance(uptimePercent),
                tooltip: 
                <>
                  Max Stack Uptime {formatPercentage(uptimePercent, 0)}% ({(uptime / 1000).toFixed(2)}s / {formatNumber(duration / 1000)}s)
                </>
              }
            })
          }
          this.totalDuration += uptime;
        })
      }

      //If Combustion was already running when Feel the Burn reached max stacks
      //Count duration from Feel the Burn Start until Combustion End or Feel the Burn End, whichever is sooner
      if (this.combustionDurations.filter(c => s.start >= c.start && s.start <= c.end)) {
        const combustions = this.combustionDurations.filter(c => s.start >= c.start && s.start <= c.end) || { start: 0, end: 0};
        combustions.forEach(c => {
          const uptime = Math.min(c.end, s.end) - s.start;
          const duration = c.end - c.start;
          const uptimePercent = uptime / duration;
          if (duration < 7000) {
            //If it is an SKB Combustion by itself, then the duration is too short to reasonably be able to stack FTB.
            //So ignore any combustion buffs that are less than 7 seconds (an extra second is added incase the buff is slightly off)
            return;
          } else {
            this.stackUptime.push({
              buffStart: c.start,
              uptime,
              uptimePercent,
              analysis: {
                value: this.checkPerformance(uptimePercent),
                tooltip: 
                <>
                  Max Stack Uptime {formatPercentage(uptimePercent, 0)}% ({(uptime / 1000).toFixed(2)}s / {formatNumber(duration / 1000)}s)
                </>
              }
            })
          }
          this.totalDuration += Math.min(c.end, s.end) - s.start;
        })
      }
    })
  }

  checkPerformance(uptimePercent: number) {
    let performance;
    const thresholds = this.maxStackUptimeThresholds.isLessThan;
    if (uptimePercent > thresholds.minor) {
      performance = QualitativePerformance.Perfect;
    } else if (uptimePercent > thresholds.average) {
      performance = QualitativePerformance.Good;
    } else if (uptimePercent > thresholds.major) {
      performance = QualitativePerformance.Ok;
    } else {
      performance = QualitativePerformance.Fail;
    }

    return performance;
  }

  get averageDuration() {
    return (
      this.totalDuration / 1000 / this.abilityTracker.getAbility(TALENTS.COMBUSTION_TALENT.id).casts
    );
  }

  get maxStackPercent() {
    return this.totalDuration / this.totalCombustionDuration();
  }

  get downtimeSeconds() {
    return this.totalCombustionDuration() - this.totalDuration / 1000;
  }

  get maxStackUptimeThresholds() {
    return {
      actual: this.maxStackPercent,
      isLessThan: {
        minor: 0.9,
        average: 0.8,
        major: 0.7,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.maxStackUptimeThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your <SpellLink spell={TALENTS.FEEL_THE_BURN_TALENT} /> buff was at {MAX_STACKS} stacks
          for {formatPercentage(this.maxStackPercent)}% of your Combustion Uptime. Because so much
          of your damage comes from your Combustion, it is important that you build up and maintain{' '}
          {MAX_STACKS} stacks of <SpellLink spell={TALENTS.FEEL_THE_BURN_TALENT.id} /> for as much
          of your <SpellLink spell={TALENTS.COMBUSTION_TALENT.id} /> as possible. Casting{' '}
          <SpellLink spell={SPELLS.FIRE_BLAST.id} /> or{' '}
          <SpellLink spell={TALENTS.PHOENIX_FLAMES_TALENT.id} /> will give you stacks of{' '}
          <SpellLink spell={SPELLS.FEEL_THE_BURN_BUFF.id} />, so just avoid running out of charges
          of those spells or long gaps without casting one of those spells during{' '}
          <SpellLink spell={TALENTS.COMBUSTION_TALENT.id} />. Additionally, if you are chaining{' '}
          <SpellLink spell={TALENTS.COMBUSTION_TALENT.id} /> into{' '}
          <SpellLink spell={TALENTS.SUN_KINGS_BLESSING_TALENT.id} />, make sure you have adequate
          charges to bridge your buff stacks from one{' '}
          <SpellLink spell={TALENTS.COMBUSTION_TALENT.id} /> to the other.
        </>,
      )
        .icon(TALENTS.FEEL_THE_BURN_TALENT.icon)
        .actual(`${formatPercentage(actual)}% utilization`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            Feel the Burn increases your mastery for 5 seconds each time Phoenix Flames and Fire
            Blast does damage, stacking up to 3 times. Since Mastery increases your Ignite damage,
            and Combustion increases your Mastery equal to your Crit ... it is very important to
            keep Feel the Burn at {MAX_STACKS} for as much of your Combustion as possible. This can
            be easily maintained by ensuring you pool charges before Combustion and by weaving
            Scorch in during Combustion periodically if you are in danger of running out of charges
            before Combustion ends.
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.FEEL_THE_BURN_TALENT}>
          <>
            {formatPercentage(this.maxStackPercent, 2)}% <small>Max Stacks during Combust</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FeelTheBurn;
