import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import StatTracker from 'parser/shared/modules/StatTracker';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import GlobalCooldown from 'parser/shared/modules/GlobalCooldown';

/**
 * Raptor Strike (or Mongoose Bite) has a chance to make your next
 * Serpent Sting cost no Focus and deal an additional 250% initial damage.
 *
 * Example log: https://www.warcraftlogs.com/reports/pNJbYdLrMW2ynKGa#fight=3&type=damage-done&source=16&translate=true
 */

const TRIGGERING_SPELLS = [
  SPELLS.MONGOOSE_BITE_TALENT.id,
  SPELLS.MONGOOSE_BITE_TALENT_AOTE.id,
  SPELLS.RAPTOR_STRIKE.id,
  SPELLS.RAPTOR_STRIKE_AOTE.id,
];

const DAMAGE_MODIFIER = 2.5;

class VipersVenom extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
    globalCooldown: GlobalCooldown,
  };

  buffedSerpentSting = false;
  bonusDamage = 0;
  procs = 0;
  lastProcTimestamp = 0;
  accumulatedTimeFromBuffToCast = 0;
  currentGCD = 0;
  wastedProcs = 0;
  badRaptorsOrMBs = 0;
  spellKnown = null;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.VIPERS_VENOM_TALENT.id);
    if (this.active) {
      this.spellKnown = this.selectedCombatant.hasTalent(SPELLS.MONGOOSE_BITE_TALENT.id) ? SPELLS.MONGOOSE_BITE_TALENT : SPELLS.RAPTOR_STRIKE;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if ((!TRIGGERING_SPELLS.includes(spellId) && spellId !== SPELLS.SERPENT_STING_SV.id) || !this.selectedCombatant.hasBuff(SPELLS.VIPERS_VENOM_BUFF.id)) {
      return;
    }
    if (spellId === SPELLS.SERPENT_STING_SV.id) {
      this.buffedSerpentSting = true;
      this.currentGCD = this.globalCooldown.getGlobalCooldownDuration(spellId);
      this.accumulatedTimeFromBuffToCast += event.timestamp - this.lastProcTimestamp - this.currentGCD;
      return;
    }
    if (TRIGGERING_SPELLS.includes(spellId)) {
      this.badRaptorsOrMBs++;
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SERPENT_STING_SV.id || !this.buffedSerpentSting) {
      return;
    }
    this.bonusDamage += calculateEffectiveDamage(event, DAMAGE_MODIFIER);
    this.buffedSerpentSting = false;
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.VIPERS_VENOM_BUFF.id) {
      return;
    }
    this.procs++;
    this.lastProcTimestamp = event.timestamp;
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.VIPERS_VENOM_BUFF.id) {
      return;
    }
    this.wastedProcs++;
  }

  get averageTimeBetweenBuffAndUsage() {
    return (this.accumulatedTimeFromBuffToCast / this.procs / 1000).toFixed(2);
  }

  get raptorWithBuffThresholds() {
    return {
      actual: this.badRaptorsOrMBs,
      isGreaterThan: {
        minor: 1,
        average: 2,
        major: 3,
      },
      style: 'number',
    };
  }
  get wastedProcsThresholds() {
    return {
      actual: this.wastedProcs,
      isGreaterThan: {
        minor: 0,
        average: 2,
        major: 4,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.raptorWithBuffThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<>Remember to cast <SpellLink id={SPELLS.SERPENT_STING_SV.id} /> after proccing <SpellLink id={SPELLS.VIPERS_VENOM_TALENT.id} /> before you cast <SpellLink id={this.spellKnown.id} /> again.</>)
        .icon(SPELLS.VIPERS_VENOM_TALENT.icon)
        .actual(`${actual} raptor casts with Viper's Venom buff active`)
        .recommended(`<${recommended} casts is recommended`);
    });
    when(this.wastedProcsThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<>Remember to utilise all your <SpellLink id={SPELLS.VIPERS_VENOM_TALENT.id} /> procs, and to not cast <SpellLink id={this.spellKnown.id} /> before you've spent the <SpellLink id={SPELLS.VIPERS_VENOM_TALENT.id} /> buff.</>)
        .icon(SPELLS.VIPERS_VENOM_TALENT.icon)
        .actual(`${actual} wasted procs of Viper's Venom`)
        .recommended(`<${recommended} is recommended`);
    });
  }

  statistic() {
    let tooltip = `<ul><li>Average time between gaining Viper's Venom buff and using it was <b>${this.averageTimeBetweenBuffAndUsage}</b> seconds. <ul><li>Note: This accounts for the GCD after the ${this.spellKnown.name} proccing Viper's Venom. </li>`;
    tooltip += this.wastedProcs > 0 ? `<li>You wasted ${this.wastedProcs} procs by gaining a new proc, whilst your current proc was still active.</li>` : ``;
    tooltip += `</ul></li></ul>`;
    return (
      <TalentStatisticBox
        talent={SPELLS.VIPERS_VENOM_TALENT.id}
        value={<>
          {this.procs} / {this.wastedProcs + this.procs} procs used<br />
          <ItemDamageDone amount={this.bonusDamage} />
        </>}
        tooltip={tooltip}
      />
    );
  }

}

export default VipersVenom;
