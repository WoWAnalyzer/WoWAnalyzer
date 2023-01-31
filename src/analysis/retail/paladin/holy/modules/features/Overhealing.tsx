import { Trans, t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import AbilityTracker, { TrackedAbility } from 'parser/shared/modules/AbilityTracker';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';

class Overhealing extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    healingDone: HealingDone,
  };

  protected abilityTracker!: AbilityTracker;

  divinePurposeActive = this.selectedCombatant.hasTalent(TALENTS.DIVINE_PURPOSE_TALENT);

  getRawHealing(ability: TrackedAbility) {
    return ability.healingEffective + ability.healingAbsorbed + ability.healingOverheal;
  }
  getOverhealingPercentage(spellId: number) {
    const ability = this.abilityTracker.getAbility(spellId);
    return ability.healingOverheal / this.getRawHealing(ability);
  }

  get lightOfDawnOverhealing() {
    return this.getOverhealingPercentage(SPELLS.LIGHT_OF_DAWN_HEAL.id);
  }
  get lightOfDawnSuggestionThresholds() {
    const base = this.divinePurposeActive ? 0.45 : 0.4;
    return {
      actual: this.lightOfDawnOverhealing,
      isGreaterThan: {
        minor: base,
        average: base + 0.1,
        major: base + 0.2,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
  get holyShockOverhealing() {
    return this.getOverhealingPercentage(SPELLS.HOLY_SHOCK_HEAL.id);
  }
  get holyShockSuggestionThresholds() {
    const base = this.divinePurposeActive ? 0.4 : 0.35;
    return {
      actual: this.holyShockOverhealing,
      isGreaterThan: {
        minor: base,
        average: base + 0.1,
        major: base + 0.2,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
  get flashOfLightOverhealing() {
    return this.getOverhealingPercentage(SPELLS.FLASH_OF_LIGHT.id);
  }
  get flashOfLightSuggestionThresholds() {
    return {
      actual: this.flashOfLightOverhealing,
      isGreaterThan: {
        minor: 0.25,
        average: 0.4,
        major: 0.5,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
  get bestowFaithOverhealing() {
    return this.getOverhealingPercentage(TALENTS.BESTOW_FAITH_TALENT.id);
  }
  get bestowFaithSuggestionThresholds() {
    return {
      actual: this.bestowFaithOverhealing,
      isGreaterThan: {
        minor: 0.4,
        average: 0.5,
        major: 0.6,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.lightOfDawnSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <Trans id="paladin.holy.modules.overhealing.lightOfDawnSuggestion">
          Try to avoid overhealing with <SpellLink id={TALENTS.LIGHT_OF_DAWN_TALENT} />. Save it for
          when people are missing health.
        </Trans>,
      )
        .icon(TALENTS.LIGHT_OF_DAWN_TALENT.icon)
        .actual(
          t({
            id: 'paladin.holy.modules.overhealing.lightOfDawnSuggestion.actual',
            message: `${formatPercentage(actual)}% overhealing`,
          }),
        )
        .recommended(
          t({
            id: 'paladin.holy.modules.overhealing.lightOfDawnSuggestion.recommended',
            message: `<${formatPercentage(recommended)}% is recommended`,
          }),
        ),
    );

    when(this.holyShockSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <Trans id="paladin.holy.modules.overhealing.holyShockSuggestion">
          Try to avoid overhealing with <SpellLink id={TALENTS.HOLY_SHOCK_TALENT} />. Save it for
          when people are missing health.
        </Trans>,
      )
        .icon(SPELLS.HOLY_SHOCK_HEAL.icon)
        .actual(
          t({
            id: 'paladin.holy.modules.overhealing.holyShockSuggestion.actual',
            message: `${formatPercentage(actual)}% overhealing`,
          }),
        )
        .recommended(
          t({
            id: 'paladin.holy.modules.overhealing.holyShockSuggestion.recommended',
            message: `<${formatPercentage(recommended)}% is recommended`,
          }),
        ),
    );

    when(this.flashOfLightSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <Trans id="paladin.holy.modules.overhealing.flashOfLightSuggestion">
          Try to avoid overhealing with <SpellLink id={SPELLS.FLASH_OF_LIGHT} />. If Flash of Light
          would overheal it is generally advisable to cast a{' '}
          <SpellLink id={TALENTS.HOLY_LIGHT_TALENT} /> instead.
        </Trans>,
      )
        .icon(SPELLS.FLASH_OF_LIGHT.icon)
        .actual(
          t({
            id: 'paladin.holy.modules.overhealing.flashOfLightSuggestion.actual',
            message: `${formatPercentage(actual)}% overhealing`,
          }),
        )
        .recommended(
          t({
            id: 'paladin.holy.modules.overhealing.flashOfLightSuggestion.recommended',
            message: `<${formatPercentage(recommended)}% is recommended`,
          }),
        ),
    );

    when(this.bestowFaithSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <Trans id="paladin.holy.modules.overhealing.bestowFaithSuggestion">
          Try to avoid overhealing with <SpellLink id={TALENTS.BESTOW_FAITH_TALENT} />. Cast it just
          before someone is about to take damage and consider casting it on targets other than
          tanks.
        </Trans>,
      )
        .icon(TALENTS.BESTOW_FAITH_TALENT.icon)
        .actual(
          t({
            id: 'paladin.holy.modules.overhealing.bestowFaithSuggestion.actual',
            message: `${formatPercentage(actual)}% overhealing`,
          }),
        )
        .recommended(
          t({
            id: 'paladin.holy.modules.overhealing.bestowFaithSuggestion.recommended',
            message: `<${formatPercentage(recommended)}% is recommended`,
          }),
        ),
    );
  }
}

export default Overhealing;
