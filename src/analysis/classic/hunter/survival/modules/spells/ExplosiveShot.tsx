import Analyzer, { Options } from 'parser/core/Analyzer';
import LockAndLoad from './LockAndLoad';
import Abilities from '../features/Abilities';
import SPELLS from 'common/SPELLS/classic/hunter';

const deps = {
  lnl: LockAndLoad,
  abilities: Abilities,
};

export default class ExplosiveShot extends Analyzer.withDependencies(deps) {
  constructor(options: Options) {
    super(options);
    const ability = this.deps.abilities.getAbility(SPELLS.EXPLOSIVE_SHOT.id);

    // this overrides the max cast calculation because frequent cd resets break the normal calculation
    // the logic is:
    // - regular non-reset cooldown, plus
    // - 1 cast for having ES on cooldown when LnL procs, plus
    // - 2 casts (one per LnL stack)
    if (ability?.castEfficiency) {
      ability.castEfficiency.maxCasts = () =>
        this.owner.fightDuration / (ability.cooldown * 1000) + 3 * this.deps.lnl.triggerCount;
    }
  }
}
