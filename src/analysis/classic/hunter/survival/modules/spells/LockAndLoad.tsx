import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import SPELLS from 'common/SPELLS/classic/hunter';

const deps = {
  spellUsable: SpellUsable,
};

export default class LockAndLoad extends Analyzer.withDependencies(deps) {
  private _totalTriggers = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.EXPLOSIVE_SHOT),
      this._handleExplosiveShot,
    );
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.LOCK_AND_LOAD),
      this._buffApplied,
    );
  }

  private _handleExplosiveShot() {
    if (this.selectedCombatant.hasBuff(SPELLS.LOCK_AND_LOAD.id)) {
      this.deps.spellUsable.endCooldown(SPELLS.EXPLOSIVE_SHOT.id);
    }
  }

  private _buffApplied() {
    this._totalTriggers += 1;
    this.deps.spellUsable.endCooldown(SPELLS.EXPLOSIVE_SHOT.id);
  }

  get triggerCount() {
    return this._totalTriggers;
  }
}
