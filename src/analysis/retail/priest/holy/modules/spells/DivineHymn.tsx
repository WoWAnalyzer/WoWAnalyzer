import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';

class DivineHymn extends Analyzer {
  healing = 0;
  ticks = 0;
  overhealing = 0;
  absorbed = 0;
  casts = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.DIVINE_HYMN_HEAL),
      this.onHeal,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.DIVINE_HYMN_TALENT),
      this.onCast,
    );
  }

  onHeal(event: HealEvent) {
    this.healing += event.amount || 0;
    this.overhealing += event.overheal || 0;
    this.absorbed += event.absorbed || 0;
    if (event.sourceID === event.targetID) {
      this.ticks += 1;
    }
  }

  onCast(event: CastEvent) {
    this.casts += 1;
  }
}

export default DivineHymn;
