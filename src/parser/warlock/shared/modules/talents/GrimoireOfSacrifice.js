import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

import SPELLS from 'common/SPELLS';
import { formatPercentage, formatThousands, formatNumber } from 'common/format';
import SpellLink from 'common/SpellLink';

import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

class GrimoireOfSacrifice extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.GRIMOIRE_OF_SACRIFICE_TALENT.id);
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.GRIMOIRE_OF_SACRIFICE_BUFF.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.85,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<>Your uptime on <SpellLink id={SPELLS.GRIMOIRE_OF_SACRIFICE_TALENT.id} /> is too low. If you picked this talent, you should always have your pet sacrificed. If you died or summoned your pet, make sure to sacrifice it again to gain this buff.</>)
          .icon(SPELLS.GRIMOIRE_OF_SACRIFICE_TALENT.icon)
          .actual(i18n._(t('warlock.shared.suggestions.grimoireOfSacrifice.uptime')`${formatPercentage(actual)} % Grimoire of Sacrifice uptime.`))
          .recommended(`>= ${formatPercentage(recommended)} % is recommended`));
  }

  statistic() {
    const spell = this.abilityTracker.getAbility(SPELLS.GRIMOIRE_OF_SACRIFICE_DAMAGE.id);
    const damage = spell.damageEffective + spell.damageAbsorbed;
    const dps = damage / this.owner.fightDuration * 1000;
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(4)}
        size="small"
        tooltip={(
          <>
            {formatThousands(damage)} damage<br />
            Buff uptime: {formatPercentage(this.uptime)} %
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.GRIMOIRE_OF_SACRIFICE_TALENT}>
          {formatNumber(dps)} DPS <small>{formatPercentage(this.owner.getPercentageOfTotalDamageDone(damage))} % of total</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
export default GrimoireOfSacrifice;
