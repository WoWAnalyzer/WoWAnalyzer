import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import CoreAlwaysBeCastingHealing from 'parser/shared/modules/AlwaysBeCastingHealing';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

import { t } from '@lingui/macro';
import { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { CastEvent, DeathEvent } from 'parser/core/Events';

class AlwaysBeCasting extends CoreAlwaysBeCastingHealing {
  static HEALING_ABILITIES_ON_GCD: number[] = [
    SPELLS.ENVELOPING_MIST.id,
    SPELLS.ESSENCE_FONT.id,
    SPELLS.RENEWING_MIST.id,
    SPELLS.VIVIFY.id,
    SPELLS.REVIVAL.id,
    SPELLS.CHI_BURST_TALENT.id,
    SPELLS.CHI_WAVE_TALENT.id,
    SPELLS.REFRESHING_JADE_WIND_TALENT.id,
    SPELLS.SOOTHING_MIST.id,
    SPELLS.INVOKE_CHI_JI_THE_RED_CRANE_TALENT.id,
    SPELLS.EXPEL_HARM.id,
    SPELLS.INVOKE_YULON_THE_JADE_SERPENT.id,
  ];

  constructor(options: Options) {
    super(options);
    if(this.selectedCombatant.hasTalent(SPELLS.RISING_MIST_TALENT)) {
      AlwaysBeCasting.HEALING_ABILITIES_ON_GCD.push(SPELLS.RISING_SUN_KICK.id);
      AlwaysBeCasting.HEALING_ABILITIES_ON_GCD.push(SPELLS.RISING_SUN_KICK_SECOND.id);
    }
    if(this.selectedCombatant.hasTalent(SPELLS.SONG_OF_CHI_JI_TALENT)) {
      this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.INVOKE_CHI_JI_THE_RED_CRANE_TALENT), this.handleChijiStart);
      this.addEventListener(Events.death.to(SELECTED_PLAYER_PET), this.handleChijiDeath);
    }
    if(this.selectedCombatant.hasLegendaryByBonusID(SPELLS.ANCIENT_TEACHINGS_OF_THE_MONASTERY.bonusID)){
      AlwaysBeCasting.HEALING_ABILITIES_ON_GCD.push(SPELLS.TIGER_PALM.id);
      AlwaysBeCasting.HEALING_ABILITIES_ON_GCD.push(SPELLS.RISING_SUN_KICK.id);
      AlwaysBeCasting.HEALING_ABILITIES_ON_GCD.push(SPELLS.RISING_SUN_KICK_SECOND.id);
      AlwaysBeCasting.HEALING_ABILITIES_ON_GCD.push(SPELLS.BLACKOUT_KICK.id);
    }

  }

  handleChijiStart(event: CastEvent) {
    AlwaysBeCasting.HEALING_ABILITIES_ON_GCD.push(SPELLS.TIGER_PALM.id);
    AlwaysBeCasting.HEALING_ABILITIES_ON_GCD.push(SPELLS.RISING_SUN_KICK.id);
    AlwaysBeCasting.HEALING_ABILITIES_ON_GCD.push(SPELLS.RISING_SUN_KICK_SECOND.id);
    AlwaysBeCasting.HEALING_ABILITIES_ON_GCD.push(SPELLS.BLACKOUT_KICK.id);
  }

  handleChijiDeath(event: DeathEvent) {
    const tpSpot = AlwaysBeCasting.HEALING_ABILITIES_ON_GCD.indexOf(SPELLS.TIGER_PALM.id);
    const rskSpot = AlwaysBeCasting.HEALING_ABILITIES_ON_GCD.indexOf(SPELLS.RISING_SUN_KICK.id);
    const rskTwoSpot = AlwaysBeCasting.HEALING_ABILITIES_ON_GCD.indexOf(SPELLS.RISING_SUN_KICK_SECOND.id);
    const bokSpot = AlwaysBeCasting.HEALING_ABILITIES_ON_GCD.indexOf(SPELLS.BLACKOUT_KICK.id);
    //if tp isn't there then we don't want to mess with this
    if(tpSpot === -1){
      return;
    }
    delete AlwaysBeCasting.HEALING_ABILITIES_ON_GCD[tpSpot];
    delete AlwaysBeCasting.HEALING_ABILITIES_ON_GCD[rskSpot];
    delete AlwaysBeCasting.HEALING_ABILITIES_ON_GCD[rskTwoSpot];
    delete AlwaysBeCasting.HEALING_ABILITIES_ON_GCD[bokSpot];
  }

  get nonHealingTimeSuggestionThresholds() {
    return {
      actual: this.nonHealingTimePercentage,
      isGreaterThan: {
        minor: 0.4,
        average: 0.5,
        major: 0.55,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get downtimeSuggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.4,
        average: 0.55,
        major: 1,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.nonHealingTimePercentage).isGreaterThan(this.nonHealingTimeSuggestionThresholds.isGreaterThan.minor)
      .addSuggestion((suggest, actual, recommended) => suggest('Your non healing time can be improved. Try to reduce the delay between casting spells and try to continue healing when you have to move.')
        .icon('petbattle_health-down')
        .actual(t({
      id: "monk.mistweaver.suggestions.alwaysBeCasting.nonHealing",
      message: `${formatPercentage(actual)}% non healing time`
    }))
        .recommended(`<${formatPercentage(recommended)}% is recommended`)
        .regular(this.nonHealingTimeSuggestionThresholds.isGreaterThan.average).major(this.nonHealingTimeSuggestionThresholds.isGreaterThan.major));
    when(this.downtimePercentage).isGreaterThan(this.downtimeSuggestionThresholds.isGreaterThan.minor)
      .addSuggestion((suggest, actual, recommended) => suggest('Your downtime can be improved. Try to Always Be Casting (ABC); try to reduce the delay between casting spells and when you\'re not healing try to contribute some damage.')
        .icon('spell_mage_altertime')
        .actual(t({
      id: "monk.mistweaver.suggestions.alwaysBeCasting.downtime",
      message: `${formatPercentage(actual)}% downtime`
    }))
        .recommended(`<${formatPercentage(recommended)}% is recommended`)
        .regular(this.downtimeSuggestionThresholds.isGreaterThan.average).major(this.downtimeSuggestionThresholds.isGreaterThan.major));
  }
}

export default AlwaysBeCasting;
