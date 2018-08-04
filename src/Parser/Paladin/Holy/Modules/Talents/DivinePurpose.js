import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';

class DivinePurpose extends Analyzer {
  static dependencies = {    
    abilityTracker: AbilityTracker,
    spellUsable: SpellUsable,
  };

  constructor(...args) {
    super(...args);
    const hasDivinePurpose = this.selectedCombatant.hasTalent(SPELLS.DIVINE_PURPOSE_TALENT_HOLY.id);
    const hasSoulOfTheHighlord = this.selectedCombatant.hasFinger(ITEMS.SOUL_OF_THE_HIGHLORD.id);
    this.active = hasDivinePurpose || hasSoulOfTheHighlord;
  }

  on_toPlayer_applybuff(event) {
    this.handleProc(event);
  }
  on_toPlayer_refreshbuff(event) {
    this.handleProc(event);
  }
  holyShockProcs = 0;
  lightOfDawnProcs = 0;
  handleProc(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.DIVINE_PURPOSE_HOLY_SHOCK_BUFF.id) {
      this.holyShockProcs += 1;
      if (this.spellUsable.isOnCooldown(SPELLS.HOLY_SHOCK_CAST.id)) {
        this.spellUsable.endCooldown(SPELLS.HOLY_SHOCK_CAST.id);
      }
    }
    if (spellId === SPELLS.DIVINE_PURPOSE_LIGHT_OF_DAWN_BUFF.id) {
      this.lightOfDawnProcs += 1;
      if (this.spellUsable.isOnCooldown(SPELLS.LIGHT_OF_DAWN_CAST.id)) {
        this.spellUsable.endCooldown(SPELLS.LIGHT_OF_DAWN_CAST.id);
      }
    }
  }

  statistic() {
    const abilityTracker = this.abilityTracker;
    const getAbility = spellId => abilityTracker.getAbility(spellId);

    const lightOfDawnCast = getAbility(SPELLS.LIGHT_OF_DAWN_CAST.id);
    const holyShockHeal = getAbility(SPELLS.HOLY_SHOCK_HEAL.id);

    const lightOfDawnHeals = lightOfDawnCast.casts || 0;
    const holyShockHeals = holyShockHeal.healingHits || 0;

    return (
      <StatisticBox
        position={STATISTIC_ORDER.OPTIONAL(75)}
        icon={<SpellIcon id={SPELLS.DIVINE_PURPOSE_TALENT_HOLY.id} />}
        value={(
          <span>
            {this.holyShockProcs}{' '}
            <SpellIcon
              id={SPELLS.HOLY_SHOCK_CAST.id}
              style={{
                height: '1.3em',
                marginTop: '-.1em',
              }}
            />
            {' '}
            {this.lightOfDawnProcs}{' '}
            <SpellIcon
              id={SPELLS.LIGHT_OF_DAWN_CAST.id}
              style={{
                height: '1.3em',
                marginTop: '-.1em',
              }}
            />
          </span>
        )}
        label="Divine Purpose procs"
        tooltip={`Your Divine Purpose proc rate for Holy Shock was ${formatPercentage(this.holyShockProcs / (holyShockHeals - this.holyShockProcs))}%.<br />Your Divine Purpose proc rate for Light of Dawn was ${formatPercentage(this.lightOfDawnProcs / (lightOfDawnHeals - this.lightOfDawnProcs))}%`}
      />
    );
  }
}

export default DivinePurpose;
