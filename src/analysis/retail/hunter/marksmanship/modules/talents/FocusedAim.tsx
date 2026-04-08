import SpellUsable from 'parser/shared/modules/SpellUsable';
import Events, { RemoveBuffEvent, RemoveBuffStackEvent } from 'parser/core/Events';
import { TALENTS_HUNTER } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

const REDUCTION_MS = 2000;

class FocusedAim extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_HUNTER.FOCUSED_AIM_TALENT);
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.PRECISE_SHOTS_BUFF),
      this.onPSRemoved,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.PRECISE_SHOTS_BUFF),
      this.onPSRemoved,
    );
  }

  private onPSRemoved(event: RemoveBuffEvent | RemoveBuffStackEvent) {
    if (this.spellUsable.isOnCooldown(TALENTS_HUNTER.AIMED_SHOT_TALENT.id)) {
      this.spellUsable.reduceCooldown(
        TALENTS_HUNTER.AIMED_SHOT_TALENT.id,
        REDUCTION_MS,
        event.timestamp,
      );
    }
  }
}

export default FocusedAim;
