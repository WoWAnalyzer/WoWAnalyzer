import { Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { EventType } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import EventHistory from 'parser/shared/modules/EventHistory';

const MAX_STACKS = 3;

class FeelTheBurn extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    eventHistory: EventHistory,
  };
  protected abilityTracker!: AbilityTracker;
  protected eventHistory!: EventHistory;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.FEEL_THE_BURN_TALENT);
  }

  maxStackTimestamps = () => {
    const maxStackDurations: { start: number; end: number }[] = [];
    const buffHistory = this.selectedCombatant.getBuffHistory(SPELLS.FEEL_THE_BURN_BUFF.id);
    let index = 0;
    buffHistory.forEach((b) => {
      const maxStack = b.stackHistory.find((s) => s.stacks === MAX_STACKS);
      if (maxStack) {
        maxStackDurations[index] = {
          start: maxStack.timestamp,
          end: b.end || this.owner.fight.end_time,
        };
        index += 1;
      }
    });
    return maxStackDurations;
  };

  combustionTimestamps = () => {
    const combustionDurations: { start: number; end: number }[] = [];
    const combustionStarts = this.eventHistory.getEvents(EventType.ApplyBuff, {
      spell: TALENTS.COMBUSTION_TALENT,
    });
    let index = 0;
    combustionStarts.forEach((c) => {
      const endTimestamp = this.eventHistory.getEvents(EventType.RemoveBuff, {
        searchBackwards: false,
        spell: TALENTS.COMBUSTION_TALENT,
        startTimestamp: c.timestamp,
        count: 1,
      })[0];
      combustionDurations[index] = {
        start: c.timestamp,
        end: endTimestamp ? endTimestamp.timestamp : this.owner.fight.end_time,
      };
      index += 1;
    });
    return combustionDurations;
  };

  totalCombustionDuration = () => {
    let totalDuration = 0;
    this.combustionTimestamps().forEach((c) => (totalDuration += c.end - c.start));
    return totalDuration;
  };

  //prettier-ignore
  maxStacksDuration = () => {
    let duration = 0;
    this.maxStackTimestamps().forEach((s) => {
      //If Combustion started while Feel the Burn was at max stacks
      //Count duration from Combustion Start until Combustion End or Feel the Burn End, whichever is sooner.
      if (this.combustionTimestamps().filter(c => c.start >= s.start && c.start <= s.end)) {
        const combustions = this.combustionTimestamps().filter(c => c.start >= s.start && c.start <= s.end) || { start: 0, end: 0};
        combustions.forEach(c => duration += Math.min(c.end, s.end) - c.start);
      }

      //If Combustion was already running when Feel the Burn reached max stacks
      //Count duration from Feel the Burn Start until Combustion End or Feel the Burn End, whichever is sooner
      if (this.combustionTimestamps().filter(c => s.start >= c.start && s.start <= c.end)) {
        const combustions = this.combustionTimestamps().filter(c => s.start >= c.start && s.start <= c.end) || { start: 0, end: 0};
        combustions.forEach(c => duration += Math.min(c.end, s.end) - s.start);
      }
    })
    return duration;
  }

  get averageDuration() {
    return (
      this.maxStacksDuration() /
      1000 /
      this.abilityTracker.getAbility(TALENTS.COMBUSTION_TALENT.id).casts
    );
  }

  get maxStackPercent() {
    return this.maxStacksDuration() / this.totalCombustionDuration();
  }

  get downtimeSeconds() {
    return this.totalCombustionDuration() - this.maxStacksDuration() / 1000;
  }

  get maxStackUptimeThresholds() {
    return {
      actual: this.maxStackPercent,
      isLessThan: {
        minor: 0.8,
        average: 0.7,
        major: 0.6,
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
          {MAX_STACKS} stacks of <SpellLink id={TALENTS.FEEL_THE_BURN_TALENT.id} /> for as much of
          your <SpellLink id={TALENTS.COMBUSTION_TALENT.id} /> as possible. Casting{' '}
          <SpellLink id={SPELLS.FIRE_BLAST.id} /> or{' '}
          <SpellLink id={TALENTS.PHOENIX_FLAMES_TALENT.id} /> will give you stacks of{' '}
          <SpellLink id={SPELLS.FEEL_THE_BURN_BUFF.id} />, so just avoid running out of charges of
          those spells or long gaps without casting one of those spells during{' '}
          <SpellLink id={TALENTS.COMBUSTION_TALENT.id} />. Additionally, if you are chaining{' '}
          <SpellLink id={TALENTS.COMBUSTION_TALENT.id} /> into{' '}
          <SpellLink id={TALENTS.SUN_KINGS_BLESSING_TALENT.id} />, make sure you have adequate
          charges to bridge your buff stacks from one{' '}
          <SpellLink id={TALENTS.COMBUSTION_TALENT.id} /> to the other.
        </>,
      )
        .icon(TALENTS.FEEL_THE_BURN_TALENT.icon)
        .actual(
          <Trans id="mage.fire.suggestions.feelTheBurn.maxStackPercent">
            {formatPercentage(actual)}% utilization
          </Trans>,
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default FeelTheBurn;
