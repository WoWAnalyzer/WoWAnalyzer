import SPELLS from 'common/SPELLS';
// import { SpellLink } from 'interface/';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
// import { SubSection } from 'interface/guide';

class Rapture extends Analyzer {
  raptureBuffActive = false;
  raptureShields = 0;
  rapturesUnderThreshold = 0;
  shieldCasts: Array<{ casts: [CastEvent] }>;

  constructor(options: Options) {
    super(options);
    this.active = !this.selectedCombatant.hasTalent(SPELLS.SPIRIT_SHELL_TALENT);
    this.shieldCasts = [];

    if (!this.active) {
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.checkRapture);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.RAPTURE), this.applyRapture);
    this.addEventListener(
      Events.removebuff.spell(SPELLS.RAPTURE).by(SELECTED_PLAYER),
      this.raptureRemoved,
    );
  }

  private checkRapture(event: CastEvent) {
    if (!this.raptureBuffActive) {
      return;
    }

    if (
      this.raptureBuffActive &&
      (event.ability.guid === SPELLS.RAPTURE.id ||
        event.ability.guid === SPELLS.POWER_WORD_SHIELD.id)
    ) {
      this.raptureShields += 1;
    }

    this.shieldCasts[this.shieldCasts?.length - 1]?.casts.push(event);
  }

  applyRapture(event: CastEvent) {
    this.raptureBuffActive = true;
    this.shieldCasts.push({ casts: [event] });
    this.raptureShields += 1;
    console.log(this.shieldCasts);
  }

  raptureRemoved() {
    if (this.raptureShields < 7) {
      this.rapturesUnderThreshold += 3;
    }
    this.raptureShields = 0;

    this.raptureBuffActive = false;
  }

  get suggestionThresholds() {
    return {
      actual: this.rapturesUnderThreshold,
      isGreaterThan: {
        minor: 0,
        average: 1,
        major: 2,
      },
      style: ThresholdStyle.NUMBER,
    };
  }
}
// export function RampSection(()

//   return (
//     <SubSection title = "Main Ramp" >
//     <p></p>
//     </SubSection>
//   )
// )

export default Rapture;
