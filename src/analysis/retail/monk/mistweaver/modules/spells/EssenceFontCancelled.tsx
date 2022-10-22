import { t } from '@lingui/macro';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, EndChannelEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Combatants from 'parser/shared/modules/Combatants';
import Haste from 'parser/shared/modules/Haste';

class EssenceFontCancelled extends Analyzer {
  static dependencies = {
    haste: Haste,
    combatants: Combatants,
  };

  protected combatants!: Combatants;
  protected haste!: Haste;

  expected_duration: number = 0;
  cancelled_ef: number = 0;
  hasUpwelling: boolean = false;
  cancelDelta: number = 100;
  last_ef_time: number = 0;
  last_ef: CastEvent | null;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.ESSENCE_FONT_TALENT),
      this.castEssenceFont,
    );

    this.addEventListener(
      Events.EndChannel.by(SELECTED_PLAYER).spell(TALENTS_MONK.ESSENCE_FONT_TALENT),
      this.handleEndChannel,
    );
    this.hasUpwelling = this.selectedCombatant.hasTalent(TALENTS_MONK.UPWELLING_TALENT.id);
    this.last_ef = null;
  }

  castEssenceFont(event: CastEvent) {
    let extra_secs = 0;
    if (this.hasUpwelling) {
      extra_secs = Math.min(
        (event.timestamp - (this.last_ef_time + 12000)) / 6000, //12000 is the cooldown of EF in MS and 6000 corresponds to the number of MS for UW to get a full second in channels
        3,
      );
    }
    this.expected_duration = (3000 + extra_secs * 1000) / (1 + this.haste.current!);
    // TFT ef has half duration
    if (this.combatants.players[event.sourceID].hasBuff(TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT.id)) {
      this.expected_duration /= 2;
    }
    this.last_ef_time = event.timestamp;
    this.last_ef = event;
  }

  handleEndChannel(event: EndChannelEvent) {
    if (event.duration < this.expected_duration - this.cancelDelta) {
      this.cancelled_ef += 1;
      if (this.last_ef != null) {
        this.last_ef.meta = this.last_ef.meta || {};
        this.last_ef.meta.isInefficientCast = true;
        this.last_ef.meta.inefficientCastReason = `This Essence Font cast was canceled early.`;
      } else {
        console.log(
          'Last Essence Font is null when detecting cancellation, when event is ' + event,
        );
      }
    }
  }

  get suggestionThresholds() {
    return {
      actual: this.cancelled_ef,
      isGreaterThanOrEqual: {
        major: 1,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(<>You cancelled Essence Font</>)
        .icon(TALENTS_MONK.ESSENCE_FONT_TALENT.icon)
        .actual(
          `${this.cancelled_ef} ${t({
            id: 'monk.mistweaver.suggestions.essenceFont.cancelledCasts',
            message: ` cancelled casts`,
          })}`,
        )
        .recommended(`0 cancelled casts is recommended`),
    );
  }
}

export default EssenceFontCancelled;
