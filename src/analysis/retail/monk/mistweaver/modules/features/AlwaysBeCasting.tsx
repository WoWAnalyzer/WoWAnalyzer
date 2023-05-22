import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, {
  BeginChannelEvent,
  CastEvent,
  DeathEvent,
  EndChannelEvent,
  GlobalCooldownEvent,
} from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import CoreAlwaysBeCastingHealing from 'parser/shared/modules/AlwaysBeCastingHealing';

class AlwaysBeCasting extends CoreAlwaysBeCastingHealing {
  HEALING_ABILITIES_ON_GCD: number[] = [
    TALENTS_MONK.ENVELOPING_MIST_TALENT.id,
    TALENTS_MONK.ESSENCE_FONT_TALENT.id,
    TALENTS_MONK.RENEWING_MIST_TALENT.id,
    SPELLS.VIVIFY.id,
    TALENTS_MONK.REVIVAL_TALENT.id,
    TALENTS_MONK.RESTORAL_TALENT.id,
    TALENTS_MONK.CHI_BURST_TALENT.id,
    TALENTS_MONK.CHI_WAVE_TALENT.id,
    TALENTS_MONK.REFRESHING_JADE_WIND_TALENT.id,
    TALENTS_MONK.SOOTHING_MIST_TALENT.id,
    TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT.id,
    SPELLS.EXPEL_HARM.id,
    TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT.id,
    TALENTS_MONK.FAELINE_STOMP_TALENT.id,
    TALENTS_MONK.ZEN_PULSE_TALENT.id,
  ];
  isSooming = false;
  constructor(options: Options) {
    super(options);
    if (this.selectedCombatant.hasTalent(TALENTS_MONK.RISING_MIST_TALENT)) {
      this.HEALING_ABILITIES_ON_GCD.push(TALENTS_MONK.RISING_SUN_KICK_TALENT.id);
      this.HEALING_ABILITIES_ON_GCD.push(SPELLS.RISING_SUN_KICK_DAMAGE.id);
    }
    if (this.selectedCombatant.hasTalent(TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT)) {
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT),
        this.handleChijiStart,
      );
      this.addEventListener(Events.death.to(SELECTED_PLAYER_PET), this.handleChijiDeath);
    }
    if (this.selectedCombatant.hasTalent(TALENTS_MONK.ANCIENT_TEACHINGS_TALENT)) {
      this.HEALING_ABILITIES_ON_GCD.push(SPELLS.TIGER_PALM.id);
      this.HEALING_ABILITIES_ON_GCD.push(TALENTS_MONK.RISING_SUN_KICK_TALENT.id);
      this.HEALING_ABILITIES_ON_GCD.push(SPELLS.RISING_SUN_KICK_DAMAGE.id);
      this.HEALING_ABILITIES_ON_GCD.push(SPELLS.BLACKOUT_KICK.id);
    }
    if (this.selectedCombatant.hasTalent(TALENTS_MONK.AWAKENED_FAELINE_TALENT)) {
      this.HEALING_ABILITIES_ON_GCD.push(SPELLS.SPINNING_CRANE_KICK.id);
      this.HEALING_ABILITIES_ON_GCD.push(SPELLS.SPINNING_CRANE_KICK_DAMAGE.id);
    }
    this.addEventListener(
      Events.BeginChannel.by(SELECTED_PLAYER).spell(TALENTS_MONK.SOOTHING_MIST_TALENT),
      this.onBeginChannel,
    );
  }

  handleChijiStart(event: CastEvent) {
    this.HEALING_ABILITIES_ON_GCD.push(SPELLS.TIGER_PALM.id);
    this.HEALING_ABILITIES_ON_GCD.push(TALENTS_MONK.RISING_SUN_KICK_TALENT.id);
    this.HEALING_ABILITIES_ON_GCD.push(SPELLS.RISING_SUN_KICK_DAMAGE.id);
    this.HEALING_ABILITIES_ON_GCD.push(SPELLS.BLACKOUT_KICK.id);
    this.HEALING_ABILITIES_ON_GCD.push(SPELLS.SPINNING_CRANE_KICK.id);
    this.HEALING_ABILITIES_ON_GCD.push(SPELLS.SPINNING_CRANE_KICK_DAMAGE.id);
  }

  handleChijiDeath(event: DeathEvent) {
    const tpSpot = this.HEALING_ABILITIES_ON_GCD.indexOf(SPELLS.TIGER_PALM.id);
    const rskSpot = this.HEALING_ABILITIES_ON_GCD.indexOf(TALENTS_MONK.RISING_SUN_KICK_TALENT.id);
    const rskTwoSpot = this.HEALING_ABILITIES_ON_GCD.indexOf(SPELLS.RISING_SUN_KICK_DAMAGE.id);
    const bokSpot = this.HEALING_ABILITIES_ON_GCD.indexOf(SPELLS.BLACKOUT_KICK.id);
    const sckSpot = this.HEALING_ABILITIES_ON_GCD.indexOf(SPELLS.SPINNING_CRANE_KICK.id);
    const sckSpotTwo = this.HEALING_ABILITIES_ON_GCD.indexOf(SPELLS.SPINNING_CRANE_KICK_DAMAGE.id);
    //if tp isn't there then we don't want to mess with this
    if (tpSpot === -1) {
      return;
    }
    delete this.HEALING_ABILITIES_ON_GCD[tpSpot];
    delete this.HEALING_ABILITIES_ON_GCD[rskSpot];
    delete this.HEALING_ABILITIES_ON_GCD[rskTwoSpot];
    delete this.HEALING_ABILITIES_ON_GCD[bokSpot];
    if (sckSpot !== -1) {
      delete this.HEALING_ABILITIES_ON_GCD[sckSpot];
      delete this.HEALING_ABILITIES_ON_GCD[sckSpotTwo];
    }
  }

  onGCD(event: GlobalCooldownEvent) {
    if (this.isSooming) {
      return false;
    }
    return super.onGCD(event);
  }

  onBeginChannel(event: BeginChannelEvent) {
    this.isSooming = true;
  }

  onEndChannel(event: EndChannelEvent) {
    // If the channel was shorter than the GCD then use the GCD as active time
    if (this.isSooming && event.ability.guid !== TALENTS_MONK.SOOTHING_MIST_TALENT.id) {
      return false;
    } else if (this.isSooming && event.ability.guid === TALENTS_MONK.SOOTHING_MIST_TALENT.id) {
      this.isSooming = false;
    }
    return super.onEndChannel(event);
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
    when(this.nonHealingTimePercentage)
      .isGreaterThan(this.nonHealingTimeSuggestionThresholds.isGreaterThan.minor)
      .addSuggestion((suggest, actual, recommended) =>
        suggest(
          'Your non healing time can be improved. Try to reduce the delay between casting spells and try to continue healing when you have to move.',
        )
          .icon('petbattle_health-down')
          .actual(
            t({
              id: 'monk.mistweaver.suggestions.alwaysBeCasting.nonHealing',
              message: `${formatPercentage(actual)}% non healing time`,
            }),
          )
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(this.nonHealingTimeSuggestionThresholds.isGreaterThan.average)
          .major(this.nonHealingTimeSuggestionThresholds.isGreaterThan.major),
      );
    when(this.downtimePercentage)
      .isGreaterThan(this.downtimeSuggestionThresholds.isGreaterThan.minor)
      .addSuggestion((suggest, actual, recommended) =>
        suggest(
          "Your downtime can be improved. Try to Always Be Casting (ABC); try to reduce the delay between casting spells and when you're not healing try to contribute some damage.",
        )
          .icon('spell_mage_altertime')
          .actual(
            t({
              id: 'monk.mistweaver.suggestions.alwaysBeCasting.downtime',
              message: `${formatPercentage(actual)}% downtime`,
            }),
          )
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(this.downtimeSuggestionThresholds.isGreaterThan.average)
          .major(this.downtimeSuggestionThresholds.isGreaterThan.major),
      );
  }
}

export default AlwaysBeCasting;
