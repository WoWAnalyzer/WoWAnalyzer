import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { Options } from 'parser/core/Module';
import SPELLS from 'common/SPELLS';
import Events, { ApplyBuffEvent } from 'parser/core/Events';
import { TALENTS_DRUID } from 'common/TALENTS';

/**
 * **Gore**
 * Spec Talent
 *
 * Thrash, Swipe, Moonfire, and Maul have a 15% chance to reset the cooldown on Mangle,
 * and to cause it to generate an additional 4 Rage.
 */
export default class Gore extends Analyzer.withDependencies({ spellUsable: SpellUsable }) {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.GORE_TALENT);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.GORE_BEAR),
      this.onApplyGore,
    );
  }

  onApplyGore(_: ApplyBuffEvent) {
    this.deps.spellUsable.endCooldown(SPELLS.MANGLE_BEAR.id);
  }
}
