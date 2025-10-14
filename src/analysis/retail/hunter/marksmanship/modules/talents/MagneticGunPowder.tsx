import SpellUsable from 'parser/shared/modules/SpellUsable';
import Events from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import { TALENTS_HUNTER } from 'common/TALENTS';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

class MagneticGunPowder extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilities: Abilities,
  };

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_HUNTER.MAGNETIC_GUNPOWDER_TALENT);
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.PRECISE_SHOTS),
      this.onPSRemoved,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_HUNTER.AIMED_SHOT_TALENT),
      this.onAimedCast,
    );
  }

  onAimedCast() {
    if (
      this.selectedCombatant.hasBuff(SPELLS.LOCK_AND_LOAD_BUFF.id) &&
      this.spellUsable.isOnCooldown(TALENTS_HUNTER.EXPLOSIVE_SHOT_TALENT.id)
    ) {
      this.spellUsable.reduceCooldown(TALENTS_HUNTER.EXPLOSIVE_SHOT_TALENT.id, 8000);
    }
  }

  onPSRemoved() {
    // Windrunner Quiver makes PS stack twice, but doesn't actually log the buff stacks so just assume they consumed 2x PS.
    const base = this.selectedCombatant.hasTalent(TALENTS_HUNTER.WINDRUNNER_QUIVER_TALENT)
      ? 4000
      : 2000;

    if (this.spellUsable.isOnCooldown(TALENTS_HUNTER.EXPLOSIVE_SHOT_TALENT.id)) {
      this.spellUsable.reduceCooldown(TALENTS_HUNTER.EXPLOSIVE_SHOT_TALENT.id, base);
    }
  }
}

export default MagneticGunPowder;
