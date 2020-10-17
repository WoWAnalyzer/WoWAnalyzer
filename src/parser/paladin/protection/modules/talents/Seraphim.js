import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Abilities from 'parser/core/modules/Abilities';
import { formatPercentage } from 'common/format';
import Events from 'parser/core/Events';

/**
 * Consumes up to 2 SotR charges to provice 1007 Haste+Vers+Mastery+Crit for 8sec per consumed charge
*/

const SERAPHIM_STAT_BUFF = 1007;

class Seraphim extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilities: Abilities,
  };

  lastCDConsumed = null;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SERAPHIM_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SERAPHIM_TALENT), this.onCast);
  }

  sotrCooldown() {
    if(this.spellUsable.isOnCooldown(SPELLS.SHIELD_OF_THE_RIGHTEOUS.id)) {
      return this.spellUsable.cooldownRemaining(SPELLS.SHIELD_OF_THE_RIGHTEOUS.id);
    } else {
      return 0;
    }
  }

  onCast(event) {
    const expectedCd = this.abilities.getExpectedCooldownDuration(SPELLS.SHIELD_OF_THE_RIGHTEOUS.id, event);
    const chargesAtCast = 3 - this.sotrCooldown() / expectedCd;
    this.lastCDConsumed = expectedCd * Math.min(2, chargesAtCast);

    //should end up always with 0 charges when cast with <2 charges (seraphim can consume charges that are not fully recharges)
    //proper tracking of SotR charges used by seraphim only possible once SotR charges are 100% accurate
    this.spellUsable.beginCooldown(SPELLS.SHIELD_OF_THE_RIGHTEOUS.id, event);
    this.spellUsable.beginCooldown(SPELLS.SHIELD_OF_THE_RIGHTEOUS.id, event);
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.SERAPHIM_TALENT.id) / this.owner.fightDuration;
  }

  statistic() {

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SERAPHIM_TALENT.id} />}
        value={`${ formatPercentage(this.uptime) }%`}
        label="Seraphim uptime"
        tooltip={`Resulting in an average stat increase of ${(SERAPHIM_STAT_BUFF * this.uptime).toFixed(0)} Haste, Critical Strike, Mastery, and Versatility`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(3);

}

export default Seraphim;
