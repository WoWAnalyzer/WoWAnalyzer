import { Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, { ApplyBuffEvent, ApplyBuffStackEvent, RemoveBuffEvent } from 'parser/core/Events';
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

  bonusDamage = 0;
  buffStack = 0;
  maxStackTimestamp = 0;
  maxStackDuration = 0;
  totalBuffs = 0;
  combustionCount = 0;
  totalCombustionDuration = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.FEEL_THE_BURN_TALENT);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.FEEL_THE_BURN_BUFF),
      this.onBuffStack,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.FEEL_THE_BURN_BUFF),
      this.onBuffStack,
    );
    this.addEventListener(
      Events.removebuff
        .by(SELECTED_PLAYER)
        .spell([SPELLS.FEEL_THE_BURN_BUFF, TALENTS.COMBUSTION_TALENT]),
      this.onBuffRemoved,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS.COMBUSTION_TALENT),
      this.onCombustionRemoved,
    );
  }

  onBuffStack(event: ApplyBuffEvent | ApplyBuffStackEvent) {
    const buff = this.selectedCombatant.getBuff(SPELLS.FEEL_THE_BURN_BUFF.id);
    if (buff && buff.stacks > this.buffStack) {
      this.buffStack = buff.stacks;
      this.maxStackTimestamp = this.buffStack === MAX_STACKS ? event.timestamp : 0;
    }
  }

  onCombustionRemoved(event: RemoveBuffEvent) {
    const lastCombustStart = this.eventHistory.last(
      1,
      undefined,
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS.COMBUSTION_TALENT),
    );
    this.totalCombustionDuration +=
      event.timestamp - (lastCombustStart[0]?.timestamp ?? this.owner.fight.start_time);
  }

  onBuffRemoved(event: RemoveBuffEvent) {
    //If Feel the Burn was not at max stacks, then disregard
    if (this.buffStack !== MAX_STACKS) {
      return;
    }

    this.maxStackDuration += event.timestamp - this.maxStackTimestamp;
    this.maxStackTimestamp = 0;
    this.buffStack = 0;
  }

  get averageDuration() {
    return (
      this.maxStackDuration /
      1000 /
      this.abilityTracker.getAbility(TALENTS.COMBUSTION_TALENT.id).casts
    );
  }

  get maxStackPercent() {
    return this.maxStackDuration / this.totalCombustionDuration;
  }

  get downtimeSeconds() {
    return (this.totalCombustionDuration - this.maxStackDuration) / 1000;
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
          Your <SpellLink id={TALENTS.FEEL_THE_BURN_TALENT.id} /> buff was at {MAX_STACKS} stacks
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
