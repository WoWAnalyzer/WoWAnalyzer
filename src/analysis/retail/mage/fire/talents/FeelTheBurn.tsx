import { Trans } from '@lingui/macro';
import { MS_BUFFER_250 } from 'analysis/retail/mage/shared';
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
  isSKBCombust = false;
  totalCombustionDuration = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.FEEL_THE_BURN_TALENT);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.FEEL_THE_BURN_BUFF),
      this.onBuffStack,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS.COMBUSTION_TALENT),
      this.onCombustionApplied,
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

  onCombustionApplied(event: ApplyBuffEvent) {
    //If Combustion is already active (i.e. they extended Combustion with SKB), ignore it
    //If Combustion ended within the last 3 seconds (i.e. they triggered SKB with enough time to bridge Infernal Cascade from one Combustion to the other), ignore it
    const lastCombustEnd = this.eventHistory.last(
      1,
      3000,
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS.COMBUSTION_TALENT),
    );
    if (
      this.selectedCombatant.hasBuff(TALENTS.COMBUSTION_TALENT.id, event.timestamp - 10) ||
      lastCombustEnd.length > 0
    ) {
      return;
    }

    const lastCombustStart = this.eventHistory.last(
      1,
      MS_BUFFER_250,
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.COMBUSTION_TALENT),
    );
    if (lastCombustStart.length === 0) {
      this.isSKBCombust = true;
    }
  }

  onCombustionRemoved(event: RemoveBuffEvent) {
    //If the combustion was marked as an SKB Combustion, disregard
    if (this.isSKBCombust) {
      return;
    }
    const lastCombustStart = this.eventHistory.last(
      1,
      undefined,
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS.COMBUSTION_TALENT),
    );
    this.totalCombustionDuration +=
      event.timestamp - (lastCombustStart[0]?.timestamp ?? this.owner.fight.start_time);
  }

  onBuffRemoved(event: RemoveBuffEvent) {
    //If the Combustion was marked as an SKB Combustion or IC was not at max stacks, then disregard
    if (this.buffStack !== MAX_STACKS || this.isSKBCombust) {
      return;
    }

    this.maxStackDuration += event.timestamp - this.maxStackTimestamp;
    this.maxStackTimestamp = 0;
    this.buffStack = 0;
    this.isSKBCombust = false;
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
          Your <SpellLink id={SPELLS.INFERNAL_CASCADE.id} /> buff was at {MAX_STACKS} stacks for{' '}
          {formatPercentage(this.maxStackPercent)}% of your Combustion Uptime. Because so much of
          your damage comes from your Combustion, it is important that you adjust your rotation to
          maintain {MAX_STACKS} stacks of <SpellLink id={SPELLS.INFERNAL_CASCADE.id} /> for as much
          of your <SpellLink id={TALENTS.COMBUSTION_TALENT.id} /> as possible. This can be done by
          alternating between using <SpellLink id={SPELLS.FIRE_BLAST.id} /> and{' '}
          <SpellLink id={TALENTS.PHOENIX_FLAMES_TALENT.id} /> to generate{' '}
          <SpellLink id={SPELLS.HOT_STREAK.id} /> instead of using all the charges of one, and then
          all the charges of the other. <SpellLink id={TALENTS.COMBUSTION_TALENT.id} />s that were
          proc'd by <SpellLink id={SPELLS.SUN_KINGS_BLESSING.id} /> are not included in this, unless
          you used the proc to extend an existing <SpellLink id={TALENTS.COMBUSTION_TALENT.id} />.
        </>,
      )
        .icon(SPELLS.INFERNAL_CASCADE.icon)
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
