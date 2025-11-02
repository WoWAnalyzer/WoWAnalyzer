import { HolyPowerTracker } from 'analysis/retail/paladin/shared';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffStackEvent, CastEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import GlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import TALENTS from 'common/TALENTS/paladin';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';

const CAST_BUFFER = 500;

class Crusade extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    globalCooldown: GlobalCooldown,
    holyPowerTracker: HolyPowerTracker,
  };

  protected abilityTracker!: AbilityTracker;
  protected globalCooldown!: GlobalCooldown;
  protected holyPowerTracker!: HolyPowerTracker;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.CRUSADE_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.CRUSADE_TALENT),
      this.onCrusadeCast,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(TALENTS.CRUSADE_TALENT),
      this.onCrusadeBuffStack,
    );
  }

  crusadeCastTimestamp?: number;
  badFirstGlobal = 0;
  gcdBuffer = 0;

  onCrusadeCast(event: CastEvent) {
    this.crusadeCastTimestamp = event.timestamp;
    this.gcdBuffer = this.globalCooldown.getGlobalCooldownDuration(TALENTS.CRUSADE_TALENT.id);
    if (this.holyPowerTracker.current < 3) {
      addInefficientCastReason(
        event,
        'Make sure to have at least 3 Holy Power before using Crusade. Ideally you should have 5 Holy Power before using Crusade after your first use.',
      );
    }
  }

  onCrusadeBuffStack(event: ApplyBuffStackEvent) {
    if (
      this.crusadeCastTimestamp &&
      event.timestamp > this.crusadeCastTimestamp + CAST_BUFFER + this.gcdBuffer
    ) {
      this.badFirstGlobal += 1;
    }
    this.crusadeCastTimestamp = undefined;
  }

  get badGlobalPercent() {
    return this.badFirstGlobal / this.abilityTracker.getAbility(TALENTS.CRUSADE_TALENT.id).casts;
  }

  get suggestionThresholds() {
    return {
      actual: 1 - this.badGlobalPercent,
      isLessThan: {
        minor: 1,
        average: 0.75,
        major: 0.5,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
}

export default Crusade;
