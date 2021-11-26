import { Trans } from '@lingui/macro';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  RemoveBuffEvent,
  DamageEvent,
} from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import React from 'react';

const DAMAGE_BONUS = [
  0, 0.09, 0.099, 0.108, 0.117, 0.126, 0.135, 0.144, 0.153, 0.162, 0.171, 0.18, 0.189, 0.198, 0.207,
  0.216,
];
const MAX_STACKS = 2;

class InfernalCascade extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  protected abilityTracker!: AbilityTracker;

  conduitRank = 0;
  bonusDamage = 0;
  buffStack = 0;
  maxStackTimestamp = 0;
  maxStackDuration = 0;
  totalBuffs = 0;
  combustionCount = 0;

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
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.INFERNAL_CASCADE_BUFF),
      this.onBuffStack,
    );
    this.addEventListener(
      Events.removebuff
        .by(SELECTED_PLAYER)
        .spell([SPELLS.INFERNAL_CASCADE_BUFF, SPELLS.COMBUSTION]),
      this.onBuffRemoved,
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

  onBuffRemoved(event: RemoveBuffEvent) {
    if (this.buffStack !== MAX_STACKS) {
      return;
    }
    this.maxStackDuration += event.timestamp - this.maxStackTimestamp;
    this.maxStackTimestamp = 0;
    this.buffStack = 0;
  }

  get averageDuration() {
    return (
      this.maxStackDuration / 1000 / this.abilityTracker.getAbility(SPELLS.COMBUSTION.id).casts
    );
  }

  get maxStackPercent() {
    return this.maxStackDuration / this.selectedCombatant.getBuffUptime(SPELLS.COMBUSTION.id);
  }

  get downtimeSeconds() {
    return (
      (this.selectedCombatant.getBuffUptime(SPELLS.COMBUSTION.id) - this.maxStackDuration) / 1000
    );
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
          While <SpellLink id={SPELLS.COMBUSTION.id} /> was active, your{' '}
          <SpellLink id={SPELLS.INFERNAL_CASCADE.id} /> buff was at {MAX_STACKS} stacks for{' '}
          {formatNumber(this.averageDuration)}s on average per Combustion (
          {formatPercentage(this.maxStackPercent)}% of your Combustion Uptime). Because so much of
          your damage comes from your Combustion, it is important that you adjust your rotation such
          that you can maintain {MAX_STACKS} stacks of <SpellLink id={SPELLS.INFERNAL_CASCADE.id} />{' '}
          for as much of your <SpellLink id={SPELLS.COMBUSTION.id} /> as possible. This can be done
          by alternating between using <SpellLink id={SPELLS.FIRE_BLAST.id} /> and{' '}
          <SpellLink id={SPELLS.PHOENIX_FLAMES.id} /> to generate{' '}
          <SpellLink id={SPELLS.HOT_STREAK.id} /> instead of using all the charges of one, and then
          all the charges of the other.
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
