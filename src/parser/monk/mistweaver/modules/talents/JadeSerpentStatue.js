import SPELLS from 'common/SPELLS';

import Analyzer from 'parser/core/Analyzer';

class JadeSerpentStatue extends Analyzer {

  healing = 0;
  overHealing = 0;
  casts = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SUMMON_JADE_SERPENT_STATUE_TALENT.id);
  }

  on_applybuff(event) {
    if (event.ability.guid === SPELLS.SOOTHING_MIST_STATUE.id) {
      this.casts += 1;
    }
  }

  on_heal(event) {
    if (event.ability.guid === SPELLS.SOOTHING_MIST_STATUE.id) {
      this.healing += (event.amount || 0) + (event.absorbed || 0);
      this.overHealing += event.overheal || 0;
    }

  }

  get jadeSerpentStatueOverHealing() {
    return (this.overHealing / (this.healing + this.overHealing)).toFixed(4) || 0;
  }

}

export default JadeSerpentStatue;
