import SpellUsable from 'parser/shared/modules/SpellUsable';
import Events from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import { TALENTS_HUNTER } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

const REDUCTION_MS = 750;

class FocusedAim extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilities: Abilities,
  };

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_HUNTER.FOCUSED_AIM_TALENT);
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.PRECISE_SHOTS),
      this.onPSRemoved,
    );
  }

  private onPSRemoved() {
    this.spellUsable.reduceCooldown(TALENTS_HUNTER.AIMED_SHOT_TALENT.id, REDUCTION_MS);
    if (this.selectedCombatant.hasTalent(TALENTS_HUNTER.WINDRUNNER_QUIVER_TALENT)) {
      this.spellUsable.reduceCooldown(TALENTS_HUNTER.AIMED_SHOT_TALENT.id, REDUCTION_MS * 2);
    }
  }
}

export default FocusedAim;
