import { Trans } from '@lingui/macro';
import { MS_BUFFER_250 } from 'analysis/retail/mage';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  RemoveBuffEvent,
  DamageEvent,
} from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import EventHistory from 'parser/shared/modules/EventHistory';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

const DAMAGE_BONUS = [
  0,
  0.09,
  0.099,
  0.108,
  0.117,
  0.126,
  0.135,
  0.144,
  0.153,
  0.162,
  0.171,
  0.18,
  0.189,
  0.198,
  0.207,
  0.216,
];
const MAX_STACKS = 2;

class InfernalCascade extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    eventHistory: EventHistory,
  };
  protected abilityTracker!: AbilityTracker;
  protected eventHistory!: EventHistory;

  conduitRank = 0;
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
    this.active = this.selectedCombatant.hasConduitBySpellID(SPELLS.INFERNAL_CASCADE.id);
    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.INFERNAL_CASCADE.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.INFERNAL_CASCADE_BUFF),
      this.onBuffStack,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.COMBUSTION),
      this.onCombustionApplied,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.INFERNAL_CASCADE_BUFF),
      this.onBuffStack,
    );
    this.addEventListener(
      Events.removebuff
        .by(SELECTED_PLAYER)
        .spell([SPELLS.INFERNAL_CASCADE_BUFF, SPELLS.COMBUSTION]),
      this.onBuffRemoved,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.COMBUSTION),
      this.onCombustionRemoved,
    );
  }

  onDamage(event: DamageEvent) {
    const buff = this.selectedCombatant.getBuff(SPELLS.INFERNAL_CASCADE_BUFF.id);
    if (!buff || !this.selectedCombatant.hasBuff(SPELLS.COMBUSTION.id)) {
      return;
    }
    this.bonusDamage += calculateEffectiveDamage(
      event,
      DAMAGE_BONUS[this.conduitRank] * buff.stacks,
    );
  }

  onBuffStack(event: ApplyBuffEvent | ApplyBuffStackEvent) {
    const buff = this.selectedCombatant.getBuff(SPELLS.INFERNAL_CASCADE_BUFF.id);
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
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.COMBUSTION),
    );
    if (
      this.selectedCombatant.hasBuff(SPELLS.COMBUSTION.id, event.timestamp - 10) ||
      lastCombustEnd.length > 0
    ) {
      return;
    }

    const lastCombustStart = this.eventHistory.last(
      1,
      MS_BUFFER_250,
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.COMBUSTION),
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
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.COMBUSTION),
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
      this.maxStackDuration / 1000 / this.abilityTracker.getAbility(SPELLS.COMBUSTION.id).casts
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
          of your <SpellLink id={SPELLS.COMBUSTION.id} /> as possible. This can be done by
          alternating between using <SpellLink id={SPELLS.FIRE_BLAST.id} /> and{' '}
          <SpellLink id={SPELLS.PHOENIX_FLAMES.id} /> to generate{' '}
          <SpellLink id={SPELLS.HOT_STREAK.id} /> instead of using all the charges of one, and then
          all the charges of the other. <SpellLink id={SPELLS.COMBUSTION.id} />s that were proc'd by{' '}
          <SpellLink id={SPELLS.SUN_KINGS_BLESSING.id} /> are not included in this, unless you used
          the proc to extend an existing <SpellLink id={SPELLS.COMBUSTION.id} />.
        </>,
      )
        .icon(SPELLS.INFERNAL_CASCADE.icon)
        .actual(
          <Trans id="mage.fire.suggestions.infernalCascade.maxStackPercent">
            {formatPercentage(actual)}% utilization
          </Trans>,
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.COVENANTS} size="flexible">
        <ConduitSpellText spellId={SPELLS.INFERNAL_CASCADE.id} rank={this.conduitRank}>
          <ItemDamageDone amount={this.bonusDamage} />
          <br />
          {formatPercentage(this.maxStackPercent)}% <small>Uptime at Max Stacks</small>
          <br />
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default InfernalCascade;
