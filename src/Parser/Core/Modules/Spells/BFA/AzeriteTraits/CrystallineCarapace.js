import React from 'react';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';
import Analyzer from 'Parser/Core/Analyzer';
import { calculateAzeriteEffects } from 'common/stats';
import SPELLS from 'common/SPELLS';

export function crystallineCarapaceStats(combatant) {
  if(!combatant.hasTrait(SPELLS.CRYSTALLINE_CARAPACE.id)) {
    return null;
  }
  let armor = 0;
  let thornDamage = 0;
  for(const rank of combatant.traitsBySpellId[SPELLS.CRYSTALLINE_CARAPACE.id]) {
    const [td, ar] = calculateAzeriteEffects(SPELLS.CRYSTALLINE_CARAPACE.id, rank);
    armor += ar;
    thornDamage += td;
  }

  return {armor, thornDamage};
}

export const STAT_TRACKER = {
  armor: (combatant) => crystallineCarapaceStats(combatant).armor,
  thornDamage: (combatant) => crystallineCarapaceStats(combatant).thornDamage,
};

class CrystallineCarapace extends Analyzer {
  armor = 0;
  thornDamage = 0;
  constructor(...args) {
    super(...args);
    const resp = crystallineCarapaceStats(this.selectedCombatant);
    console.log(resp);

    if(resp === null) {
      this.active = false;
      return;
    }
    const {armor, thornDamage} = resp;
    this.armor += armor;
    this.thornDamage += thornDamage;
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.CRYSTALLINE_CARAPACE_BUFF.id) / this.owner.fightDuration;
  }

  get avgArmor() {
    return this.uptime * this.armor;
  }

  get avgThornDamage() {
    return this.uptime * this.thornDamage;
  }

  _hitsMitigated = 0;
  _totalHits = 0;
  get pctHitsMitigated() {
    return this._hitsMitigated / this._totalHits;
  }

  _totalThornDamage = 0;
  _totalDamage = 0;


  on_byPlayer_damage(event) {
     const spellId = event.ability.guid;
     if (SPELLS.CRYSTALLINE_CARAPACE_DAMAGE.id === spellId) {
        this._totalThornDamage += event.amount;
     }
  }


  on_toPlayer_damage(event) {
    if(event.sourceIsFriendly) {
      return;
    }
    this._totalHits += 1;
    this._hitsMitigated += this.selectedCombatant.hasBuff(SPELLS.CRYSTALLINE_CARAPACE_BUFF.id) ? 1 : 0;
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.CRYSTALLINE_CARAPACE.id} />}
        value={(
            <React.Fragment>
            {formatNumber(this.avgArmor)} Avg. Armor<br />
            {formatNumber(this._totalThornDamage)} Dmg
            </React.Fragment>
        )}
        label={"Stats from Crystalline Carapace"}
        tooltip={`Crystalline Carapace grants <b>${this.armor} Armor</b> and <b>${this.thornDamage} Thorn Damage</b> while active.<br/>It was active for <b>${formatPercentage(this.uptime)}%</b> of the fight, mitigating <b>${formatPercentage(this.pctHitsMitigated)}%</b> of incoming hits.<br/>Thorns dealt <b>${this._totalThornDamage}</b> damage.`}
        />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default CrystallineCarapace;
