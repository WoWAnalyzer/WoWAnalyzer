import SpellUsable from 'parser/shared/modules/SpellUsable';
import Events from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import { TALENTS_HUNTER } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

const REDUCTION_MS = 1000;
const AVIAN_SPEC_COOLDOWN_MS = 1500;

class TargetAcquisition extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilities: Abilities,
  };

  protected spellUsable!: SpellUsable;
  private lastAvianProcTimestamp = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_HUNTER.TARGET_ACQUISITION_TALENT);

    if (this.selectedCombatant.hasTalent(TALENTS_HUNTER.AVIAN_SPECIALIZATION_TALENT)) {
      const markSpell = this.selectedCombatant.hasTalent(TALENTS_HUNTER.SENTINEL_TALENT)
        ? SPELLS.SENTINELS_MARK_DEBUFF
        : SPELLS.SPOTTERS_MARK_DEBUFF;

      this.addEventListener(
        Events.removedebuff.by(SELECTED_PLAYER).spell(markSpell),
        this.onMarkRemoved,
      );
    }
  }

  private onMarkRemoved(event: { timestamp: number }) {
    if (event.timestamp - this.lastAvianProcTimestamp < AVIAN_SPEC_COOLDOWN_MS) {
      return;
    }
    this.lastAvianProcTimestamp = event.timestamp;
    this.spellUsable.reduceCooldown(TALENTS_HUNTER.AIMED_SHOT_TALENT.id, REDUCTION_MS);
  }
}

export default TargetAcquisition;
