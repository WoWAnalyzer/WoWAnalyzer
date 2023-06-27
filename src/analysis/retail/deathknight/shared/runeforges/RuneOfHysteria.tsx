import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/deathknight';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SPECS from 'game/SPECS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events, { ResourceChangeEvent } from 'parser/core/Events';
import { NumberThreshold, ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const RP_BUFF_BY_HYSTERIA = 0.2;
const DEATH_STRIKE_COST = 45;

// Energize Events are not floats, making it difficult to track the exact amount of RP gained by Hysteria
// But Energize Events round up if the RP gained was eg. 0.4 and the player had 50.7 RP
// Tracking total RP gained during Hysteria and multiplying it by .2 works for now because fractions add up
// this becomes inaccurate if other spells generate fractions of RP

class RuneOfHysteria extends Analyzer {
  runicPowerGained: number = 0;
  runicPowerWasted: number = 0;

  constructor(options: Options) {
    super(options);

    const active = this.selectedCombatant.hasWeaponEnchant(SPELLS.RUNE_OF_HYSTERIA);
    this.active = active;
    if (!active) {
      return;
    }

    this.addEventListener(Events.resourcechange, this._onEnergize);
  }

  _onEnergize(event: ResourceChangeEvent) {
    const hysteriaUp = this.selectedCombatant.hasBuff(
      SPELLS.RUNE_OF_HYSTERIA_BUFF.id,
      event.timestamp,
    );
    if (!hysteriaUp || event.resourceChangeType !== RESOURCE_TYPES.RUNIC_POWER.id) {
      return;
    }

    this.runicPowerGained += event.resourceChange;
    this.runicPowerWasted += event.waste;
  }

  get runicPowerGainedByHysteria() {
    return this.runicPowerGained * RP_BUFF_BY_HYSTERIA;
  }

  get runicPowerWastedDuringHysteria() {
    return this.runicPowerWasted * RP_BUFF_BY_HYSTERIA;
  }

  get potentialRunicPowerGainedByHysteria() {
    return this.runicPowerGainedByHysteria + this.runicPowerWastedDuringHysteria;
  }

  get wastedPercentage() {
    return this.runicPowerWastedDuringHysteria / this.runicPowerGainedByHysteria;
  }

  get potentiallyGainedDeathStrikes() {
    return Math.floor(this.potentialRunicPowerGainedByHysteria / DEATH_STRIKE_COST);
  }

  get gainedDeathStrikes() {
    return Math.floor(this.runicPowerGainedByHysteria / DEATH_STRIKE_COST);
  }

  get wastedDeathStrikes() {
    return this.potentiallyGainedDeathStrikes - this.gainedDeathStrikes;
  }

  get efficiencySuggestionThresholds(): NumberThreshold {
    return {
      actual: this.wastedPercentage,
      isGreaterThan: {
        minor: 0,
        average: 0.2,
        major: 0.4,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.efficiencySuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Avoid being Runic Power capped at all times, while capped you wasted{' '}
          {this.runicPowerWastedDuringHysteria} RP from {SPELLS.RUNE_OF_HYSTERIA.name}
        </>,
      )
        .icon(SPELLS.RUNE_OF_HYSTERIA.icon)
        .actual(
          <>
            You wasted {formatPercentage(actual)}% of RP from {SPELLS.RUNE_OF_HYSTERIA.name} by
            being RP capped
          </>,
        )
        .recommended(<>{formatPercentage(recommended)}% is recommended</>),
    );
  }

  statistic() {
    let gainedSpell = '';
    let wastedSpell = '';

    if (this.selectedCombatant.spec === SPECS.BLOOD_DEATH_KNIGHT) {
      gainedSpell = `, resulting in ${this.gainedDeathStrikes} additional ${talents.DEATH_STRIKE_TALENT.name}`;
      wastedSpell = `, losing out on ${this.wastedDeathStrikes} ${talents.DEATH_STRIKE_TALENT.name}`;
    }

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(2)}
        size="flexible"
        tooltip={
          <>
            You gained {Math.floor(this.runicPowerGainedByHysteria)} RP by using{' '}
            {SPELLS.RUNE_OF_HYSTERIA.name}
            {gainedSpell}.<br />
            {this.runicPowerGainedByHysteria > 1 &&
              `You wasted ${this.runicPowerWastedDuringHysteria} RP (
              ${formatPercentage(this.wastedPercentage)} %) from Hysteria by being RP capped
              ${wastedSpell}.`}
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.RUNE_OF_HYSTERIA}>
          <>
            {Math.floor(this.runicPowerGainedByHysteria)} <small>RP gained</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default RuneOfHysteria;
