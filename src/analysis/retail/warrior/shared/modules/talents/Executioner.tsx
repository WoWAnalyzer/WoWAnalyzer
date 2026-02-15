import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/warrior';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';
import Events, { CastEvent } from 'parser/core/Events';
import SPECS from 'game/SPECS';
import SpellUsable from 'parser/shared/modules/SpellUsable';

class Executioner extends Analyzer.withDependencies({
  spellUsable: SpellUsable,
}) {
  constructor(options: Options) {
    super(options);
    console.log(this.selectedCombatant.hasTalent(talents.BLADESTORM_TALENT));
    this.active = this.selectedCombatant.hasTalent(talents.BLADESTORM_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.EXECUTE_FURY), // might need to be on damage
      this.onExecute,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.EXECUTE_FURY_MASSACRE), // might need to be on damage
      this.onExecute,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.EXECUTE), // might need to be on damage
      this.onExecute,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.EXECUTE_GLYPHED), // might need to be on damage
      this.onExecute,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BLADESTORM), // might need to be on damage
      this.onBladestorm,
    );
  }

  onExecute(event: CastEvent) {
    const executionerStacks = this.selectedCombatant.getBuffStacks(SPELLS.EXECUTIONER_TALENT_BUFF);
    console.log(executionerStacks);

    this.deps.spellUsable.reduceCooldown(SPELLS.BLADESTORM.id, executionerStacks * 5000);
  }

  onBladestorm(event: CastEvent) {
    // fury bladestorm
    if (this.selectedCombatant.spec === SPECS.FURY_WARRIOR) {
      if (!this.selectedCombatant.hasBuff(SPELLS.ENRAGE)) {
        addInefficientCastReason(event, 'Bladestorm was used while not enraged');
      }
    }

    // maybe some CS nonsense for arms
  }
}

export default Executioner;
