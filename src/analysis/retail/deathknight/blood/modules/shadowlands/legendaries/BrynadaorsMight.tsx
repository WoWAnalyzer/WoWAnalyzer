import { t, Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ResourceChangeEvent } from 'parser/core/Events';
import { NumberThreshold, ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class BrynadaorsMight extends Analyzer {
  runicPowerGained: number = 0;
  runicPowerWasted: number = 0;

  brynadaorsTriggered: number = 0;
  deathStriked: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasLegendary(SPELLS.BRYNDAORS_MIGHT);

    if (!this.active) {
      return;
    }

    this.addEventListener(Events.resourcechange, this._onEnergize);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(talents.DEATH_STRIKE_TALENT_HEAL),
      this._onHeal,
    );
  }

  _onEnergize(event: ResourceChangeEvent) {
    if (
      event.resourceChangeType !== RESOURCE_TYPES.RUNIC_POWER.id ||
      event.ability.guid !== SPELLS.BRYNDAORS_MIGHT_RUNIC_POWER_GAIN.id
    ) {
      return;
    }

    this.runicPowerGained += event.resourceChange;
    this.runicPowerWasted += event.waste;
    this.brynadaorsTriggered += 1;
  }

  _onHeal() {
    this.deathStriked += 1;
  }

  get brynadaorsNotTriggered() {
    return this.deathStriked - this.brynadaorsTriggered;
  }

  get brynadaorsPercentage() {
    return this.brynadaorsNotTriggered / this.deathStriked;
  }

  get rpWastePercentage() {
    return this.runicPowerWasted / this.runicPowerGained;
  }

  get efficiencySuggestionThresholds(): NumberThreshold {
    return {
      actual: this.rpWastePercentage,
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
        t({
          id: 'deathknight.blood.bryndaorsMight.suggestion.suggestion',
          message: `Avoid being Runic Power capped at all times, you wasted ${this.runicPowerWasted} PR by
          being RP capped`,
        }),
      )
        .icon(SPELLS.BRYNDAORS_MIGHT.icon)
        .actual(
          t({
            id: 'deathknight.blood.bryndaorsMight.suggestion.actual',
            message: `You wasted ${formatPercentage(actual)}% of RP from ${
              SPELLS.BRYNDAORS_MIGHT.name
            } by being RP capped.`,
          }),
        )
        .recommended(
          t({
            id: 'deathknight.blood.bryndaorsMight.suggestion.recommended',
            message: `${formatPercentage(recommended)}% is recommended`,
          }),
        ),
    );
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
        tooltip={
          <Trans id="deathknight.blood.bryndaorsMight.statistic.tooltip">
            <strong>{this.brynadaorsTriggered}</strong> of your {talents.DEATH_STRIKE_TALENT.name}s
            triggered {SPELLS.BRYNDAORS_MIGHT.name} while{' '}
            <strong>
              {this.brynadaorsNotTriggered} ({formatPercentage(this.brynadaorsPercentage)}%) did not
            </strong>
            .<br />
            <strong>RP wasted: </strong> {this.runicPowerWasted} (
            {formatPercentage(this.rpWastePercentage)} %)
          </Trans>
        }
      >
        <BoringSpellValueText spellId={SPELLS.BRYNDAORS_MIGHT.id}>
          <Trans id="deathknight.blood.bryndaorsMight.statistic">
            {this.runicPowerGained} <small>RP gained</small>
          </Trans>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default BrynadaorsMight;
