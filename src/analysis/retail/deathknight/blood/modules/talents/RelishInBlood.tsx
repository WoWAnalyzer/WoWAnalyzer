import { defineMessage, Trans } from '@lingui/macro';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/deathknight';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ResourceChangeEvent, HealEvent } from 'parser/core/Events';
import { NumberThreshold, ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class RelishInBlood extends Analyzer {
  runicPowerGained: number = 0;
  runicPowerWasted: number = 0;
  healing: number = 0;
  overhealing: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.RELISH_IN_BLOOD_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(Events.resourcechange.spell(SPELLS.RELISH_IN_BLOOD), this._relishBuffed);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.RELISH_IN_BLOOD),
      this._onHeal,
    );
  }

  _relishBuffed(event: ResourceChangeEvent) {
    if (event.resourceChangeType !== RESOURCE_TYPES.RUNIC_POWER.id) {
      return;
    }

    this.runicPowerGained += event.resourceChange;
    this.runicPowerWasted += event.waste;
  }

  _onHeal(event: HealEvent) {
    if (event.overheal) {
      this.overhealing += event.overheal;
    }
    this.healing += event.amount + event.absorb;
  }

  get overhealPercentage() {
    return this.overhealing / this.healing;
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
        defineMessage({
          id: 'deathknight.blood.relishInBlood.suggestion.suggestion',
          message: `Avoid being Runic Power capped at all times, you wasted ${this.runicPowerWasted} PR by
          being RP capped`,
        }),
      )
        .icon(TALENTS.RELISH_IN_BLOOD_TALENT.icon)
        .actual(
          defineMessage({
            id: 'deathknight.blood.relishInBlood.suggestion.actual',
            message: `You wasted ${formatPercentage(actual)}% of RP from ${
              TALENTS.RELISH_IN_BLOOD_TALENT.name
            } by being RP capped.`,
          }),
        )
        .recommended(
          defineMessage({
            id: 'deathknight.blood.relishInBlood.suggestion.recommended',
            message: `${formatPercentage(recommended)}% is recommended`,
          }),
        ),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(2)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <Trans id="deathknight.blood.relishInBlood.statistic.tooltip">
            <strong>RP wasted: </strong> {this.runicPowerWasted} (
            {formatPercentage(this.rpWastePercentage)} %)
            <br />
            <strong>Healing: </strong> {formatNumber(this.healing)} <br />
            <strong>Overhealing: </strong> {formatNumber(this.overhealing)} (
            {formatPercentage(this.overhealPercentage)} %) <br />
          </Trans>
        }
      >
        <BoringSpellValueText spell={TALENTS.RELISH_IN_BLOOD_TALENT}>
          <Trans id="deathknight.blood.relishInBlood.statistic">
            {this.runicPowerGained} <small>RP gained</small>
          </Trans>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default RelishInBlood;
